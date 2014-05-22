/*global angular:false */

'use strict';

angular.module('relex', [
    'ngRoute',
    'ngCookies',
    'relex.services',
    'relex.controllers',
    'relex.directives',
    'ui.bootstrap',
    'gettext'
]);

angular.module('relex.controllers', []);
angular.module('relex.services', []);
angular.module('relex.directives', []);

angular.module('relex').config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/project'});
}]);