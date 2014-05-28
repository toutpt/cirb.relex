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
/*global angular:false */
/*jshint strict: false*/

angular.module('relex.controllers').controller('AuthorizedController', [
	'$scope', '$cookies',
	function($scope, $cookies){
		//TODO: check if the Plone cookie is here
		//$scope.loggedin = $cookies.__ac !== undefined;
		$scope.loggedin = true;
	}
]);
/*global angular:false */
/*jshint strict: false*/

angular.module('relex.controllers').controller('BreadcrumbController',[
	'$scope', '$location',
	function($scope, $location){
		var update = function(){
			var path = $location.path().split('/');
			$scope.crumbs = [{name: 'Home', path:'/'}];
			for (var i = 0; i < path.length; i++) {
				if (path[i].length > 0){
					$scope.crumbs.push({
						name: path[i],
						path: path.slice(0, i+1).join('/')
					});
				}
			}
		};
		update();
		$scope.$watch(function() {
		    return $location.path();
		}, function(){
		    update();
		});
	}
]);
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
        $http.get('translations/fr.json').then(function(translations){
                gettextCatalog.setStrings('fr', translations.data.fr);
        });
        $http.get('translations/nl.json').then(function(translations){
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

            var cookie = $cookies.I18N_LANGUAGE;
            if (cookie !== undefined){
                cookie = cookie.replace(/"/g, '');
            }
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
/*global angular:false */
/*jshint strict: false*/


angular.module('relex.services').factory('messagesService',
    ['$timeout', function($timeout, $modal){
    var messages = [];
    return {
        intervalID: undefined,
        hook: function(Restangular){
            var self = this;
            var onError = function(error){
                self.parseError(error);
                throw error;
            };
            //https://github.com/mgonto/restangular/blob/master/README.md#seterrorinterceptor
            Restangular.setErrorInterceptor(function(response, promise){
                if (response.data.error){
                    onError(response.data.error);
                    return false;
                }
            });
        },
        addInfo: function(msg, delay){
            this.addMessage('info', msg, delay);
        },
        addError: function(msg, delay){
            this.addMessage('danger', msg, delay);
        },
        addWarning: function(msg, delay){
            this.addMessage('warning', msg, delay);
        },
        addMessage: function(type, msg, delay){
            var self = this;
            if (msg.length > 0){
                for (var i = 0; i < messages.length; i++) {
                    if (msg === messages[i].text){
                        return;
                    }
                }
                var message = {type: type, text: msg, delay: delay};
                messages.push(message);
                if (delay !== undefined){
                    $timeout(function(){
                        self.closeMessage(message);
                    }, delay);
                }
            }
        },
        getMessages: function(){
            return messages;
        },
        clearMessages: function(){
            for (var i = 0; i < messages.length; i++) {
                if (messages[i].type === 'danger'){
                    continue;
                }else{
                    messages.splice(i, 1);
                }
            }
        },
        closeMessage: function(msg){
            if (typeof msg === 'number'){
                messages.splice(msg, 1);
            }else{
                for (var i = 0; i < messages.length; i++) {
                    if (msg.text === messages[i].text){
                        messages.splice(i, 1);
                    }
                }
            }
        },
        parseError: function(error){
            var msg;
            if (typeof error === 'object'){
                msg = JSON.stringify(error);
            }else if (typeof error === 'string'){
                msg = error;
            }
            if (msg){
                this.addError(msg);
            }
        }
    };
}]);

angular.module('relex.controllers').controller(
    'UserMessagesController',
    ['$scope', 'messagesService',
    function($scope, messagesService){
        $scope.messages = messagesService.getMessages();
        $scope.closeAlert = function(index){
            messagesService.closeMessage(index);
        };
        $scope.error = [];
        $scope.info = [];
        var updateMsgs = function(){
            for (var i = 0; i < $scope.messages.length; i++) {
                var msg = $scope.messages[i];
                if (msg.type === 'info'){
                    $scope.info.push(msg);
                }else{
                    $scope.error.push(msg);
                }
            }
        };
        $scope.$watch('messages', function(){
            updateMsgs();
        }, true);
    }]
);

/*global angular:false */
/*jshint strict: false*/

angular.module('relex').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/project', {
        controller: 'ProjectsController',
        templateUrl: 'partials/projects.html'
    });
    $routeProvider.when('/project/:id', {
        controller: 'ProjectsController',
        templateUrl: 'partials/projects.html'
    });
}]);
angular.module('relex.services').factory('projectsService', [
	'$http', function($http){
        return {
			postProject: function(project){
				//return $http.post()
			}
		};
	}
]);
angular.module('relex.controllers').controller('ProjectsController', [
	'$scope', '$location', '$routeParams', 'langService', 'projectsService',
	function($scope, $location, $routeParams, langService, projectsService){
		//model
		$scope.projects = [];
		$scope.currentProject;
        $scope.citiesVocabulary = [];
        $scope.regionsVocabulary = [];
        $scope.countriesVocabulary = [];
        $scope.brusselsPartnersVocabulary = [];
        $scope.contactsVocabulary = [];
		//methods
		$scope.setCurrentProject = function(project){
			$location.path('project/'+project.code); //this reload the controller
		};
		$scope.addNewProject = function(code){
            var project = {code:code};
            projectsService.postProject(project);
            $scope.projects.push(project);
		};

		//initialize
        var _ = langService.createNewTranslatedValue;
        $scope.citiesVocabulary.push({id: '0', city: _('AALBORG'), country: _('DANEMARK'), region: _('NORDJYLLAND')});
        $scope.citiesVocabulary.push({id: '1', city: _('ABERDEEN'), country: _('ROYAUME-UNI'), region: _('ECOSSE')});
        $scope.citiesVocabulary.push({id: '2', city: _('ABIDJAN'), country: _("COTE D'IVOIRE"), region: _('')});
        $scope.citiesVocabulary.push({id: '3', city: _('ABU DHABI'), country: _('EMIRATS ARABES UNIS'), region: _('')});

        $scope.regionsVocabulary.push({id: '0', country: _('DANEMARK'), region: _('NORDJYLLAND')});
        $scope.regionsVocabulary.push({id: '1', country: _('ROYAUME-UNI'), region: _('ECOSSE')});
        $scope.regionsVocabulary.push({id: '2', country: _("COTE D'IVOIRE"), region: _('')});
        $scope.regionsVocabulary.push({id: '3', country: _('EMIRATS ARABES UNIS'), region: _('')});

        $scope.countriesVocabulary.push({id: '0', country: _('DANEMARK')});
        $scope.countriesVocabulary.push({id: '1', country: _('ROYAUME-UNI')});
        $scope.countriesVocabulary.push({id: '2', country: _("COTE D'IVOIRE")});
        $scope.countriesVocabulary.push({id: '3', country: _('EMIRATS ARABES UNIS')});

        $scope.brusselsPartnersVocabulary.push({id: '0', name: 'BERREWAERTS', firstname: 'MARIE CHRISTINE', tel: '++32(0)2 75 75 11', email: 'toto@toto.com', organisation: _('titi'), cell: _('foo')});
        $scope.brusselsPartnersVocabulary.push({id: '1', name: 'CERZER', firstname: 'AFFQSDQSD', tel: '++32(0)2 75 75 11', email: 'toto@toto.com', organisation: _('titi'), cell: _('foo')});

        $scope.contactsVocabulary.push({id: '0', name: 'BERREWAERTS', firstname: 'MARIE CHRISTINE', tel: '++32(0)2 75 75 11', email: 'toto@toto.com', organisation: _('titi'), cell: _('foo'), fct: _('INGENIEUR')});
        $scope.contactsVocabulary.push({id: '1', name: 'CERZER', firstname: 'AFFQSDQSD', tel: '++32(0)2 75 75 11', email: 'toto@toto.com', organisation: _('titi'), cell: _('foo'), fct: _('ECHEVIN')});

		$scope.projects.push(
            {
                code: 'SUM',
                name: _(),
                content: _(),
                cities: [],
                regions: [],
                countries: [],
                brusellesPartners: [],
                contacts: []
            },
            {
                code: 'TEST',
                name: _(),
                content: _(),
                cities: [],
                regions: [],
                countries: [],
                brusellesPartners: [],
                contacts: []
            }
		);
		if ($routeParams.id !== undefined){
			for (var i = 0; i < $scope.projects.length; i++) {
				if ($scope.projects[i].code === $routeParams.id){
					$scope.currentProject = $scope.projects[i];
				}
			}
		}
	}
]);

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
                var deferred = $q.defer();
                $http.get('/relex_web/relex_vocabulary').then(function(data){
                    deferred.resolve(data.data);
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
/*global angular:false */
/*jshint strict: false*/

angular.module('relex.directives').directive('selectMultiple',
    ['langService', function(langService){
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