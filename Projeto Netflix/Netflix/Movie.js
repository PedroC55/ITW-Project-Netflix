var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/netflix/api/Movies');
    self.displayName = 'Movies List';
    // Modals
    self.titleName = ko.observable('')
    self.titleId = ko.observable('')
    self.actors = ko.observableArray('');
    self.categories = ko.observableArray('');
    self.countries = ko.observableArray('');
    self.dateAdded = ko.observable('');
    self.description = ko.observable('');
    self.directors = ko.observableArray('');
    self.duration = ko.observable('');
    self.id = ko.observable('');
    self.name = ko.observable('');
    self.rating = ko.observable('');
    self.releaseYear = ko.observable('');
    self.type = ko.observable('');
    self.categoryId = ko.observable('');
    self.categoryName = ko.observable('');
    self.categoryTitles = ko.observableArray([])
    self.LikesMovies = ko.observableArray([]);
    self.countryName = ko.observable('');
    self.countryId = ko.observable('');
    self.countryTitles = ko.observableArray([]);
    self.directorId = ko.observable('');
    self.directorName = ko.observable('');
    self.directorTitles = ko.observableArray([])
    self.actorId = ko.observable('');
    self.actorName = ko.observable('');
    self.actorTitles = ko.observableArray([])
    // Modals
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    self.records = ko.observableArray([]);
    self.currentPage = ko.observable(1);
    self.pagesize = ko.observable(20);
    self.totalRecords = ko.observable(50);
    self.hasPrevious = ko.observable(false);
    self.hasNext = ko.observable(false);
    self.previousPage = ko.computed(function () {
        return self.currentPage() * 1 - 1;
    }, self);
    self.nextPage = ko.computed(function () {
        return self.currentPage() * 1 + 1;
    }, self);
    self.fromRecord = ko.computed(function () {
        return self.previousPage() * self.pagesize() + 1;
    }, self);
    self.toRecord = ko.computed(function () {
        return Math.min(self.currentPage() * self.pagesize(), self.totalRecords());
    }, self);
    self.totalPages = ko.observable(0);
    self.pageArray = function () {
        var list = [];
        var size = Math.min(self.totalPages(), 9);
        var step;
        if (size < 9 || self.currentPage() === 1)
            step = 0;
        else if (self.currentPage() >= self.totalPages() - 4)
            step = self.totalPages() - 9;
        else
            step = Math.max(self.currentPage() - 5, 0);

        for (var i = 1; i <= size; i++)
            list.push(i + step);
        return list;
    };
    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getTitle...');
        var composedUri = self.baseUri() + "?page=" + id + "&pageSize=" + self.pagesize();
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            hideLoading();
            self.records(data.Titles);
            self.currentPage(data.CurrentPage);
            self.hasNext(data.HasNext);
            self.hasPrevious(data.HasPrevious);
            self.pagesize(data.PageSize)
            self.totalPages(data.TotalPages);
            self.totalRecords(data.TotalTitles);
            self.SetFavourites();
        });
        if (amplify.store("LikesMovies")) {
            self.LikesMovies(amplify.store("LikesMovies"));
            console.log(self.LikesMovies())
        }
    };
    self.SetFavourites = function () {
        for (var i = 0; i < self.LikesMovies().length; i++) {
            console.log("#favourite_" + self.LikesMovies()[i])
            $("#favourite_" + self.LikesMovies()[i]).addClass("text-danger").addClass("fa-heart").removeClass("fa-heart-o");
        }
    };



    self.addFavorite = function (id) {
        console.log(id, self.LikesMovies(), self.LikesMovies().length)
        if ($("#favourite_" + id).hasClass("fa-heart-o")) {
            $("#favourite_" + id).addClass("text-danger").addClass("fa-heart").removeClass("fa-heart-o");
            self.LikesMovies.push(id);
        }
        else {
            $("#favourite_" + id).removeClass("text-danger").removeClass("fa-heart").addClass("fa-heart-o");
            self.LikesMovies.remove(id);
        }
        amplify.store("LikesMovies", self.LikesMovies())
        console.log(self.LikesMovies(), self.LikesMovies().length)
    };
    {
        $("#searchbtn").click((event) => {
            event.preventDefault();
            var urlBaseSearch = "http://192.168.160.58/netflix/api/Search/Movies";
            let InputSearch = document.querySelector("#searchfilm").value.toString();  //searchfilm = id of Search Box
            if (InputSearch.length > 0) {
                let SearchURIfml = urlBaseSearch + "?name=" + InputSearch
                $('#sair').addClass('d-none');
                $('table').removeClass('d-none');
                ajaxHelper(SearchURIfml, 'GET').done(function (data) {
                    if (data.length > 0) {
                        console.log(data);
                        self.records(data);
                        self.currentPage(data.CurrentPage);
                        self.hasNext(data.HasNext);
                        self.hasPrevious(data.HasPrevious);
                        self.pagesize(data.PageSize);
                        self.totalPages(data.TotalPages);
                        self.totalRecords(data.TotalTitles);
                    }
                    else {
                        alert("Não existe nenhum filme!")
                        $('#sair').addClass('d-none');
                        $('table').addClass('d-none');
                    }
                });
            }
            else {
                $('#sair').removeClass('d-none');
                $('table').removeClass('d-none');
                self.activate(1);
            }
        });
    }
    $('#searchfilm').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            event.preventDefault();
            var urlBaseSearch = "http://192.168.160.58/netflix/api/Search/Movies";
            let InputSearch = document.querySelector("#searchfilm").value.toString();  //searchfilm = id of Search Box
            if (InputSearch.length > 0) {
                let SearchURIfml = urlBaseSearch + "?name=" + InputSearch
                $('#sair').addClass('d-none');
                $('table').removeClass('d-none');
                ajaxHelper(SearchURIfml, 'GET').done(function (data) {
                    if (data.length > 0) {
                        console.log(data);
                        self.records(data);
                        self.currentPage(data.CurrentPage);
                        self.hasNext(data.HasNext);
                        self.hasPrevious(data.HasPrevious);
                        self.pagesize(data.PageSize);
                        self.totalPages(data.TotalPages);
                        self.totalRecords(data.TotalTitles);
                    }
                    else {
                        alert("Não existe nenhum ator!")
                        $('#sair').addClass('d-none');
                        $('table').addClass('d-none');
                    }
                });
            }
            else {
                $('#sair').removeClass('d-none');
                $('table').removeClass('d-none');
                self.activate(1);
            }
        }
    });
    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });

    }
    function showLoading() {
        $('#myModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    //--- start ....
    showLoading();
    var pg = getUrlParameter('page');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
});