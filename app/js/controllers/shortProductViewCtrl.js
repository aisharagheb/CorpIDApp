four51.app.controller('shortProductViewCtrl', ['$routeParams', '$scope', 'ProductDisplayService', 'Product', '$rootScope', function ($routeParams, $scope, ProductDisplayService, Product, $rootScope) {
	$scope.LineItem = {};
	$scope.LineItem.Product = $scope.p;
	ProductDisplayService.setNewLineItemScope($scope);
	ProductDisplayService.setProductViewScope($scope);
	$scope.allowAddToOrderInProductList = $scope.allowAddToOrder && $scope.LineItem.Specs.length == 0 && $scope.LineItem.Product.Type != 'VariableText';

    //My Code
    $scope.getVariant = function(data) {
        console.log("this is hit");
        Product.get(data.InteropID, function(p){
            $rootScope.$broadcast("loaded", p);
        })
    }
}]);