var fs = require("fs");
var helpers = require("../helpers.js");

exports.generate = function(req, res) {
    fs.readFile("index.html", function(err, contents) {
        if(err) {
            helpers.sendFailure(res, 500, err);
        }
        else {
            contents = contents.toString(helpers.encoding);
            contents = contents.replace("{{PAGE_NAME}}", req.params.pageName);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(contents);
        }
    });
}
