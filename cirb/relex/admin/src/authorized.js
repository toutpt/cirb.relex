/*global angular:false */
/*jshint strict: false*/

angular.module('relex.controllers').controller('AuthorizedController', [
	'$scope', '$cookies', '$http', 'settingsService',
	function($scope, $cookies, $http, settingsService){
		//TODO: check if the Plone cookie is here
		//$scope.loggedin = $cookies.__ac !== undefined;
		//idea: hit the addform
		var BASE_URL = settingsService.BASE_URL;

		var redirectedPattern = '/acl_users/credentials_cookie_auth/require_login?came_from=';
		$http.get(BASE_URL + '/createObject?type_name=Project').then(
			function(data){
				if (data.headers('tm-finalurl').indexOf(redirectedPattern) >- 1){
					$scope.loggedin = false;
					window.location.replace(BASE_URL + '/login?came_from=' + encodeURIComponent(window.location.href));
				}else{
					$scope.loggedin = true;
				}
			}, function(error){
				$scope.loggedin = false;
				window.location.replace(BASE_URL + '/login');
			});
	}
]);