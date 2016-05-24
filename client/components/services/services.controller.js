"use strict";

angular
    .module("abuseApp")
    .controller("ServicesCtrl", function ($scope, $state, Toast, $q, Defendant) {
        var ctrlServices = this;
        var ctrl = $scope.ctrl;

        ctrlServices.loaders = {
            init: false,
            services: false
        };

        ctrlServices.defendant = null;

        if ($state.$current.includes.ticket && $scope.ctrl.ticket) {
            ctrlServices.defendant = $scope.ctrl.ticket.defendant;
            ctrlServices.data = $scope.ctrl.ticket;
        }

        if ($state.$current.includes.report && $scope.ctrl.report) {
            ctrlServices.defendant = $scope.ctrl.report.defendant;
            ctrlServices.data = $scope.ctrl.report;
        }

        ctrlServices.init = function () {
            ctrlServices.loaders.init = true;

            if (ctrlServices.defendant && ctrlServices.defendant.customerId) {
                $q.all([
                    ctrlServices.getServices()
                ]).then(function () {
                    ctrlServices.loaders.init = false;
                });
            }
        };

        function daysBetween (one, another) {
            return Math.round(Math.abs((+one) - (+another)) / 8.64e7);
        }

        ctrlServices.getServices = function () {
            ctrlServices.loaders.services = true;

            return Defendant.services({ id: ctrlServices.defendant.customerId }).$promise.then(
                function (services) {
                    ctrlServices.customerServices = {
                        group: {},
                        services: {},
                        count: {},
                        expired: {},
                        notValidated: {}
                    };

                    ctrl.servicesCount = 0;

                    _.each(services, function(currentZone) {
                        var zone = currentZone.zone;
                        ctrlServices.customerServices.group[zone] = _.chain(currentZone.services)
                            .map(function(service) { return service.componentType; })
                            .uniq()
                            .value();

                        ctrlServices.customerServices.services[zone] = {};
                        _.each(ctrlServices.customerServices.group[zone], function(componentType) {
                            var services = _.filter(currentZone.services, function(service) { 
                                return service.componentType === componentType;
                            });

                            ctrlServices.customerServices.services[zone][componentType] = services;
                        });

                        ctrlServices.customerServices.count[zone] = _.chain(ctrlServices.customerServices.services[zone])
                            .values()
                            .flatten()
                            .value()
                            .length;

                        ctrl.servicesCount += ctrlServices.customerServices.count[zone];

                        ctrlServices.customerServices.expired[zone] = _.chain(ctrlServices.customerServices.services[zone])
                            .values()
                            .flatten()
                            .filter(function (service) {
                                return service.expirationDate !== service.creationDate;
                            })
                            .filter(function (service) {
                                service.isExpired = new Date(service.expirationDate * 1000) < new Date();
                                return new Date(service.expirationDate * 1000) < new Date();
                            })
                            .groupBy("componentType")
                            .value();

                        _.each(ctrlServices.customerServices.expired[zone], function (val, key) {
                            var avg = 0;
                            val.forEach(function (s) {
                                if (new Date(s.expirationDate) >= ctrlServices.data.creationDate) {
                                    ctrlServices.customerServices.expired[zone][key].expiredSinceAbuse = ctrlServices.customerServices.expired[zone][key].expiredSinceAbuse + 1;
                                }

                                if (s.expirationDate === s.creationDate) {
                                    ctrlServices.customerServices.notValidated[zone]++;
                                } else {
                                    avg += daysBetween(s.expirationDate * 1000, s.creationDate * 1000);
                                }
                            });
                            if (avg > 0) {
                                ctrlServices.customerServices.expired[zone][key].avg = Math.round(avg / val.length);
                            }
                        });
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlServices.loaders.services = false;
            });
        };
    });
