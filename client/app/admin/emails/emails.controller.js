"use strict";

angular
    .module("abuseApp")
    .controller("EmailsCtrl", function ($state, EmailTemplates, Toast, $mdDialog, $stateParams, $q) {

        var ctrl = this;

        ctrl.emailsTemplateView = "list";

        ctrl.loaders = {
            emails: true,
            emailTemplates: true
        };

        function init () {
            $q.all([
                ctrl.getEmailTemplates(),
                ctrl.getEmailTemplateLanguages(),
                ctrl.getRecipientTypes()
            ])["finally"](function () {
                ctrl.loaders.emails = false;
            });
        }

        ctrl.getEmailTemplates = function () {
            ctrl.loaders.emailTemplates = true;
            return EmailTemplates.query().$promise.then(
                function (templates) {
                    ctrl.emailTemplates = templates;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.emailTemplates = false;
            });
        };

        ctrl.getEmailTemplateLanguages = function () {
            return EmailTemplates.getLanguages().$promise.then(
                function (lang) {
                    ctrl.emailTemplateLanguages = lang;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getRecipientTypes = function () {
            return EmailTemplates.getRecipientTypes().$promise.then(
                function (types) {
                    ctrl.recipientTypes = types;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.addEmailTemplate = function () {
            ctrl.template = {};
            ctrl.emailsTemplateView = "editor";
        };

        ctrl.saveEmailTemplate = function () {
            if (!ctrl.template.id) {
                EmailTemplates.save(ctrl.template).$promise.then(
                    function (template) {
                        ctrl.emailTemplates.push(template);
                        ctrl.emailsTemplateView = "list";
                        Toast.success("Template saved successfully");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                )["finally"](function () {

                });
            } else {
                EmailTemplates.update({ Id: ctrl.template.id }, ctrl.template).$promise.then(
                    function () {
                        ctrl.emailsTemplateView = "list";
                        Toast.success("Template updated successfully");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                )["finally"](function () {

                });
            }
        };

        ctrl.updateEmailTemplate = function (template) {
            ctrl.template = template;
            ctrl.emailsTemplateView = "editor";
        };

        ctrl.deleteEmailTemplate = function (ev, template) {
            $mdDialog.show({
                controller: "EmailTemplateDeleteCtrl",
                templateUrl: "app/admin/emails/delete/email-template-delete.html",
                targetEvent: ev,
                locals: { template: template }
            }).then(function () {
                EmailTemplates.delete({ Id: template.id }).$promise.then(
                    function () {
                        ctrl.emailTemplates = ctrl.emailTemplates.filter(function (tpl) {
                            return tpl.id !== template.id;
                        });
                        Toast.success(["Template", template.id, "successfully removed"].join(" "));
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );

            });
        };

        init();
    });
