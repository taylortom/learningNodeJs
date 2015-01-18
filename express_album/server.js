var async = require("async");
var express = require("express");
var fs = require("fs");
var path = require("path");

var app = express();
var encoding = "utf8";

// routes
app.get("/v1/albums.json", handleListAlbums);
app.get("/v1/albums/:albumName.json", handleGetAlbum);
app.get("/v1/albums/:albumName/:filename", function(req, res) {
    serveStaticFile(req.url.substring(4), res);
});
app.get("/content/:filename", function(req, res) {
    serveStaticFile("content/" + req.params.filename, res);
});
app.get("/templates/:templateName", function(req, res) {
    serveStaticFile("templates/" + req.params.templateName, res);
});
app.get("/pages/:pageName", servePage);
app.get("/pages/:pageName/:subPage", servePage);
app.get("*", function(req, res) {
    sendFailure(res, 404, invalidResource());
});

function serveStaticFile(filename, res) {
    fs.exists(filename, function(exists) {
        if(!exists) {
            sendFailure(res, 404, invalidResource());
        }
        else {
            var rs = fs.createReadStream(filename);
            rs.on("error", function(err) { res.end(); });
            res.writeHead(200, { "Content-Type": contentTypeForPath(filename) });
            rs.pipe(res);
        }
    });
}

function servePage(req, res) {
    fs.readFile("index.html", function(err, contents) {
        if(err) {
            sendFailure(res, 500, err);
        }
        else {
            contents = contents.toString(encoding);
            contents = contents.replace("{{PAGE_NAME}}", req.params.pageName);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents);
        }
    });
}

function loadAlbumList(callback) {
    fs.readdir("albums/", function(err, files) {
        if(err) {
            callback(makeError("file_error", JSON.stringify(err)));
        }
        else {
            var dirs = [];
            (function iterator(index) {
                if(index == files.length) {
                    callback(null, dirs);
                }
                else {
                    fs.stat("albums/" + files[index], function(err, stats) {
                        if(err) {
                            callback(err);
                        }
                        else {
                            if(stats.isDirectory()) dirs.push(files[index]);
                        }
                        iterator(index+1);
                    });
                }
            })(0);
        }
    });
}

function loadAlbum(albumName, page, pageSize, callback) {
    var path = "albums/" + albumName + "/";
    fs.readdir(path, function(err, files) {
        if(err) {
            if(err.code == "ENOENT") callback(noSuchAlbum());
            else callback(makeError("file_error", JSON.stringify(err)));
        }
        else {
            var retFiles = [];
            (function iterator(index) {
                if(index == files.length) {
                    var sf = retFiles.splice(page*pageSize, pageSize);
                    var obj = {
                        short_name: albumName,
                        photos: sf
                    };
                    callback(null, obj);
                }
                else {
                    fs.stat(path + files[index], function(err, stats) {
                        if(err) {
                            callback(makeError("file_error", JSON.stringify(err)));
                        }
                        else {
                            if(stats.isFile() && (files[index].charAt(0) !== ".")) {
                                var obj = {
                                    filename: files[index],
                                    desc: files[index]
                                };
                                retFiles.push(obj);
                            }
                        }
                        iterator(index+1);
                    });
                }
            })(0);
        }
    });
}

function handleListAlbums(req, res) {
    loadAlbumList(function(err, albums) {
        if(err) {
            sendFailure(res, 500, err);
        }
        else {
            sendSuccess(res, { albums: albums });
        }
    });
}

function handleGetAlbum(req, res) {
    // parse GET data
    //var getp = req.parsedUrl.query;
    var pageNo; // = getp.page ? getp.page : 0;
    var pageSize; // = getp.page_size ? getp.page_size : 1000;

    if(isNaN(parseInt(pageNo))) pageNo = 0;
    if(isNaN(parseInt(pageSize))) pageSize = 1000;

    // format of request is /albums/album_name.json
    loadAlbum(req.params.albumName, pageNo, pageSize, function(err, albumContents) {
        if(err && err.error == "no_such_album") sendFailure(res, 404, err);
        else if(err) sendFailure(res, 500, err);
        else sendSuccess(res, { albumData: albumContents });
    });
}

function contentTypeForPath(path) {
    var ext = (path.substring(path.lastIndexOf(".")+1)).toLowerCase();
    switch(ext) {
        case "html":
            return "text/html";
        case "js":
            return "text/javascript";
        case "css":
            return "text/css";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        default:
            return "text/plain";
    }
}

function sendSuccess(res, data) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}

function sendFailure(res, code, err) {
    var errCode = (err.code) ? err.code : err.name;
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: errCode, message: err.message }) + "\n");
}

// errors

function makeError(err, msg) {
    var e = new Error(msg);
    e.code = err;
    return e;
}

function invalidResource() {
    return makeError("invalid_resource", "the requested resource does not exist");
}

app.listen(8080);
