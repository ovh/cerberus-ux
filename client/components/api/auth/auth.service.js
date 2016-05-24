/*global angular */
'use strict';

angular
    .module('abuseApp')
    .factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q, URLS) {
        var currentUser = {};
        if($cookieStore.get('token')) {
            currentUser = User.get();
        }

        return {

            /**
             * Authenticate user and save token
             *
             * @param  {Object}   user     - login info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            login: function(user, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();
                
                $http.post([URLS.API, 'auth'].join('/'), {
                    name: user.name,
                    password: user.password
                }).success(function(data) {
                    $cookieStore.put('token', data.token);
                    currentUser = User.get();
                    deferred.resolve(data);
                    return cb();
                }).error(function(err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));
                
                return deferred.promise;
            },

            /**
             * Delete access token and user info
             *
             * @param  {Function}
             */
            logout: function() {
                $http.post([URLS.API, 'logout'].join('/'), {}).then(function () {
                    $cookieStore.remove('token');
                    currentUser = {};
                });
            },

            /**
             * Create a new user
             *
             * @param  {Object}   user     - user info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            createUser: function(user, callback) {
                var cb = callback || angular.noop;

                return User.save(user,
                                 function(data) {
                                     $cookieStore.put('token', data.token);
                                     currentUser = User.get();
                                     return cb(user);
                                 },
                                 function(err) {
                                     this.logout();
                                     return cb(err);
                                 }.bind(this)).$promise;
            },

            /**
             * Change password
             *
             * @param  {String}   oldPassword
             * @param  {String}   newPassword
             * @param  {Function} callback    - optional
             * @return {Promise}
             */
            changePassword: function(oldPassword, newPassword, callback) {
                var cb = callback || angular.noop;

                return User.changePassword({ id: currentUser._id }, {
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }, function(user) {
                    return cb(user);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            /**
             * Gets all available info on authenticated user
             *
             * @return {Object} user
             */
            getCurrentUser: function() {
                return currentUser;
            },

            /**
             * Check if a user is logged in
             *
             * @return {Boolean}
             */
            isLoggedIn: function() {
                return currentUser.hasOwnProperty('username');
            },

            /**
             * Waits for currentUser to resolve before checking if user is logged in
             */
            isLoggedInAsync: function(cb) {
                if(currentUser.hasOwnProperty('$promise')) {
                    currentUser.$promise.then(function() {
                        cb(true);
                    }).catch(function() {
                        cb(false);
                    });
                } else if(currentUser.hasOwnProperty('role')) {
                    cb(true);
                } else {
                    cb(false);
                }
            },

            /**
             * Check if a user is an admin
             *
             * @return {Boolean}
             */
            isAdmin: function() {
                return currentUser.isSuperuser === true;
            },

            /**
             * Get auth token
             */
            getToken: function() {
                return $cookieStore.get('token');
            },

            requestToken: function (callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();
                
                $http.get([URLS.API, 'auth'].join('/')).success(function(data) {
                    $cookieStore.put('token', data.token);
                    currentUser = User.get();
                    deferred.resolve(data);
                    return cb();
                }).error(function(err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));
                
                return deferred.promise;
            }
        };
    });
