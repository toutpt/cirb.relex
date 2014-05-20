/*global angular:false */
/*jshint strict: false*/

angular.module('relex').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/project/:id', {
        controller: 'ProjectsController',
        templateUrl: 'partials/projects.html'
    });
}]);

angular.module('relex.controllers').controller('ProjectsController', [
	'$scope', '$location', '$routeParams', 'langService',
	function($scope, $location, $routeParams, langService){
		//model
		$scope.projects = [];
		$scope.currentProject;

		//methods
		$scope.setCurrentProject = function(project){
			$location.path('project/'+project.code);
		};

		//initialize
		$scope.projects.push(
			{
				code: 'SUM',
				name: langService.createNewTranslatedValue(),
				content: langService.createNewTranslatedValue()
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