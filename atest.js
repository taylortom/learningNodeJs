var async = require("async");
var amgr = require("./album_mgr");

// regular
//amgr.albums("./", regularCb);

// async
amgr.albums("./", asyncCb);

function regularCb(err, albums) {
    if(err) {
        console.log("Unexpected error: " + JSON.stringify(err));
    }
    else {
        (function iterator(index) {
            if(index == albums.length) {
                console.log("Done");
            }
            else {
                albums[index].photos(function(err, photos) {
                    if(err) {
                        console.log("Error loading album: " + JSON.stringify(err));
                    }
                    else {
                        console.log(albums[index].name);
                        console.log(photos);
                        console.log("");
                        iterator(index+1);
                    }
                });
            }
        })(0);
    }
};

function asyncCb(err, albums) {
    if(err) {
        console.log("Unexpected error: " + JSON.stringify(err));
    }
    else {
        async.forEach(albums, function(album, callback) {
            album.photos(function(err, photos) {
                if(err) {
                    console.log("Error loading album: " + JSON.stringify(err));
                }
                else {
                    console.log(album.name);
                    console.log(photos);
                    console.log("");
                }
            });
            callback(null);
        }, function(err){
            if(err) console.log(err);
            else console.log("Done");
        });
    }
};
