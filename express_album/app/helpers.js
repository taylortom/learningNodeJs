exports.encoding = "utf8";

exports.sendSuccess = function(res, data) {
    res.writeHead(200, { "Content-Type": "application/json" });
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}

exports.sendFailure = function(res, code, err) {
    var errCode = (err.code) ? err.code : err.name;
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: errCode, message: err.message }) + "\n");
}

exports.makeError = function(err, msg) {
    var e = new Error(msg);
    e.code = err;
    return e;
}

exports.invalidResource = function() {
    return exports.makeError("invalid_resource", "the requested resource does not exist");
}
