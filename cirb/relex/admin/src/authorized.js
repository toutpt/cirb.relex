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
