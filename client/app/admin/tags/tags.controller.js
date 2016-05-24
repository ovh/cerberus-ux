"use strict";

angular
    .module("abuseApp")
    .controller("TagsCtrl", function ($state, Tags, Toast, $mdDialog, $stateParams, $q) {

        var ctrl = this;

        ctrl.loaders = {
            tags: true
        };

        function init () {
            $q.all([
                ctrl.getTagTypes(),
                ctrl.getTags()
            ])["finally"](function () {
                ctrl.loaders.tags = false;
            });

        }

        ctrl.getTagTypes = function () {
            return Tags.types().$promise.then(
                function (tagTypes) {
                    ctrl.tagTypes = tagTypes;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getTags = function () {
            return Tags.query().$promise.then(
                function (tags) {
                    ctrl.tags = _.groupBy(tags, "tagType");
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.addTag = function (tagType, ev) {
            $mdDialog.show({
                controller: "DefendantTagAddCtrl",
                templateUrl: "app/admin/tags/add/tag-add.html",
                targetEvent: ev,
                locals: { type: tagType }
            }).then(function (tag) {
                if (!ctrl.tags[tagType]) {
                    ctrl.tags[tagType] = [];
                }
                ctrl.tags[tagType].push(tag.toJSON());
            });
        };

        ctrl.updateTag = function (tag, ev) {
            $mdDialog.show({
                controller: "DefendantTagUpdateCtrl",
                templateUrl: "app/admin/tags/update/tag-update.html",
                targetEvent: ev,
                locals: { tag: tag }
            }).then(function (tag) {
                var newTag = _.find(ctrl.tags[tag.tagType], function (t) {
                    return t.id === tag.id;
                });
                newTag.name = tag.name;
                newTag.level = tag.level;
            });
        };

        ctrl.deleteTag = function (tag, ev) {
            $mdDialog.show({
                controller: "DefendantTagDeleteCtrl",
                templateUrl: "app/admin/tags/delete/tag-delete.html",
                targetEvent: ev,
                locals: { tag: tag }
            }).then(function () {
                _.remove(ctrl.tags[tag.tagType], function (t) {
                    return t.id === tag.id;
                });
            });
        };

        init();
    });
