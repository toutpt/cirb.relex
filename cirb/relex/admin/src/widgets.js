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
                legend: '=',
            },
            link: function(scope, elem, attrs){
                scope.limitTo = 5;
                scope.getLimitTo = function(){
                    if (parseInt(scope.limitTo) <= 0)
                        return scope.vocabulary.length;
                    return parseInt(scope.target.length) + parseInt(scope.limitTo);
                };
                scope.isSelected = function(term){
                    for (var i = 0; i < scope.target.length; i++) {
                        if (term.id === scope.target[i].id){
                            term._selected = 1;
                            return true;
                        }
                    }
                    term._selected = 0;
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
                scope.orderBy = function(term){
                    // Selected first
                    var selected = '1';
                    if (scope.isSelected(term))
                        selected = '0';
                    // Country has a code attribute which is a String
                    if (term.hasOwnProperty('code') && term.code instanceof Object)
                        return selected + scope._(term.code);
                    if (term.hasOwnProperty('name'))
                        return selected + scope._(term.name)
                    if (term.hasOwnProperty('lastname'))
                        return selected + term.lastname
                    if (term.hasOwnProperty('id'))
                        return selected + scope._(term.id)
                    return selected
                };
            }
        };
    }
]);
