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
    '$http', '$q', '$cacheFactory', 'langService', 'settingsService',
    function($http, $q, $cacheFactory, langService, settingsService){
        var _ = langService.createNewTranslatedValue;
        var cache = $cacheFactory('vocabularyService');
        var BASE_URL = settingsService.BASE_URL;
        return {
            getVocabularies: function(){
                var deferred = $q.defer();
                var vocabularies = cache.get('vocabularies');

                /* if cached */
                if (vocabularies !== undefined) {
                    deferred.resolve(vocabularies);
                    return deferred.promise;
                }

                /* Get a term by its id and its vocabulary's id */
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

                /* Find attributes with related object and replace the ids by these objects */
                var processTerms = function(vocabularies, ids, terms){
                    var deferred = $q.defer();
                    angular.forEach(terms, function(term){
                        angular.forEach(term, function(value, key){
                            if (ids.indexOf(key) !== -1) {
                                if (value instanceof Array) {
                                    var values = [];
                                    angular.forEach(value, function(val){
                                        values.push(getTermById(vocabularies, key, val));
                                    });
                                    term[key] = values;
                                } else {
                                    term[key] = getTermById(vocabularies, key, value);
                                }
                            }
                        });
                    });
                    deferred.resolve();
                    return deferred.promise;
                };

                /* Get all vocabularies from backend */
                var promises = [];
                $http.get(BASE_URL + '/relex_vocabulary').then(function(data){
                    var vocabularies = data.data;
                    var ids = [];
                    angular.forEach(vocabularies, function(vocabulary){
                        ids.push(vocabulary.id);
                    });

                    angular.forEach(vocabularies, function(vocabulary){
                        promises.push(processTerms(vocabularies, ids, vocabulary.terms));
                    });
                    /* Resolve the promise only when all terms have been processed */
                    $q.all(promises).then(function(){
                        cache.put('vocabularies', vocabularies);
                        deferred.resolve(vocabularies);
                    });
                });

                return deferred.promise;
            },

            /* Resets the cache */
            purge: function(){
                cache.removeAll();
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
            getByIds: function(vocabulary, ids){
                var deferred = $q.defer();
                var promises = [];
                var service = this;
                angular.forEach(ids, function(id){
                    promises.push(service.getById(vocabulary, id));
                });
                $q.all(promises).then(function(terms){
                    deferred.resolve(terms);
                });
                return deferred.promise;
            },
            post: function(vocabularyID, term){
                var deferred = $q.defer();
                $http.post(BASE_URL + '/relex_vocabulary/'+vocabularyID, term)
                .then(function(data){
                    deferred.resolve(data.data);
                });
                return deferred.promise;
            },
            put: function(vocabularyID, term){
                var deferred = $q.defer();
                //rest api with Plone doesn't work with publishTraverse put -> post /update
                $http.post(BASE_URL + '/relex_vocabulary/'+vocabularyID + '/' + term.id + '/update', term)
                .then(function(data){
                    deferred.resolve(data.data);
                });
                return deferred.promise;
            },
            remove: function(vocabularyID, term){
                var deferred = $q.defer();
                //rest api with Plone doesn't work with publishTraverse delete -> post /delete
                $http.post(BASE_URL + '/relex_vocabulary/'+vocabularyID + '/' + term.id + '/delete', term)
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
                $scope.originaleVocabularies = angular.copy($scope.vocabularies);
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
        $scope.orderByName = function(term){
            return $scope.t(term.name);
        };
        $scope.orderByCode = function(term){
            return $scope.t(term.code);
        };
        $scope.isUnchanged = function(term){
            return angular.equals(term, $scope.originalTerm);
        };
        $scope.setCurrentTerm = function(term){
            $location.path('/vocabulary/' + VOCAB + '/' + term.id);
        };
        $scope.addTerm = function(){
            vocabularyService.post(VOCAB, $scope.currentTerm).then(function(data){
                messagesService.addInfo('Term added', 2000);
                vocabularyService.purge();
                $location.path('/vocabulary/' + VOCAB + '/' + data.id);
            }, onError);
        };
        $scope.saveTerm = function(){
            vocabularyService.put(VOCAB, $scope.currentTerm).then(function(){
                messagesService.addInfo('Term updated', 2000);
                vocabularyService.purge();
                $location.path('/vocabulary/' + VOCAB);
            }, onError);
        };
        $scope.removeTerm = function(){
            vocabularyService.remove(VOCAB, $scope.currentTerm).then(function(){
                messagesService.addInfo('Term removed', 2000);
                vocabularyService.purge();
                $location.path('/vocabulary/' + VOCAB);
            });
        };
        $scope.reset = function(){
            $location.path('/vocabulary/' + VOCAB);
        };
        var getTermById = function(vocabulary, id){
            var vocab = $scope.vocabularies[vocabulary];
            for (var i = 0; i < vocab.length; i++) {
                if (vocab[i].id === id){
                    return vocab[i];
                }
            }
        };
        initializeData();
        initializeVocabularies();
        if (VOCAB === 'contact'){
            $scope.$watch('currentTerm.organisation.id', function(newValue, oldValue){
                if (!newValue)
                    {return;}
                $scope.vocabularies.cell = angular.copy($scope.originaleVocabularies.cell);
                var organisation = getTermById('organisation', newValue);
                $scope.vocabularies.cell = $scope.vocabularies.cell.filter(function(el){
                    for (var i = 0; i < organisation.cell.length; i++) {
                        if (organisation.cell[i] === null){
                            continue;
                        }
                        if (el.id === organisation.cell[i].id){
                            return true;
                        }
                    }
                    return false;
                });
            });
        }
    }
]);
