four51.app.controller('FavoriteOrderCtrl', ['$scope', '$location', '$routeParams', 'FavoriteOrder', 'Order', 'User',
function ($scope, $location, $routeParams, FavoriteOrder, Order, User) {
	$scope.settings = {
		currentPage: 1,
		pageSize: 10
	};

	function Query(searchTerm) {
		FavoriteOrder.query(function(favs, count) {
			$scope.favoriteorders = favs;
			$scope.settings.listCount = count;
		}, searchTerm, $scope.settings.currentPage, $scope.settings.pageSize);
	}

	$scope.$watch('settings.currentPage', function(n,o) {
		Query();
	});

	$scope.search = function(searchTerm) {
		Query(searchTerm);
	}

	$scope.repeat = function(order) {
		order.Repeat = true;
		Order.save(order, function(data) {
			$scope.currentOrder = data;
			$scope.user.CurrentOrderID = data.ID;
			User.save($scope.user, function(data) {
				$scope.user = data;
				$location.path('/cart');
			});
		});
	};

	$scope.checkAll = function(event) {
		angular.forEach($scope.favoriteorders, function(order) {
			order.Selected = event.currentTarget.checked;
		});
	};
	$scope.deleteSelected = function() {
        FavoriteOrder.delete($scope.favoriteorders, function() {
            FavoriteOrder.query(function(favs) {
                $scope.favoriteorders = favs;
            });
        });
	};
}]);