var fs = require("fs");
var album = require("./album.js");

exports.version = "1.0.0";

exports.albums = function(root, callback) {
    fs.readdir(root + "/albums", function(err, files) {
        if(err) {
            callback(err);
        }
        else {
            var albumList = [];
            (function iterator(index) {
                if(index == files.length) {
                    callback(null, albumList);
                }
                else {
                    fs.stat(root + "albums/" + files[index], function(err, stats) {
                        if(err) {
                            callback({
                                error: "file_error",
                                message: JSON.stringify(err)
                            });
                        }
                        else {
                            if(stats.isDirectory()) {
                                var p = root + "albums/" + files[index];
                                albumList.push(album.createAlbum(p));
                            }
                            iterator(index+1);
                        }
                    });
                }
            })(0);
        }
    });
}
