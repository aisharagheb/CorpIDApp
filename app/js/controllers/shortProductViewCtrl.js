four51.app.controller('shortProductViewCtrl', ['$routeParams', '$scope', 'ProductDisplayService', 'Product', '$rootScope', function ($routeParams, $scope, ProductDisplayService, Product, $rootScope) {
	$scope.LineItem = {};
	$scope.LineItem.Product = $scope.p;
	ProductDisplayService.setNewLineItemScope($scope);
	ProductDisplayService.setProductViewScope($scope);
	$scope.allowAddToOrderInProductList = $scope.allowAddToOrder && $scope.LineItem.Specs.length == 0 && $scope.LineItem.Product.Type != 'VariableText';

    //My Code
    $scope.getVariant = function(data) {
        Product.get(data.InteropID, function(p){
            $scope.specs = p.Specs;
            $rootScope.$broadcast("loaded", p.Specs);
        })
    }
}]);