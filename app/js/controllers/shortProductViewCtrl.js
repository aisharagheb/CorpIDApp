four51.app.controller('shortProductViewCtrl', ['$routeParams', '$scope', 'ProductDisplayService', 'Product', '$rootScope', function ($routeParams, $scope, ProductDisplayService, Product, $rootScope) {
	$scope.LineItem = {};
	$scope.LineItem.Product = $scope.p;
	ProductDisplayService.setNewLineItemScope($scope);
	ProductDisplayService.setProductViewScope($scope);
	$scope.allowAddToOrderInProductList = $scope.allowAddToOrder && $scope.LineItem.Specs.length == 0 && $scope.LineItem.Product.Type != 'VariableText';

    //My Code
    $scope.getVariant = function(data) {
        data.Product.selected = true;
        Product.get(data.Product.InteropID, function(p){
            p.Quantity = data.Quantity
            $rootScope.$broadcast("loaded", p);
        })
    }
    $scope.removeVariant = function(data) {
        data.Product.selected = false;
        Product.get(data.Product.InteropID, function(p){
            p.Quantity = null;
            $rootScope.$broadcast("unloaded", p);
        })
    }
}]);