var fs = require("fs");
var http = require("http");

var encoding = "utf8";

function handleIncomingRequest(req, res) {
    if(req.method.toLowerCase() == "get"
    && req.url.substring(0,9) == "/content/") {
        serveStaticFile(req.url.substring(9), res);
    }
    else {
        outputError(req.url, res);
    }
}

function serveStaticFile(filename, res) {
    fs.exists(filename, function(exists) {
        if(!exists) {
            outputError(filename, res);
        }
        else {
            var rs = fs.createReadStream(filename);

            rs.on("error", function(err) {
                res.end();
            });

            res.writeHead(200, { "Content-Type": contentTypeForPath(filename) });
            rs.pipe(res);
        }
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

function outputError(file, res) {
    res.writeHead(404, { "Content-Type": "application/json" });
    var out = { error: "not_found", message: "'" + file + "' not found"};
    res.end(JSON.stringify(out) + "\n");
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);
