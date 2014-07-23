/*jshint strict:false */
/*global angular:false */

angular.module('relex.services').factory('settingsService',
    [function(){
        var pathSplited = window.location.pathname.split('/');
        var index = pathSplited.indexOf('relex_web');
        var BASE_URL = pathSplited.slice(0, index + 1).join('/');
        return {
            BASE_URL: BASE_URL
        };
    }]
);
