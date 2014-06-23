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
	'$http', '$q', function($http, $q){
        return {
            getProjects: function(){
                var deferred = $q.defer();
                $http.get('/relex_web/relex_project').then(function(data){
                    var projects = data.data;
                    deferred.resolve(projects);
                });
                return deferred.promise;
            },
			createProject: function(project){
                var deferred = $q.defer();
                $http.post('/relex_web/relex_project', project).then(function(data){
                    var project = data.data;
                    deferred.resolve(project);
                });
                return deferred.promise;
			},
            getProject: function(id){
                var deferred = $q.defer();
                $http.get('/relex_web/relex_project/'+ id).then(function(data){
                    var project = data.data;
                    deferred.resolve(project);
                });
                return deferred.promise;
            },
			updateProject: function(project){
                var deferred = $q.defer();
                $http.post('/relex_web/relex_project/'+ project.id +'/update',
                           project).then(function(data){
                    var project = data.data;
                    deferred.resolve(project);
                });
                return deferred.promise;
			},
			deleteProject: function(project){
                var deferred = $q.defer();
                $http.post('/relex_web/relex_project/'+ project.id +'/delete').then(function(data){
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
		$scope.currentProject;
        $scope.organisationTypesVocabulary = [];
        $scope.citiesVocabulary = [];
        $scope.regionsVocabulary = [];
        $scope.countriesVocabulary = [];
        $scope.brusselsPartnersVocabulary = [];
        $scope.contactsVocabulary = [];

		//methods
        var _ = langService.createNewTranslatedValue;

        var checkCurrentProject = function(){
		    if ($routeParams.id !== undefined){
                projectsService.getProject($routeParams.id).then(function(project){
                    $scope.currentProject = project;
                });
		    }
        }

        var initializeData = function(){
            projectsService.getProjects().then(function(projects){
                $scope.projects = projects;
                checkCurrentProject();
            });

            vocabularyService.get('city').then(function(vocab){
                $scope.citiesVocabulary = vocab.terms;
            });
            vocabularyService.get('organisationtype').then(function(vocab){
                $scope.organisationTypesVocabulary = vocab.terms;
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
        }

		$scope.setCurrentProject = function(project){
			$location.path('project/' + project.id);  // This reload the controller
		};
		$scope.addNewProject = function(code){
            var project = {code: code};
            projectsService.createProject(project).then(function(project){
                $scope.projects.push(project);
            });
		};
		$scope.saveCurrentProject = function(){
            projectsService.updateProject($scope.currentProject).then(function(){
                messagesService.addInfo(_("Project updated succesfully"), 3000);
            }, function(){
                messagesService.addError(_("Error while updating the project"));
            });
        };
		$scope.cancelCurrentProject = function(){
			$location.path('project');  // This reload the controller
		};
		$scope.deleteCurrentProject = function(){
            projectsService.deleteProject($scope.currentProject).then(function(){
                messagesService.addInfo(_("Project deleted succesfully"), 3000);
                $location.path('project');
            }, function(){
                messagesService.addError(_("Error while deleting the project"));
            });
        };

		//initialize
        $scope.t = langService.getTranslatedValue;
        $scope.getById = vocabularyService.getById;
        initializeData();
	}
]);
