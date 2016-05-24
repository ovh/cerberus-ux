  /*global angular */
'use strict';

angular.module('abuseApp').run(function ( editableOptions, editableThemes) {

    editableOptions.theme = 'default';

    // overwrite submit button template
    editableThemes['default'].submitTpl = ['<button style="background:none;border:none" type="submit">',
                                           '<i class="zmdi zmdi-check success zmd-2x"></i>',
                                           '</button>'].join('');

    editableThemes['default'].cancelTpl = ['<button style="background:none;border:none" ng-click="$form.$cancel()">',
                                           '<i class="zmdi zmdi-close error zmd-2x"></i>',
                                           '</button>'].join('');
});
