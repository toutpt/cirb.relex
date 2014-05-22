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