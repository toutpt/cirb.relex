/*global angular:false */
/*jshint strict: false*/

angular.module('relex.controllers').controller('BreadcrumbController',[
	'$scope', '$location',
	function($scope, $location){
		var update = function(){
			var path = $location.path().split('/');
			$scope.crumbs = [{name: 'Home', path:'/'}];
			console.log(path.length);
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