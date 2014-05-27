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
                return $http.get('/relex_web/relex_vocabulary').then(function(data){
                    return data.data;
                });
            },
            get: function(vocabulary){
                return this.getVocabularies().then(function(vocabularies){
                    for (var i = 0; i < vocabularies.length; i++) {
                        if (vocabulary === vocabularies[i].id){
                            return vocabularies[i];
                        }
                    }
                });
            },
            post: function(vocabularyID, term){
                //return $http.post()
                return $http.post('/relex_web/relex_vocabulary/'+vocabularyID, term);
            },
            put: function(vocabularyID, term){
                return $http.put('/relex_web/relex_vocabulary/'+vocabularyID + '/' + term.id, term);
            },
            remove: function(vocabularyID, term){
                return $http.delete('/relex_web/relex_vocabulary/'+vocabularyID + '/' + term.id, term);
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
        vocabularyService.get(VOCAB).then(function(vocabulary){

            $scope.terms = vocabulary.terms;
            if ($routeParams.id !== undefined){
                for (var i = 0; i < $scope.terms.length; i++) {
                    if ($scope.terms[i].code === $routeParams.id){
                        $scope.currentTerm = $scope.terms[i];
                    }
                }
            }else{
                $scope.currentTerm = vocabulary.model;
            }
        });

        $scope.setCurrentTerm = function(term){
            $location.path('/vocabulary/' + VOCAB + '/' + term.code);
        };
        $scope.saveOrAddTerm = function(){
            if ($scope.currentTerm.id === ""){
                vocabularyService.post(VOCAB, $scope.currentTerm);
            }else{
                vocabularyService.put(VOCAB, $scope.currentTerm);
            }
        };
        $scope.removeTerm = function(){
            vocabularyService.remove(VOCAB, $scope.currentTerm);
        };
    }
]);