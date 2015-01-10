var http = require("http");
var fs = require("fs");

function loadAlbumList(callback) {
    fs.readdir("albums/", function(err, files) {
        if(err) {
            console.log(err);
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

function handleIncomingRequest(req, res) {
    console.log("INCOMING REQUEST: " + req.method + ": " + req.url);

    loadAlbumList(function(err, albums) {
        if(err) {
            res.writeHead(503, { "Content-Type": "application/json" });
            res.end(JSON.stringify(err) + "\n");
        }
        else {
            var output = {
                error: null,
                data: { albums: albums }
            };
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(output) + "\n");
        }
    });
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);
