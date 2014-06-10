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

        $scope.t = langService.getTranslatedValue;
		//methods
        var initializeData = function(){
            vocabularyService.getVocabularies().then(function(vocabularies){
                for (var i = 0; i < vocabularies.length; i++) {
                    if (vocabularies[i].id == 'city')
                        $scope.citiesVocabulary = vocabularies[i].terms;
                    else if (vocabularies[i].id == 'organisationtype')
                        $scope.organisationTypesVocabulary = vocabularies[i].terms;
                    else if (vocabularies[i].id == 'region')
                        $scope.regionsVocabulary = vocabularies[i].terms;
                    else if (vocabularies[i].id == 'country')
                        $scope.countriesVocabulary = vocabularies[i].terms;
                    else if (vocabularies[i].id == 'brusselspartners')
                        $scope.brusselsPartnersVocabulary = vocabularies[i].terms;
                    else if (vocabularies[i].id == 'contact')
                        $scope.contactsVocabulary = vocabularies[i].terms;
                }
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
