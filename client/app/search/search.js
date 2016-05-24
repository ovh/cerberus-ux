"use strict";

angular.module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("search", {
                url: "/search?filters",
                templateUrl: "app/search/search.html",
                authenticate: true,
                controller: "SearchCtrl",
                reloadOnSearch: false,
                controllerAs: "ctrl"
            })
            .state("searchTodo", {
                url: "/search/todo",
                templateUrl: "app/search/search.html",
                authenticate: true,
                controller: "SearchTodoCtrl",
                reloadOnSearch: false,
                controllerAs: "ctrl"
            });
    });
