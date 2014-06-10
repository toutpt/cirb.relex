/*global angular:false */
/*jshint strict: false*/

angular.module('relex.directives').directive('selectMultiple',
    ['langService', 'vocabularyService', function(langService, vocabularyService){
        return {
            restrict: 'A',
            templateUrl: 'partials/select-multiple.html',
            scope:{
                label: '=',
                vocabulary: '=',
                display: '=',
                target: '=',
                legend: '='
            },
            link: function(scope, elem, attrs){
                var LIMIT_TO = 2;
                scope.limitTo = LIMIT_TO;
                scope.isSelected = function(term){
                    for (var i = 0; i < scope.target.length; i++) {
                        if (term === scope.target[i]){
                            term._selected = 1;
                            return true;
                        }
                        term._selected = 0;
                    }
                    return false;

                };
                scope._ = langService.getTranslatedValue;
                scope.selectTerm = function(term){
                    if (scope.isSelected(term)){
                        scope.target.splice(scope.target.indexOf(term), 1);
                    }else{
                        scope.target.push(term);
                    }
                };
                scope.displayTerm = function(term){
                    return scope.$eval(scope.display, {term:term});
                };
                scope.toggleLimit = function(){
                    if (scope.limitTo === LIMIT_TO){
                        scope.limitTo = scope.vocabulary.length;
                    }else{
                        scope.limitTo = LIMIT_TO;
                    }
                };
            }
        };
    }
]);
