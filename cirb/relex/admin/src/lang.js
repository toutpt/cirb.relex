/*global angular:false */
/*jshint strict: false*/

angular.module('relex.services').factory('langService', [
    '$cookies',
    function($cookies){
        //TODO: check if the Plone cookie is here
        return {
            currentLanguage: $cookies.I18N_LANGUAGE,
            setCurrentLanguage: function(lang){
                $cookies.I18N_LANGUAGE = lang;
            },
            getCurrentLanguage: function(){
                return this.currentLanguage;
            },
            createNewTranslatedLabel: function(container, label){
                container[label] = this.createNewTranslatedValue();
            },
            createNewTranslatedValue: function(){
                return {
                    fr: '',
                    en: '',
                    nl: ''
                };
            },
            getTranslatedValue: function(container, label){
                return container[label][this.currentLanguage];
            }
        };
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