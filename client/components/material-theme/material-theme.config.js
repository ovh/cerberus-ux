angular.module('abuseApp').config(function ($mdThemingProvider) {
    'use strict';
    $mdThemingProvider.definePalette('white', {
        '50': 'ffffff',
        '100': 'ffffff',
        '200': 'ffffff',
        '300': 'ffffff',
        '400': 'ffffff',
        '500': 'ffffff',
        '600': 'ffffff',
        '700': 'ffffff',
        '800': 'ffffff',
        '900': 'ffffff',
        'A100': 'ffffff',
        'A200': 'ffffff',
        'A400': 'ffffff',
        'A700': 'ffffff',
        'contrastDefaultColor': 'dark',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });

    $mdThemingProvider.theme('white')
        .primaryPalette('white')
        .accentPalette('blue');

    $mdThemingProvider.definePalette('red', {
        '50': 'f44336',
        '100': 'f44336',
        '200': 'f44336',
        '300': 'f44336',
        '400': 'f44336',
        '500': 'f44336',
        '600': 'f44336',
        '700': 'f44336',
        '800': 'f44336',
        '900': 'f44336',
        'A100': 'f44336',
        'A200': 'f44336',
        'A400': 'f44336',
        'A700': 'f44336',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });

    $mdThemingProvider.theme('red')
        .primaryPalette('red')
        .accentPalette('white');

    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('blue');
});
