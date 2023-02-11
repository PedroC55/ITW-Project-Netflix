$(function () {
    function log(message) {
        $("<div>").text(message).prependTo("#log");
        $("#log").scrollTop(0);
    }
    var self = this;
    self.id = ko.observableArray('');
    self.name = ko.observableArray('');
    self.titles = ko.observableArray('');
    $("#searchfilm").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "http://192.168.160.58/netflix/api/Search/Countries?name=" + $('#searchfilm').val(),
                dataType: "json",
                data: {
                    term: request.term
                },
                success: function (data) {
                    console.log(data)
                    response($.map(data, function (item) {
                        return {
                            label: item.Name,
                            value: item.Name
                        }
                    }))
                }
            });
        },
        minLength: 4,
        select: function (event, ui) {
            log("Selected: " + ui.item.value + " aka " + ui.item.id);
        }
    });
});