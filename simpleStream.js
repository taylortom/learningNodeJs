var fs = require("fs");

var contents;
var rs = fs.createReadStream("simpleStream.js");
var encoding = "utf8"

rs.on("readable", function() {
    var str
    var d = rs.read();

    if(d) {
        if(typeof d == "string") {
            str = d;
        }
        else if(d instanceof Buffer) {
            str = d.toString(encoding);
        }

        if(str) {
            if(!contents) contents = d;
            else contents += str;
        }
    }
});

rs.on("end", function() {
    console.log("read in the file contents:");
    console.log(contents.toString(encoding));
});
