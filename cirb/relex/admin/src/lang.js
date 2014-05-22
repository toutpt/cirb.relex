/*global angular:false */
/*jshint strict: false*/
angular.module('relex').run(['langService', 'gettextCatalog',
    function(langService, gettextCatalog){
        gettextCatalog.currentLanguage = langService.getCurrentLanguage();
        gettextCatalog.debug = true;
    }
]);
angular.module("gettext").run(['$http', 'gettextCatalog',
        function ($http, gettextCatalog) {
        $http.get('/translations/fr.json').then(function(translations){
                gettextCatalog.setStrings('fr', translations.data.fr);
        });
        $http.get('/translations/nl.json').then(function(translations){
                gettextCatalog.setStrings('nl', translations.data.fr);
        });
}]);
angular.module('relex.services').factory('langService', [
    '$cookies', '$location', 'gettextCatalog',
    function($cookies, $location, gettextCatalog){
        var service = {};
        service.setCurrentLanguage = function(lang){
                gettextCatalog.currentLanguage = lang;
                $cookies.I18N_LANGUAGE = '"' + lang + '"';
        };
        service.getCurrentLanguage = function(){
            var cookie = $cookies.I18N_LANGUAGE.replace(/"/g, '');
            var host = $location.host();
            if (cookie){
                return cookie;
            }else if (host === 'www.brussels.irisnet.be'){
                return 'en';
            }else if (host === 'www.bruxelles.irisnet.be'){
                return 'fr';
            }else if (host === 'www.brussel.irisnet.be'){
                return 'nl';
            }else{
                return 'fr';
            }
        };
        service.createNewTranslatedLabel = function(container, label){
            container[label] = this.createNewTranslatedValue();
        };
        service.createNewTranslatedValue = function(value){
            return {
                fr: value,
                en: value,
                nl: value
            };
        };
        service.getTranslatedValue = function(container){
            return container[service.getCurrentLanguage()];
        };
        return service;
    }
]);
angular.module('relex.controllers').controller('LanguageController', [
    '$scope', 'langService', function($scope, langService){
        $scope.getLanguage = langService.getCurrentLanguage;
        $scope.setLanguage = langService.setCurrentLanguage;
    }
]);
angular.module('relex.directives').directive('inputLocalized',
    function(){
        return {
            restrict: 'A',
            templateUrl: 'partials/input-localized.html',
            scope:{
                label: '=',
                value: '='
            }
        };
    }
);
angular.module('relex.directives').directive('textareaLocalized',
    function(){
        return {
            restrict: 'A',
            templateUrl: 'partials/textarea-localized.html',
            scope:{
                label: '=',
                value: '='
            }
        };
    }
);