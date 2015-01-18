// shorthand for $(document).ready(function(){});
$(function(){
    var template;
    var templateData = {};

    var initPage = function() {
        $.get("/templates/home.html", function(data) {
            template = data;
        });

        $.getJSON("/v1/albums.json", function(data) {
            $.extend(templateData, data.data);
        });

        $(document).ajaxStop(function() {
            var compiled = Handlebars.compile(template);
            $("body").html(compiled(templateData));
        });
    }();
});
