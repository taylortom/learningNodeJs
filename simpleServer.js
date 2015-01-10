var http = require("http");

function handleIncomingRequest(req, res) {
    console.log("INCOMING REQUEST: " + req.method + ": " + req.url);

    var body = "Thanks for calling!\n";
    var contentLength = body.length;

    res.writeHead(200, {
        "Content-Length": contentLength,
        "Content-Type": "application/json"
    });
    res.end(body);
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);
