'use strict';

angular
    .module('abuseApp')
    .service('Toast', function ($mdToast) {

        var service = this;

        this.toastPosition = {
            bottom: true,
            top: false,
            left: false,
            right: true
        };
        
        this.toastDelay = 3000;
        
        this.getToastPosition = function() {
            return Object.keys(service.toastPosition)
                .filter(function(pos) { return service.toastPosition[pos]; })
                .join(' ');
        };
        
        this.openTmpl = function (URLtemplate) {
            $mdToast.show({
                templateUrl: URLtemplate,
                hideDelay: service.toastDelay,
                position : service.getToastPosition()
            });
        };
        
        this.open = function (txt, options) {
            options = options || {};

            $mdToast.show({
                template: '<md-toast>' + txt + '</md-toast>',
                hideDelay: options.delay    || service.toastDelay,
                position : options.position || service.getToastPosition()
            });
       };

        this.success = function (msg) {
            $mdToast.show({
                template: ['<md-toast class="success">',msg,'</md-toast>'].join(''),
                hideDelay: service.toastDelay,
                position : service.getToastPosition()
            });
        };
        
        this.error = function (err) {             
            var errMessage =  'An error occurred';
            if (err) {
                if (err.message) {
                    errMessage = err.message;
                }
                
                if (err.statusText) {
                    errMessage = err.statusText;
                }

                if (err.data && err.data.status) {
                    errMessage = err.data.status;
                }

                if (err.data && err.data.message) {
                    errMessage  = err.data.message;
                }
            }

            $mdToast.show({
                template: ['<md-toast class="error">',errMessage,'</md-toast>'].join(''),
                hideDelay: service.toastDelay,
                position : service.getToastPosition()
            });
        }; 
    });
