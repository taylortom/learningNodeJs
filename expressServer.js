var express = require("express");

var app = new express();

app.get("/", function(req, res) {
    res.end("Hello world!");
});

app.listen(8080);
