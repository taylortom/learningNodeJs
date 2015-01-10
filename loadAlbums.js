var http = require("http");
var fs = require("fs");

/**
* Notes:
* Assumption throughout that any dir in 'albums' is an album
*/

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

function loadAlbum(albumName, callback) {
    fs.readdir("albums/" + albumName, function(err, files) {
        if(err) {
            if(err.code == "ENOENT") callback(noSuchAlbum());
            else callback(makeError("file_error", JSON.stringify(err)));
        }
        else {
            var retFiles = [];
            var path = "albums/" + albumName + "/";
            (function iterator(index) {
                if(index == files.length) {
                    var obj = {
                        short_name: albumName,
                        photos: retFiles
                    };
                    callback(null, obj);
                }
                else {
                    fs.stat(path + files[index], function(err, stats) {
                        if(err) {
                            callback(makeError("file_error", JSON.stringify(err)));
                        }
                        else {
                            if(stats.isFile()) {
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

function handleIncomingRequest(req, res) {
    console.log("INCOMING REQUEST: " + req.method + ": " + req.url);

    if(req.url == "/albums.json") {
        handleListAlbums(req, res);
    }
    else if(req.url.substr(0,7) == "/albums" && req.url.substr(req.url.length-5 == ".json")) {
        handleGetAlbum(req, res);
    }
    else {
        sendFailure(res, 404, invalidResource());
    }
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
    // format of request is /albums/album_name.json
    var albumName = req.url.substr(8, req.url.length-13);
    loadAlbum(albumName, function(err, albumContents) {
        if(err && err.error == "no_such_album") sendFailure(res, 404, err);
        else if(err) sendFailure(res, 500, err);
        else sendSuccess(res, { albumData: albumContents });
    });
}

function makeError(err, msg) {
    var e = new Error(msg);
    e.code = err;
    return e;
}

function sendSuccess(res, data) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}

function sendFailure(res, code, err) {
    var errCode = (err.code) ? err.code : err.name;
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
        error: errCode,
        message: err.message
    }) + "\n");
}

function invalidResource() {
    return makeError("invalid_resource", "the requested resource does not exist");
}

function noSuchAlbum() {
    return makeError("no_such_album", "the specified album does not exist");
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);
