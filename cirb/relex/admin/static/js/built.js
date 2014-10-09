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
	'$scope', '$cookies', '$http', 'settingsService',
	function($scope, $cookies, $http, settingsService){
		var BASE_URL = settingsService.BASE_URL;
        var redirect_url = BASE_URL + '/login?came_from=' + encodeURIComponent(window.location.href);
		$scope.loggedin = false;
		$http.get(BASE_URL + '/@@check_auth').then(
			function(data){
				if (data.data != 'OK'){
					$scope.loggedin = false;
					window.location.replace(redirect_url);
				}else{
					$scope.loggedin = true;
				}
			}, function(error){
				$scope.loggedin = false;
				window.location.replace(redirect_url);
			});

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
            if (container === undefined)
                return '';
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


/*jshint strict:false */
/*global angular:false */

angular.module('relex.services').factory('messagesService',
    ['$timeout', function($timeout){
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
        },
        loading: function(data, newStatus){
            if (newStatus === undefined){
                data.loading = true;
                data.ok = false;
                data.ko = false;
            }else if (newStatus === 'ok'){
                data.loading = false;
                data.ko = false;
                data.ok = true;
                $timeout(function(){data.ok = false;}, 4000);
            }else{
                data.loading = false;
                data.ok = false;
                data.ko = true;
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
	'$http', '$q', 'settingsService', function($http, $q, settingsService){
        var BASE_URL = settingsService.BASE_URL;
        return {
            getProjects: function(){
                var deferred = $q.defer();
                $http.get(BASE_URL + '/relex_project').then(function(data){
                    var projects = data.data;
                    deferred.resolve(projects);
                }, function(error){
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getStatus: function(){
                var deferred = $q.defer();
                $http.get(BASE_URL + '/relex_project/status').then(function(data){
                    var status = data.data;
                    deferred.resolve(status);
                });
                return deferred.promise;
            },
			createProject: function(project){
                var deferred = $q.defer();
                $http.post(BASE_URL + '/relex_project', project).then(function(data){
                    var project = data.data;
                    deferred.resolve(project);
                });
                return deferred.promise;
			},
            getProject: function(id){
                var deferred = $q.defer();
                $http.get(BASE_URL + '/relex_project/'+ id).then(function(data){
                    var project = data.data;
                    deferred.resolve(project);
                });
                return deferred.promise;
            },
			updateProject: function(project){
                var deferred = $q.defer();
                $http.post(BASE_URL + '/relex_project/'+ project.id +'/update',
                           project).then(function(data){
                    var project = data.data;
                    deferred.resolve(project);
                });
                return deferred.promise;
			},
			deleteProject: function(project){
                var deferred = $q.defer();
                $http.post(BASE_URL + '/relex_project/'+ project.id +'/delete').then(function(data){
                    if (data.data === 'deleted') {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                });
                return deferred.promise;
			},
		};
	}
]);
angular.module('relex.controllers').controller('ProjectsController', [
	'$scope', '$location', '$routeParams', 'langService', 'projectsService',
    'vocabularyService', 'messagesService',
	function($scope, $location, $routeParams, langService, projectsService,
            vocabularyService, messagesService){
		//model
		$scope.projects = [];
		$scope.status = [];
		$scope.currentProject;
        $scope.relationTypesVocabulary = [];
        $scope.organisationTypesVocabulary = [];
        $scope.citiesVocabulary = [];
        $scope.themesVocabulary = [];
        $scope.keywordsVocabulary = [];
        $scope.regionsVocabulary = [];
        $scope.countriesVocabulary = [];
        $scope.brusselsPartnersVocabulary = [];
        $scope.contactsVocabulary = [];
        $scope.loading = {
            saveCurrentProject: {loading:false,ok:false,ko:false}
        };
		//methods
        var checkCurrentProject = function(){
		    if ($routeParams.id !== undefined){
                projectsService.getProject($routeParams.id).then(function(project){
                    vocabularyService.getByIds('brusselspartners', project.brusselspartners)
                        .then(function(terms){
                            project.brusselspartners = terms;
                        });
                    vocabularyService.getByIds('country', project.country)
                        .then(function(terms){
                            project.country = terms;
                        });
                    vocabularyService.getByIds('region', project.region)
                        .then(function(terms){
                            project.region = terms;
                        });
                    vocabularyService.getByIds('city', project.city)
                        .then(function(terms){
                            project.city = terms;
                        });
                    vocabularyService.getByIds('contact', project.contact)
                        .then(function(terms){
                            project.contact = terms;
                        });
                    vocabularyService.getByIds('theme', project.theme)
                        .then(function(terms){
                            project.theme = terms;
                        });
                    vocabularyService.getByIds('keywords', project.keywords)
                        .then(function(terms){
                            project.keywords = terms;
                        });
                    $scope.currentProject = project;
                });
		    }
        };

        var initializeData = function(){
            projectsService.getProjects().then(function(projects){
                $scope.projects = projects;
                checkCurrentProject();
            });
            projectsService.getStatus().then(function(status){
                $scope.status = status;
            });

            vocabularyService.get('city').then(function(vocab){
                $scope.citiesVocabulary = vocab.terms;
            });
            vocabularyService.get('relationtype').then(function(vocab){
                $scope.relationTypesVocabulary = vocab.terms;
            });
            vocabularyService.get('organisationtype').then(function(vocab){
                $scope.organisationTypesVocabulary = vocab.terms;
            });
            vocabularyService.get('theme').then(function(vocab){
                $scope.themesVocabulary = vocab.terms;
            });
            vocabularyService.get('keywords').then(function(vocab){
                $scope.keywordsVocabulary = vocab.terms;
            });
            vocabularyService.get('region').then(function(vocab){
                $scope.regionsVocabulary = vocab.terms;
            });
            vocabularyService.get('country').then(function(vocab){
                $scope.countriesVocabulary = vocab.terms;
            });
            vocabularyService.get('brusselspartners').then(function(vocab){
                $scope.brusselsPartnersVocabulary = vocab.terms;
            });
            vocabularyService.get('contact').then(function(vocab){
                $scope.contactsVocabulary = vocab.terms;
            });
        };

		$scope.setCurrentProject = function(project){
			$location.path('project/' + project.id);  // This reload the controller
		};
		$scope.addNewProject = function(code){
            var project = {code: code};
            projectsService.createProject(project).then(function(project){
                messagesService.addInfo('Project created succesfully', 3000);
                $scope.projects.push(project);
            }, function(){
                messagesService.addError('Error while creating the project');
            });
		};
		$scope.saveCurrentProject = function(){
            messagesService.loading($scope.loading.saveCurrentProject);
            projectsService.updateProject($scope.currentProject).then(function(){
                messagesService.loading($scope.loading.saveCurrentProject, 'ok');
                messagesService.addInfo('Project updated succesfully', 3000);
            }, function(){
                messagesService.loading($scope.loading.saveCurrentProject, 'ko');
                messagesService.addError('Error while updating the project');
            });
        };
		$scope.cancelCurrentProject = function(){
			$location.path('project');  // This reload the controller
		};
		$scope.deleteCurrentProject = function(){
            projectsService.deleteProject($scope.currentProject).then(function(){
                messagesService.addInfo('Project deleted succesfully', 3000);
                $location.path('project');
            }, function(){
                messagesService.addError('Error while deleting the project');
            });
        };

        // Filters

        $scope.filterCountries = function(country, project){
            // Empty selects
            if (project.city.length === 0 && project.region.length === 0)
                {return true;}
            // Always show terms in project
            var i = 0;
            for (i = 0 ; i < project.country.length ; i++) {
                if (country.id === project.country[i].id)
                    {return true;}
            }
            // Filter from other terms
            for (i = 0 ; i < project.city.length ; i++) {
                if (project.city[i].country !== null){
                    if (country.id === project.city[i].country.id)
                        {return true;}
                }
            }
            for (i = 0 ; i < project.region.length ; i++) {
                if (project.region[i].country !== null){
                    if (country.id === project.region[i].country.id)
                        {return true;}
                }
            }
            return false;
        };
        $scope.filterRegions = function(region, project){
            // Empty selects
            if (project.city.length === 0 && project.country.length === 0)
                {return true;}
            // Always show terms in project
            var i = 0;
            for (i = 0 ; i < project.region.length ; i++) {
                if (region.id === project.region[i].id)
                    {return true;}
            }
            // Filter from other terms
            for (i = 0 ; i < project.city.length ; i++) {
                if (project.city[i].region === null)
                    {continue;}
                if (region.id === project.city[i].region.id)
                    {return true;}
            }
            for (i = 0 ; i < project.country.length ; i++) {
                if (region.country === null)
                    {continue;}
                if (region.country.id === project.country[i].id)
                    {return true;}
            }
            return false;
        };
        $scope.filterCities = function(city, project){
            // Empty selects
            if (project.country.length === 0 && project.region.length === 0)
                {return true;}
            // Always show terms in project
            var i = 0;
            for (i = 0 ; i < project.city.length ; i++) {
                if (city.id === project.city[i].id)
                    {return true;}
            }
            // Filter from other terms
            for (i = 0 ; i < project.country.length ; i++) {
                if (city.country === null)
                    {continue;}
                if (city.country.id === project.country[i].id)
                    {return true;}
            }
            for (i = 0 ; i < project.region.length ; i++) {
                if (city.region === null)
                    {continue;}
                if (city.region.id === project.region[i].id)
                    {return true;}
            }
            return false;
        };

        $scope.filterThemes = function(theme, project) {
            // Empty selects
            if (project.keywords.length === 0)
                {return true;}
            // Always show terms in project
            var i = 0;
            for (i = 0 ; i < project.theme.length ; i++) {
                if (project.theme[i].id === theme.id)
                    {return true;}
            }
            // Filter from other terms
            for (i = 0 ; i < project.keywords.length ; i++) {
                for (var j = 0 ; j < theme.keywords.length ; j++){
                    if (theme.keywords[j] === null)
                        {continue;}
                    if (project.keywords[i].id === theme.keywords[j].id)
                        {return true;}
                }
            }
            return false;
        };
        $scope.filterKeywords = function(keyword, project) {
            // Empty selects
            if (project.theme.length === 0)
                {return true;}
            // Always show terms in project
            var i = 0;
            for (i = 0 ; i < project.keywords.length ; i++) {
                if (project.keywords[i].id === keyword.id)
                    {return true;}
            }
            // Filter from other terms
            for (i = 0 ; i < project.theme.length ; i++) {
                for (var j = 0 ; j < project.theme[i].keywords.length ; j++){
                    if (project.theme[i].keywords[j] === null)
                        {continue;}
                    if (project.theme[i].keywords[j].id === keyword.id)
                        {return true;}
                }
            }
            return false;
        };

		//initialize
        $scope.t = langService.getTranslatedValue;
        $scope.getById = vocabularyService.getById;
        initializeData();
	}
]);

/*jshint strict:false */
/*global angular:false */

angular.module('relex.services').factory('settingsService',
    [function(){
        var pathSplited = window.location.pathname.split('/');
        var index = pathSplited.indexOf('relex_web');
        var BASE_URL = pathSplited.slice(0, index + 1).join('/');
        return {
            BASE_URL: BASE_URL
        };
    }]
);

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
                var getTermById = function(vocabularies, vocabId, termId){
                    var obj = null;
                    angular.forEach(vocabularies, function(vocabulary){
                        if (vocabulary.id === vocabId) {
                            angular.forEach(vocabulary.terms, function(term){
                                if (term.id === termId) {
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
                var processTerms = function(vocabularies, ids, vocabulary){
                    var terms = vocabulary.terms;
                    var deferred = $q.defer();
                    angular.forEach(terms, function(term){
                        angular.forEach(term, function(value, key){
                            if (ids.indexOf(key) !== -1) {
                                if (value instanceof Array) {
                                    var values = [];
                                    angular.forEach(value, function(val){
                                        if (val instanceof Array){
                                            var hostname = location.origin + BASE_URL + '/++resource++cirb.relex.admin/index.html#/vocabulary/';
                                            console.log('<value array detected> '+ hostname + vocabulary.id + '/' + term.id + ' ' + key);
                                            //bug. don't know why but we have array in array
                                            if (val.length === 1){
                                                console.log('</value array fixed>');
                                                values.push(getTermById(vocabularies, key, val[0]));
                                            }else{
                                                values.push(val);
                                            }
                                        }else if (typeof val === 'object'){
                                            values.push(val);
                                        }else if (typeof val === 'string'){
                                            values.push(getTermById(vocabularies, key, val));
                                        }else{
                                            console.error('term\'s value should not be null');
                                        }
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
                        promises.push(processTerms(vocabularies, ids, vocabulary));
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
                // Make a copy
                term = JSON.parse(JSON.stringify(term));
                // Transform attributes refering to other object to ids
                angular.forEach(term, function(value, key){
                    if (typeof value === 'object' && 'id' in value) {
                        term[key] = value.id;
                    }
                });
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
        $scope.loading = {
            'saveTerm': {loading:false,ok:false,ko:false},
            'removeTerm': {loading:false,ok:false,ko:false}
        };

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
                            found = true;
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
        var initialize = function(){
            initializeData();
            initializeVocabularies();
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
                initialize();
                $location.path('/vocabulary/' + VOCAB + '/' + data.id);
            }, onError);
        };
        $scope.saveTerm = function(){
            messagesService.loading($scope.loading.saveTerm);
            vocabularyService.put(VOCAB, $scope.currentTerm).then(function(){
                messagesService.addInfo('Term updated', 2000);
                messagesService.loading($scope.loading.saveTerm, 'ok');
                vocabularyService.purge();
                initialize();
//                $location.path('/vocabulary/' + VOCAB);
            }, function(error){
                messagesService.loading($scope.loading.saveTerm, 'ko');
                onError(error);
            });
        };
        $scope.removeTerm = function(){
            messagesService.loading($scope.loading.removeTerm);
            vocabularyService.remove(VOCAB, $scope.currentTerm).then(function(){
                vocabularyService.purge();
                $location.path('/vocabulary/' + VOCAB);
                messagesService.addInfo('Term removed', 2000);
                messagesService.loading($scope.loading.removeTerm, 'ok');
            }, function(error){
                messagesService.loading($scope.loading.removeTerm, 'ko');
                onError(error);
            });
        };
        $scope.reset = function(){
            if ($routeParams.id === undefined){
                $scope.currentTerm = {};
            }
            $location.path('/vocabulary/' + VOCAB);
        };
        $scope.getTermById = function(vocabulary, id){
            var vocab = $scope.vocabularies[vocabulary];
            for (var i = 0; i < vocab.length; i++) {
                if (vocab[i].id === id){
                    return vocab[i];
                }
            }
        };
        initialize();
        if (VOCAB === 'contact'  || VOCAB === 'brusselspartners'){
            $scope.$watch('currentTerm.organisation.id', function(newValue){
                if (!newValue)
                    {return;}
                $scope.vocabularies.cell = angular.copy($scope.originaleVocabularies.cell);
                var organisation = $scope.getTermById('organisation', newValue);
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

angular.module('relex.controllers').controller('Cell2OrganisationController',[
    '$scope', '$routeParams',  '$location', '$q', 'vocabularyService', 'messagesService',
    function($scope, $routeParams, $location, $q, vocabularyService, messagesService){
        console.log('init Cell2OrganisationController');
        $scope.hasCurrentCell = Boolean($routeParams.id);
        $scope.organisationId = '';
        $scope.loading = {
            'organisations': {loading:false,ok:false,ko:false}
        };
        var onError = function(error){
            messagesService.addError(error);
        };
        $scope.removeCellFromOrganisation = function(organisation){
            var cells = organisation.cell;
            var index = -1;
            for (var i = 0; i < cells.length; i++) {
                if (cells[i].id === $scope.currentTerm.id){
                    index = i;
                }
            }
            if (index === -1){
                return;
            }
            organisation.cell.splice(index, 1);
            return vocabularyService.put('organisation', organisation).then(function(){
                vocabularyService.purge();
            }, function(error){
                onError(error);
            });
        };
        $scope.addOrganisationToCell = function(organisation){
            var cells = organisation.cell;
            if (cells.indexOf($scope.currentTerm.id) !== -1){
                console.log('already in');
                return;
            }
            organisation.cell.push($scope.currentTerm.id);
            return vocabularyService.put('organisation', organisation).then(function(){
                vocabularyService.purge();
            }, function(error){
                onError(error);
            });
        };
        $scope.addOrganisationsToCell = function(){
            var promises = [];
            for (var i = 0; i < $scope.organisations.length; i++) {
                promises.push($scope.addOrganisationToCell($scope.organisations[i]));
            }
            messagesService.loading($scope.loading.organisations);
            $q.all(promises).then(function(){
                messagesService.loading($scope.loading.organisations, 'ok');
            }, function(){
                messagesService.loading($scope.loading.organisations, 'ko');
            });
            //find the one that has been removed
            var orga;
            for (i = 0; i < $scope.originalOrganisations.length; i++) {
                orga = $scope.originalOrganisations[i];
                if ($scope.organisations.indexOf(orga) === -1){
                    $scope.removeCellFromOrganisation(orga);
                }
            }
        };
        $scope.organisations = [];
        $scope.originalOrganisations = [];
        var cell;
        var orga;
        for (var i = 0; i < $scope.vocabularies.organisation.length; i++) {
            for (var j = 0; j < $scope.vocabularies.organisation[i].cell.length; j++) {
                orga = $scope.vocabularies.organisation[i];
                cell = orga.cell[j];
                if (cell===null){
                    continue;
                }
                if (cell.id === $routeParams.id && $scope.organisations.indexOf(orga) === -1){
                    $scope.organisations.push(orga);
                    $scope.originalOrganisations.push(orga);
                }
            }
        }
    }
]);

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
