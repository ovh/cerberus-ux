"use strict";

angular
    .module("abuseApp")
    .controller("ProviderUpdateCtrl", function ($scope, $mdDialog, provider, categories, Priorities, Providers, Tags, Toast, $q) {

        $scope.loaders = {
            priorities: false,
            tags: false
        };
        var tagsToAdd = [],
            tagsToDelete = [];
        $scope.provider = angular.copy(provider);
        $scope.categories = categories;

        $scope.providerHasTag = function (tag) {
            return $scope.provider.tags.filter(function (t) {
                return t.id === tag.id;
            }).length > 0;
        };

        $scope.addOrRemoveProviderTag = function (tag) {
            var tagIds = $scope.provider.tags.map(function (t) {
                return t.id;
            });

            if (tagIds.indexOf(tag.id) > -1) {
                _.remove($scope.provider.tags, function (t) {
                    return tag.id === t.id;
                });
                tagsToDelete.push(tag);
            } else {
                $scope.provider.tags.push(tag);
                tagsToAdd.push(tag);
            }
        };

        function getTags () {
            $scope.loaders.tags = true;
            return Tags.query({ tagType: "Provider" }).$promise.then(
                function (tags) {
                    $scope.tags = tags;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $scope.loaders.tags = false;
            });
        }

        function getPriorities () {
            $scope.loaders.priorities = true;
            return Priorities.getProviders().$promise.then(
                function (priorities) {
                    $scope.priorities = priorities;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $scope.loaders.priorities = false;
            });
        }

        $scope.hide = function () {
            Providers.update({ Id: window.encodeURI($scope.provider.email) }, $scope.provider).$promise.then(
                function (newProvider) {
                    tagsToAdd = tagsToAdd.map(function (tag) {
                        return Providers.addTag({ Id: $scope.provider.email }, tag).$promise;
                    });
                    tagsToDelete = tagsToDelete.map(function (tag) {
                        return Providers.deleteTag({ Id: $scope.provider.email, idTag: tag.id }).$promise;
                    });
                    $q.all(_.merge(tagsToAdd, tagsToDelete)).then(function () {
                        $mdDialog.hide(newProvider);
                    }, function (err) {
                        Toast.error(err);
                    });
                    Toast.success("Provider successfully update");
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };

        getPriorities();
        getTags();
    });
