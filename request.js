var http = require("http");

function handleIncomingRequest(req, res) {
    console.log("------------------------------------------");
    console.log(req);
    console.log("------------------------------------------");
    console.log(res);
    console.log("------------------------------------------");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: null }) + "\n");
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);
