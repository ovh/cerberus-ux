angular
    .module("abuseApp")
    .controller("CategoriesCtrl", function ($state, Categories, Toast, $mdDialog) {
        "use strict";

        var ctrl = this;
        ctrl.loaders = {
            categories: true
        };

        function init () {
            ctrl.getCategories()["finally"](function () {
                ctrl.loaders.categories = false;
            });
        }

        // ------ Categories ------ //
        ctrl.getCategories = function () {
            ctrl.loaders.categories = true;
            return Categories.query().$promise.then(
                function (categories) {
                    ctrl.categories = categories;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.categories = false;
            });
        };

        ctrl.addCategory = function (ev) {
            $mdDialog.show({
                controller: "CategoryAddCtrl",
                templateUrl: "app/admin/categories/add/category-add.html",
                targetEvent: ev
            }).then(function (category) {
                Categories.save(category).$promise.then(
                    function (category) {
                        ctrl.categories.push(category);
                        Toast.success(["Category", category.name, "successfully added"].join(" "));
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );

            }, function () {});
        };

        ctrl.updateCategory = function (category, ev) {
            $mdDialog.show({
                controller: "CategoryUpdateCtrl",
                templateUrl: "app/admin/categories/update/category-update.html",
                targetEvent: ev,
                locals: { category: category }
            }).then(function (newCategory) {
                ctrl.categories = ctrl.categories.map(function (cat) {
                    if (cat.name === newCategory.name) {
                        return newCategory;
                    }
                    return cat;
                });

                Categories.update({ Id: newCategory.name }, newCategory).$promise.then(
                    function () {
                        Toast.success(["Category", category.name, "successfully updated"].join(" "));
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );

            }, function () {});
        };

        ctrl.deleteCategory = function (category, ev) {
            $mdDialog.show({
                controller: "CategoryDeleteCtrl",
                templateUrl: "app/admin/categories/delete/category-delete.html",
                targetEvent: ev
            }).then(function () {
                Categories.remove({ Id: category.name }).$promise.then(
                    function () {
                        _.remove(ctrl.categories, category);
                        Toast.success(["Category", category.name, "successfully removed"].join(" "));
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );

            }, function () {});
        };

        init();
    });
