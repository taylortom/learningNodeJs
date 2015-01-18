var express = require("express");

var albm_hdlr = require("./handlers/albums.js");
var pg_hdlr = require("./handlers/pages.js");
var helpers = require("./helpers.js");

var app = express();
app.use(express.static(__dirname + "/../static"));

// routes
app.get("/v1/albums.json", albm_hdlr.listAll);
app.get("/v1/albums/:albumName.json", albm_hdlr.getAlbum);
app.get("/pages/:pageName", pg_hdlr.generate);
app.get("/pages/:pageName/:subPage", pg_hdlr.generate);

app.get("/", function(req, res) {
    res.redirect("/pages/home");
    res.end();
});

app.get("*", function(req, res) {
    helpers.sendFailure(res, 404, helpers.invalidResource());
});

app.listen(8080);
