var path = require("path");
var fs = require("fs");

function Album(albumPath) {
    this.name = path.basename(albumPath);
    this.path = albumPath;
}

Album.prototype.name = null;
Album.prototype.path = null;
Album.prototype._photos = null;

Album.prototype.photos = function(callback) {
    if(this._photos != null) {
        callback(null, this._photos)
    }
    else {
        var self = this;
        fs.readdir(self.path, function(err, files) {
            if(err) {
                if(err.code == "ENOENT") callback(noSuchAlbum());
                else callback({ error:"file_error", message:JSON.stringify(err) });
            }
            else {
                var onlyFiles = [];
                (function iterator(index) {
                    if(index == files.length) {
                        self._photos = onlyFiles;
                        callback(null, self._photos);
                    }
                    else {
                        fs.stat(self.path + "/" + files[index], function(err, stats) {
                            if(err) {
                                callback({ error:"file_error", message:JSON.stringify(err) });
                            }
                            else {
                                if(stats.isFile()) onlyFiles.push(files[index]);
                                iterator(index+1);
                            }
                        });
                    }
                })(0);
            }
        });
    }
}

function noSuchAlbum() {
    return {
        error: "no_such_album",
        message: "the specified album does not exist"
    };
}

exports.createAlbum = function(path) {
    return new Album(path);
}
