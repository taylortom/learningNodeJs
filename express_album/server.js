var async = require("async");
var express = require("express");
var fs = require("fs");
var path = require("path");

var albm_hdlr = require("./handlers/albums.js");
var pg_hdlr = require("./handlers/pages.js");
var helpers = require("./helpers.js");

var app = express();

// routes
app.get("/v1/albums.json", albm_hdlr.listAll);
app.get("/v1/albums/:albumName.json", albm_hdlr.getAlbum);
app.get("/v1/albums/:albumName/:filename", function(req, res) {
    serveStaticFile(req.url.substring(4), res);
});
app.get("/content/:filename", function(req, res) {
    serveStaticFile("content/" + req.params.filename, res);
});
app.get("/templates/:templateName", function(req, res) {
    serveStaticFile("templates/" + req.params.templateName, res);
});
app.get("/pages/:pageName", pg_hdlr.generate);
app.get("/pages/:pageName/:subPage", pg_hdlr.generate);
app.get("*", function(req, res) {
    helpers.sendFailure(res, 404, helpers.invalidResource());
});

function serveStaticFile(filename, res) {
    fs.exists(filename, function(exists) {
        if(!exists) {
            helpers.sendFailure(res, 404, helpers.invalidResource());
        }
        else {
            var rs = fs.createReadStream(filename);
            rs.on("error", function(err) { res.end(); });
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

app.listen(8080);
