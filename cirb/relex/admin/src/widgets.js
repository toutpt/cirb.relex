/*global angular:false */
/*jshint strict: false*/

angular.module('relex.directives').directive('forceUpperCase',
    ['$parse', function($parse){
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, modelCtrl){
                var makeUpper = function(inputValue) {
                    if (inputValue === undefined){
                        return inputValue;
                    }
                    var upperd = inputValue.toUpperCase();
                    if(upperd !== inputValue) {
                        modelCtrl.$setViewValue(upperd);
                        modelCtrl.$render();
                    }
                    return upperd;
                };
                modelCtrl.$parsers.push(makeUpper);
                makeUpper($parse(attrs.ngModel)(scope));
            }
        };
    }]
);

angular.module('relex.directives').directive('selectMultiple',
    ['$filter', 'langService', 'vocabularyService', function($filter, langService, vocabularyService){
        return {
            restrict: 'A',
            templateUrl: 'partials/select-multiple.html',
            scope:{
                label: '=',
                vocabulary: '=',
                display: '=',
                target: '=',
                legend: '=',
                filterMethod: '=',
                filterParam: '=',
                alertOnMultiple: '='
            },
            link: function(scope){
                scope.limitTo = 5;
                scope.selected = true;
                scope.showFilter = true;
                scope.getLimitTo = function(){
                    if (parseInt(scope.limitTo) <= 0){
                        return scope.vocabulary.length;
                    }
                    return parseInt(scope.target.length, 10) + parseInt(scope.limitTo, 10);
                };
                scope.isSelected = function(term){
                    for (var i = 0; i < scope.target.length; i++) {
                        if (scope.target[i] !== null){
                            if (term.id === scope.target[i].id){
                                term._selected = 1;
                                return true;
                            }
                        }
                        /*
                        > term
                        Object {code: Object, id: "59", description: Object}
                        > scope.target
                        [Object, null, null]
                        > scope.target[0]
                        Object {code: Object, id: "32", description: Object}
                        > scope.target[0].code
                        Object {fr: "CEX", en: "CEX", nl: "CEX"}
                         */
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
                        {selected = '0';}
                    if (!scope.selected)
                        {selected = '';}
                    // Country has a code attribute which is a String
                    if (term.hasOwnProperty('code') && term.code instanceof Object)
                        {return selected + scope._(term.code);}
                    if (term.hasOwnProperty('name'))
                        {return selected + scope._(term.name);}
                    if (term.hasOwnProperty('lastname'))
                        {return selected + term.lastname;}
                    if (term.hasOwnProperty('id'))
                        {return selected + scope._(term.id);}
                    return selected;
                };
                scope.filter = function(term){
                    if (scope.queryTerm !== undefined && scope.queryTerm.length !== 0) {
                        if ($filter('filter')([term], scope.queryTerm).length === 0)
                            {return false;}
                    }
                    if (scope.showFilter && scope.filterMethod !== undefined) {
                        return scope.filterMethod(term, scope.filterParam);
                    }
                    return true;
                };
                if (scope.alertOnMultiple){
                    scope.$watch('target',function(newValue, oldValue){
                        if (newValue && newValue.length > 1){
                            scope.hasMultiple = true;
                        }else{
                            scope.hasMultiple = false;
                        }
                    }, true);
                }
            }
        };
    }
]);
