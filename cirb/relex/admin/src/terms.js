/*global angular:false */
/*jshint strict: false*/

angular.module('relex').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/vocabulary', {
        controller: 'VocabulariesController',
        templateUrl: 'partials/vocabularies.html'
    });
    $routeProvider.when('/vocabulary/:vocabulary', {
        controller: 'VocabularyController',
        templateUrl: 'partials/vocabulary.html'
    });
    $routeProvider.when('/vocabulary/:vocabulary/:id', {
        controller: 'VocabularyController',
        templateUrl: 'partials/vocabulary.html'
    });
}]);
angular.module('relex.services').factory('vocabularyService', [
    '$http', 'langService',
    function($http, langService){
        var _ = langService.createNewTranslatedValue;
        return {
            getVocabularies: function(){
                return $http.get('/api/vocabulary').then(function(data){
                    return data.data.vocabularies;
                });
            },
            get: function(vocabulary){
                return this.getVocabularies().then(function(vocabularies){
                    for (var i = 0; i < vocabularies.length; i++) {
                        if (vocabulary === vocabularies[i].id){
                            return vocabularies[i].terms;
                        }
                    }
                });
            },
            post: function(vocabulary){
                //return $http.post()
            },
            put: function(vocabulary){

            },
            delete: function(vocabulary){

            }
        };
    }
]);

angular.module('relex.controllers').controller('VocabulariesController',[
    '$scope', '$location', 'vocabularyService',
    function($scope, $location ,vocabularyService){
        $scope.vocabularies;

        vocabularyService.getVocabularies().then(function(data){
            $scope.vocabularies = data;
        });
        $scope.redirectTo = function(vocab){
            $location.path('/vocabulary/' + vocab.id);
        };
    }
]);

angular.module('relex.controllers').controller('VocabularyController',[
    '$scope', '$location', '$routeParams', 'langService', 'vocabularyService',
    function($scope, $location, $routeParams, langService, vocabularyService){
        var VOCAB = $routeParams.vocabulary;
        $scope.template = 'vocabulary_' + VOCAB + '.html';
        $scope.currentTerm;
        $scope.t = langService.getTranslatedValue;
        $scope.terms;
        vocabularyService.get(VOCAB).then(function(terms){
            $scope.terms = terms;
            if ($routeParams.id !== undefined){
                for (var i = 0; i < $scope.terms.length; i++) {
                    if ($scope.terms[i].code === $routeParams.id){
                        $scope.currentTerm = $scope.terms[i];
                    }
                }
            }
        });

        $scope.setCurrentTerm = function(term){
            $location.path('/vocabulary/' + VOCAB + '/' + term.code);
        };

    }
]);