angular.module("abuseApp")
.provider("html5BasePath", function (CONFIG) {
    "use strict";

    var self = this;
    var baseRegex = CONFIG.basePathRegex;

    this.addTag = function addTag () {
        var baseHref = self.get();
        var $head = $(document).find("head");
        $head.append("<base href=\"" + baseHref + "\"/>");
    };

    this.get = function get (location) {
        location = location || document.location.pathname;

        var regexToMatch;

        if (!baseRegex) {
            regexToMatch = undefined;
        } else if (angular.isArray(baseRegex)) {
            regexToMatch = _.find(baseRegex, function (path) { return path.test(location); });
        } else {
            regexToMatch = baseRegex.test(location) ? baseRegex : undefined;
        }

        if (regexToMatch) {
            return location.match(regexToMatch)[0];
        } else {
            return "/";
        }
    };

    this.$get = function () {
        return {
            get: function (location) {
                return self.get(location);
            }
        };
    };
});
