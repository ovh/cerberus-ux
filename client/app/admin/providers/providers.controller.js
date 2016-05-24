angular
    .module("abuseApp")
    .controller("ProvidersCtrl", function ($state, Providers, Categories, Toast, $mdDialog, $stateParams, $q) {
        "use strict";

        var ctrl = this;
        ctrl.loaders = {
            providers: true
        };

        ctrl.providersPagination = {
            currentPage: parseInt($stateParams.page) || 1,
            resultsPerPage: 10
        };

        function init () {
            $q.all([
                ctrl.getProviders(),
                ctrl.getCategories()
            ])["finally"](function () {
                ctrl.loaders.providers = false;
            });
        }

        ctrl.getProviders = function () {
            ctrl.loaders.providers = true;
            var query = {
                paginate: ctrl.providersPagination
            };

            if (!!ctrl.searchText) {
                query.paginate.currentPage = 1;
                query.where = {
                    like: [{ email : [ctrl.searchText] }]
                };
            }

            return Providers.query({ filters: JSON.stringify(query) }).$promise.then(
                function (providers) {
                    ctrl.providers = providers;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.providers = false;
            });
        };

        ctrl.getCategories = function () {
            return Categories.query().$promise.then(
                function (categories) {
                    ctrl.categories = categories;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.queryProviders = function () {
            ctrl.loaders.providers = true;
            var query = {};

            if (!!ctrl.searchText) {
                query.where = {
                    like: [{ email : [ctrl.searchText] }]
                };
            }

            var promise = Providers.query({ filters: JSON.stringify(query) }).$promise;
            promise.then(function (providers) {
                if (providers.length === 1) {
                    ctrl.selectedItem = providers.providers[0];
                    ctrl.getProviders();
                }
            });

            return promise;
        };

        ctrl.updateProvider = function (ev, provider) {
            $mdDialog.show({
                controller: "ProviderUpdateCtrl",
                templateUrl: "app/admin/providers/update/provider-update.html",
                targetEvent: ev,
                locals: { provider: provider, categories: ctrl.categories }
            }).then(function (newProvider) {
                ctrl.providers.providers = _.without(ctrl.providers.providers, provider);
                ctrl.providers.providers.push(newProvider);
            });
        };

        ctrl.goProvidersPage = function (page) {
            ctrl.providersPagination.currentPage = page;
            ctrl.getProviders();
        };

        init();
    });
