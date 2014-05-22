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