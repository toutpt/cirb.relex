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
