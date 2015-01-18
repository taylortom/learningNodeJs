// shorthand for $(document).ready(function(){});
$(function(){
    var template;
    var templateData = {};

    var initPage = function() {
        var albumName = window.location.href.split("/")[5];

        $.get("/templates/album.html", function(data) {
            template = data;
        });

        $.getJSON("/v1/albums/" + albumName + ".json", function(data) {
            $.extend(templateData, getPhotoData(data));
        });

        $(document).ajaxStop(function() {
            var compiled = Handlebars.compile(template);
            $("body").html(compiled(templateData));
        });
    }();

    function getPhotoData(data) {
        if(data.error) return data;

        var obj = { photos: [] };
        var af = data.data.albumData;

        for(var i = 0, count = af.photos.length; i < count; i++) {
            var url = "/v1/albums/" + af.short_name + "/" + af.photos[i].filename;
            obj.photos.push({ url: url, desc: af.photos[i].filename });
        }

        return obj;
    };
});
