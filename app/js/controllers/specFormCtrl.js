four51.app.controller('SpecFormCtrl', ['$scope', '$location', '$route', '$routeParams', 'ProductDisplayService', 'Variant',
function ($scope, $location, $route, $routeParams, ProductDisplayService, Variant) {
	var varID = $routeParams.variantInteropID == 'new' ? null :  $routeParams.variantInteropID;
	$scope.loadingImage = true;
	ProductDisplayService.getProductAndVariant($routeParams.productInteropID, varID, function(data){
		$scope.Product = data.product;
		if(varID)
			$scope.Variant = data.variant;
		else{
			$scope.Variant = {};
			$scope.Variant.ProductInteropID = $scope.Product.InteropID;
			$scope.Variant.Specs = {};
			angular.forEach($scope.Product.Specs, function(item){
				if(!item.CanSetForLineItem)
				{
					$scope.Variant.Specs[item.Name] = item;
				}
			});
		}
	});

	function saveVariant(variant) {
		Variant.save(variant, function(data){
			$location.path('/product/' + $scope.Product.InteropID + '/'+ data.InteropID);
		});
	}
	$scope.save = function(){
		saveVariant($scope.Variant);
	}

	$scope.saveasnew = function() {
		$scope.Variant.InteropID = null;
		saveVariant($scope.Variant);
	}

	$scope.$on('event:imageLoaded', function(event, result) {
		$scope.loadingImage = !result;
		$scope.$apply();
	});
}]);