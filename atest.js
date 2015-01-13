var amgr = require("./album_mgr");

amgr.albums("./", function(err, albums) {
    if(err) {
        console.log("Unexpected error: " + JSON.stringify(err));
    }
    else {
        var a;
        (function iterator(index) {
            if(index == albums.length) {
                console.log("Done");
            }
            else {
                console.log(albums[index].photos(function() {

                }));
            }
        })(0);

        /*
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
        */
    }
});
