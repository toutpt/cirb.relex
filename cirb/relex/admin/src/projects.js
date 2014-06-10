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
    'vocabularyService',
	function($scope, $location, $routeParams, langService, projectsService,
            vocabularyService){
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
        var initializeData = function(){
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
			$location.path('project/'+project.code); //this reload the controller
		};
		$scope.addNewProject = function(code){
            var project = {code:code};
            projectsService.postProject(project);
            $scope.projects.push(project);
		};

        $scope.t = langService.getTranslatedValue;
        $scope.getById = vocabularyService.getById;

		//initialize
        var _ = langService.createNewTranslatedValue;

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
        initializeData();
	}
]);
