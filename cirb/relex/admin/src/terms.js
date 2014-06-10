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
    '$http', '$q', 'langService',
    function($http, $q, langService){
        var _ = langService.createNewTranslatedValue;
        return {
            getVocabularies: function(){
                // TODO: cache vocabularies
                var getTermById = function(vocabularies, vocab_id, term_id){
                    var obj = null;
                    angular.forEach(vocabularies, function(vocabulary){
                        if (vocabulary['id'] === vocab_id) {
                            angular.forEach(vocabulary.terms, function(term){
                                if (term.id === term_id) {
                                    obj = term;
                                    return ;
                                }
                            });
                            return ;
                        }
                    });
                    return obj;
                };

                var processTerms = function(vocabularies, ids, terms){
                    var deferred = $q.defer();
                    angular.forEach(terms, function(term){
                        angular.forEach(term, function(value, key){
                            if (ids.indexOf(key) !== -1) {
                                term[key] = getTermById(vocabularies, key, value);
                            }
                        });
                    });
                    deferred.resolve();
                    return deferred.promise;
                };

                var deferred = $q.defer();
                var promises = [];
                $http.get('/relex_web/relex_vocabulary').then(function(data){
                    var vocabularies = data.data;
                    var ids = [];
                    angular.forEach(vocabularies, function(vocabulary){
                        ids.push(vocabulary.id);
                    });

                    angular.forEach(vocabularies, function(vocabulary){
                        promises.push(processTerms(vocabularies, ids, vocabulary.terms));
                    });
                    $q.all(promises).then(function(){
                        deferred.resolve(vocabularies);
                    });
                });

                return deferred.promise;
            },
            get: function(vocabulary){
                var deferred = $q.defer();
                this.getVocabularies().then(function(vocabularies){
                    for (var i = 0; i < vocabularies.length; i++) {
                        if (vocabulary === vocabularies[i].id){
                            deferred.resolve(vocabularies[i]);
                        }
                    }
                });
                return deferred.promise;
            },
            getById: function(vocabulary, id){
                var deferred = $q.defer();
                this.get(vocabulary).then(function(vocab){
                    for (var i = 0; i < vocab.terms.length; i++) {
                        if (vocab.terms[i].id === id){

                            deferred.resolve(vocab.terms[i]);


                        }
                    }
                });
                return deferred.promise;
            },
            post: function(vocabularyID, term){
                var deferred = $q.defer();
                $http.post('/relex_web/relex_vocabulary/'+vocabularyID, term)
                .then(function(data){
                    deferred.resolve(data.data);
                });
                return deferred.promise;
            },
            put: function(vocabularyID, term){
                var deferred = $q.defer();
                //rest api with Plone doesn't work with publishTraverse put -> post /update
                $http.post('/relex_web/relex_vocabulary/'+vocabularyID + '/' + term.id + '/update', term)
                .then(function(data){
                    deferred.resolve(data.data);
                });
                return deferred.promise;
            },
            remove: function(vocabularyID, term){
                var deferred = $q.defer();
                //rest api with Plone doesn't work with publishTraverse delete -> post /delete
                $http.post('/relex_web/relex_vocabulary/'+vocabularyID + '/' + term.id + '/delete', term)
                .then(function(data){
                    deferred.resolve(data.data);
                });
                return deferred.promise;
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
    '$scope', '$location', '$routeParams', 'langService', 'vocabularyService', 'messagesService',
    function($scope, $location, $routeParams, langService, vocabularyService, messagesService){
        var VOCAB = $routeParams.vocabulary;
        $scope.template = 'vocabulary_' + VOCAB + '.html';
        $scope.currentTerm; $scope.originalTerm;
        $scope.t = langService.getTranslatedValue;
        $scope.terms;

        var initializeData = function(){
            vocabularyService.getVocabularies().then(function(vocabularies){
                $scope.vocabularies = {};
                for (var i = 0; i < vocabularies.length; i++) {
                    $scope.vocabularies[vocabularies[i].id] = vocabularies[i].terms;
                }
            });
        };
        var initializeVocabularies = function(){
            vocabularyService.get(VOCAB).then(function(vocabulary){
                $scope.terms = vocabulary.terms;
                if ($routeParams.id !== undefined){
                    var found = false;
                    for (var i = 0; i < $scope.terms.length; i++) {
                        if ($scope.terms[i].id === $routeParams.id){
                            found = true
                            $scope.currentTerm = $scope.terms[i];
                            $scope.originalTerm = angular.copy($scope.terms[i]);
                        }
                    }
                    if (!found){
                        $scope.currentTerm = vocabulary.model;
                        $scope.originalTerm = angular.copy(vocabulary.model);
                    }
                }else{
                    $scope.currentTerm = vocabulary.model;
                    $scope.originalTerm = angular.copy(vocabulary.model);
                }
            });
        };
        var onError = function(error){
            messagesService.addError(error);
        };
        $scope.isUnchanged = function(term){
            return angular.equals(term, $scope.originalTerm);
        };
        $scope.setCurrentTerm = function(term){
            $location.path('/vocabulary/' + VOCAB + '/' + term.id);
        };
        $scope.addTerm = function(){
            vocabularyService.post(VOCAB, $scope.currentTerm).then(function(data){
                debugger;
                messagesService.addInfo('Term added', 2000);
                $location.path('/vocabulary/' + VOCAB + '/' + data);
            }, onError);
        };
        $scope.saveTerm = function(){
            vocabularyService.put(VOCAB, $scope.currentTerm).then(function(){
                messagesService.addInfo('Term updated', 2000);
                $location.path('/vocabulary/' + VOCAB);
            }, onError);
        };
        $scope.removeTerm = function(){
            vocabularyService.remove(VOCAB, $scope.currentTerm).then(function(){
                messagesService.addInfo('Term removed', 2000);
                $location.path('/vocabulary/' + VOCAB);
            });
        };
        $scope.reset = function(){
            $location.path('/vocabulary/' + VOCAB);
        };
        initializeData();
        initializeVocabularies();
    }
]);
