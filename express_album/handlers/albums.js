var fs = require("fs");
var helpers = require("../helpers.js");

function loadAlbumList(callback) {
    fs.readdir("albums/", function(err, files) {
        if(err) {
            callback(helpers.makeError("file_error", JSON.stringify(err)));
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
            if(err.code == "ENOENT") callback(helpers.invalidResource());
            else callback(helpers.makeError("file_error", JSON.stringify(err)));
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
                            callback(helpers.makeError("file_error", JSON.stringify(err)));
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

exports.listAll = function(req, res) {
    loadAlbumList(function(err, albums) {
        if(err) {
            helpers.sendFailure(res, 500, err);
        }
        else {
            helpers.sendSuccess(res, { albums: albums });
        }
    });
}

exports.getAlbum = function(req, res) {
    // parse GET data
    //var getp = req.parsedUrl.query;
    var pageNo; // = getp.page ? getp.page : 0;
    var pageSize; // = getp.page_size ? getp.page_size : 1000;

    if(isNaN(parseInt(pageNo))) pageNo = 0;
    if(isNaN(parseInt(pageSize))) pageSize = 1000;

    // format of request is /albums/album_name.json
    loadAlbum(req.params.albumName, pageNo, pageSize, function(err, albumContents) {
        if(err && err.error == "no_such_album") helpers.sendFailure(res, 404, err);
        else if(err) helpers.sendFailure(res, 500, err);
        else helpers.sendSuccess(res, { albumData: albumContents });
    });
}
