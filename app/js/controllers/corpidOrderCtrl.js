four51.app.controller('corpidOrderCtrl', ['$routeParams', '$sce', '$scope', '$451', 'Category', 'Product', 'Nav', '$rootScope','ProductDisplayService', 'Order', 'Variant', 'User', '$route', '$location', 'AddressList', 'FavoriteOrder', 'OrderConfig', 'Analytics','$filter',
    function ($routeParams, $sce, $scope, $451, Category, Product, Nav, $rootScope, ProductDisplayService, Order, Variant, User, $route, $location, AddressList, FavoriteOrder, OrderConfig, Analytics, $filter) {


//        categoryCtrl

        $scope.productLoadingIndicator = true;
        $scope.settings = {
            currentPage: 1,
            pageSize: 40
        };
        $scope.trusted = function(d){
            if(d) return $sce.trustAsHtml(d);
        }

        function _search() {
            $scope.searchLoading = true;
            Product.search($routeParams.categoryInteropID, null, null, function (products, count) {
                $scope.products = products;
                $scope.productCount = count;
                $scope.productLoadingIndicator = false;
                $scope.searchLoading = false;
            }, $scope.settings.currentPage, $scope.settings.pageSize);
        }

        $scope.$watch('settings.currentPage', function(n, o) {
            if (n != o || (n == 1 && o == 1))
                _search();
        });

        if ($routeParams.categoryInteropID) {
            $scope.categoryLoadingIndicator = true;
            Category.get($routeParams.categoryInteropID, function(cat) {
                $scope.currentCategory = cat;
                $scope.categoryLoadingIndicator = false;
            });
        }
        else if($scope.tree){
            $scope.currentCategory ={SubCategories:$scope.tree};
        }


        $scope.$on("treeComplete", function(data){
            if (!$routeParams.categoryInteropID) {
                $scope.currentCategory ={SubCategories:$scope.tree};
            }
        });

        // panel-nav
        $scope.navStatus = Nav.status;
        $scope.toggleNav = Nav.toggle;
        $scope.$watch('sort', function(s) {
            if (!s) return;
            (s.indexOf('Price') > -1) ?
                $scope.sorter = 'StandardPriceSchedule.PriceBreaks[0].Price' :
                $scope.sorter = s.replace(' DESC', "");
            $scope.direction = s.indexOf('DESC') > -1;
        });

//        productListCtrl
        $scope.loadSearch = function(){

            if($scope.category && $scope.category.products){
                $scope.Products = $scope.category.products;
                return;
            }

            if($scope.category) {
                Product.search($scope.categoryInteropID, null, null, function(data) {
                    $scope.category.products = $scope.Products = data;
                    $scope.productCount = data.Count;
                });
            }
        }

//        productCtrl

        $scope.selected = 1;
        $scope.LineItem = {};
        $scope.addToOrderText = "Add To Cart";
        $scope.loadingIndicator = true;
        $scope.loadingImage = true;
        $scope.searchTerm = null;
        $scope.settings = {
            currentPage: 1,
            pageSize: 10
        };

        $scope.calcVariantLineItems = function(i){
            $scope.variantLineItemsOrderTotal = 0;
            angular.forEach($scope.variantLineItems, function(item){
                $scope.variantLineItemsOrderTotal += item.LineTotal || 0;
            })
        };
        function setDefaultQty(lineitem) {
            if(lineitem.Product.StandardPriceSchedule){
                $scope.LineItem.Quantity = lineitem.Product.StandardPriceSchedule.DefaultQuantity > 0 ? lineitem.Product.StandardPriceSchedule.DefaultQuantity : null;
            }
        }
        function init(searchTerm) {
            ProductDisplayService.getProductAndVariant($routeParams.productInteropID, $routeParams.variantInteropID, function (data) {
                $scope.LineItem.Product = data.product;
                $scope.LineItem.Variant = data.variant;
                setDefaultQty($scope.LineItem);
                ProductDisplayService.setNewLineItemScope($scope);
                ProductDisplayService.setProductViewScope($scope);
                $scope.$broadcast('ProductGetComplete');
                $scope.loadingIndicator = false;
                $scope.setAddToOrderErrors();
            }, $scope.settings.currentPage, $scope.settings.pageSize, searchTerm);
        }
        $scope.$watch('settings.currentPage', function(n, o) {
            if (n != o || (n == 1 && o == 1))
                init($scope.searchTerm);
        });

        $scope.searchVariants = function(searchTerm) {
            $scope.searchTerm = searchTerm;
            $scope.settings.currentPage == 1 ?
                init(searchTerm) :
                $scope.settings.currentPage = 1;
        };

        $scope.deleteVariant = function(v, redirect) {
            if (!v.IsMpowerVariant) return;
            // doing this because at times the variant is a large amount of data and not necessary to send all that.
            var d = {
                "ProductInteropID": $scope.LineItem.Product.InteropID,
                "InteropID": v.InteropID
            };
            Variant.delete(d,
                function() {
                    redirect ? $location.path('/product/' + $scope.LineItem.Product.InteropID) : $route.reload();
                },
                function(ex) {
                    $scope.lineItemErrors.push(ex.Message);
                    $scope.showAddToCartErrors = true;
                }
            );
        }

        $scope.addToOrder = function(){
            if($scope.lineItemErrors && $scope.lineItemErrors.length){
                $scope.showAddToCartErrors = true;
                return;
            }
            if(!$scope.currentOrder){
                $scope.currentOrder = {};
                $scope.currentOrder.LineItems = [];
            }
            if($scope.allowAddFromVariantList){
                angular.forEach($scope.variantLineItems, function(item){
                    if(item.Quantity > 0){
                        $scope.currentOrder.LineItems.push(item);
                    }
                });
            }else{
                $scope.currentOrder.LineItems.push($scope.LineItem);
            }
            $scope.addToOrderIndicator = true;
            Order.save($scope.currentOrder,
                function(o){
                    $scope.user.CurrentOrderID = o.ID;
                    User.save($scope.user, function(){
                        $scope.addToOrderIndicator = true;
                        $location.path('/cart');
                    });
                },
                function(ex) {
                    $scope.addToOrderIndicator = false;
                    $scope.addToOrderError = ex.Message;
                    $route.reload();
                }
            );
        }

        $scope.$on('event:imageLoaded', function(event, result) {
            $scope.loadingImage = false;
            $scope.$apply();
        });

//        specFormCtrl

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

//        checkOutViewCtrl

//        if (!$scope.currentOrder) {
//            $location.path('catalog');
//        }

        AddressList.query(function(list) {
            $scope.addresses = list;
        });

        $scope.hasOrderConfig = OrderConfig.hasConfig($scope.currentOrder, $scope.user);
        $scope.checkOutSection = $scope.hasOrderConfig ? 'order' : 'shipping';

        $scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
        $scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };

        $scope.$on('event:AddressSaved', function(event, address) {
            if (address.IsShipping) {
                $scope.currentOrder.ShipAddressID = address.ID;
                if (!$scope.shipToMultipleAddresses)
                    $scope.setShipAddressAtOrderLevel();
                $scope.addressform = false;
            }
            if (address.IsBilling) {
                $scope.currentOrder.BillAddressID = address.ID;
                $scope.billaddressform = false;
            }
            AddressList.query(function(list) {
                $scope.addresses = list;
            });
            $scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
            $scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };
        });

        function submitOrder() {
            $scope.displayLoadingIndicator = true;
            $scope.errorMessage = null;
            Order.submit($scope.currentOrder,
                function(data) {
                    $scope.user.CurrentOrderID = null;
                    User.save($scope.user, function(data) {
                        $scope.user = data;
                        $scope.displayLoadingIndicator = false;
                    });
                    $scope.currentOrder = null;
                    $location.path('/order/' + data.ID);
                },
                function(ex) {
                    $scope.errorMessage = ex.Message;
                    $scope.displayLoadingIndicator = false;
                    $scope.shippingUpdatingIndicator = false;
                    $scope.shippingFetchIndicator = false;
                }
            );
        };

        $scope.$watch('currentOrder.CostCenter', function() {
            OrderConfig.address($scope.currentOrder, $scope.user);
        });

        function saveChanges(callback) {
            $scope.displayLoadingIndicator = true;
            $scope.errorMessage = null;
            $scope.actionMessage = null;
            var auto = $scope.currentOrder.autoID;
            Order.save($scope.currentOrder,
                function(data) {
                    $scope.currentOrder = data;
                    if (auto) {
                        $scope.currentOrder.autoID = true;
                        $scope.currentOrder.ExternalID = 'auto';
                    }
                    $scope.displayLoadingIndicator = false;
                    if (callback) callback($scope.currentOrder);
                    $scope.actionMessage = "Your changes have been saved";
                },
                function(ex) {
                    $scope.currentOrder.ExternalID = null;
                    $scope.errorMessage = ex.Message;
                    $scope.displayLoadingIndicator = false;
                    $scope.shippingUpdatingIndicator = false;
                    $scope.shippingFetchIndicator = false;
                }
            );
        };

        $scope.continueShopping = function() {
            if (confirm('Do you want to save changes to your order before continuing?') == true)
                saveChanges(function() { $location.path('catalog') });
            else
                $location.path('catalog');
        };

        $scope.cancelOrder = function() {
            if (confirm('Are you sure you wish to cancel your order?') == true) {
                $scope.displayLoadingIndicator = true;
                Order.delete($scope.currentOrder,
                    function() {
                        $scope.user.CurrentOrderID = null;
                        $scope.currentOrder = null;
                        User.save($scope.user, function(data) {
                            $scope.user = data;
                            $scope.displayLoadingIndicator = false;
                            $location.path('catalog');
                        });
                    },
                    function(ex) {
                        $scope.actionMessage = ex.Message;
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
        };

        $scope.saveChanges = function() {
            saveChanges();
        };

        $scope.submitOrder = function() {
            submitOrder();
        };

        $scope.saveFavorite = function() {
            FavoriteOrder.save($scope.currentOrder);
        };


        //My Code
        $scope.Specs = {};
        $scope.selectedProducts = [];
        $scope.$on('loaded',function(event,v) {
            $scope.specs = v.Specs;
            if( $scope.selectedProducts == ""){
                $scope.selectedProducts.push(v);
            }
            var isInArr = false;
            angular.forEach($scope.selectedProducts, function(m){
                if(m.InteropID == v.InteropID){
                    isInArr = true;
                }
            });
            if(!isInArr){
                $scope.selectedProducts.push(v);
            }
            angular.forEach($scope.specs, function (s) {
                if (!$scope.Specs[s.Name]) {
                    $scope.Specs[s.Name] = s;
                }
            });
        });

        $scope.createOrder = function() {
            var lineItems = [];
            angular.forEach($scope.selectedProducts, function(p){
                var variant = {
                    "ProductInteropID": p.InteropID,
                    "Specs": $scope.Specs
                };
                Variant.save(variant, function(v){
                    var lineitem = {
                        "Quantity": 1,
                        "Variant": v,
                        "Product": p,
                        "LineTotal": p.StandardPriceSchedule.PriceBreaks[0]* p.length,
                        "UnitPrice": p.StandardPriceSchedule.PriceBreaks[0],
                        "Specs": $scope.Specs
                    };
                    lineItems.push(lineitem);

                    if(lineItems.length == $scope.selectedProducts.length){
                        var order = {};
                        order.LineItems = [];
                        angular.forEach(lineItems, function(li){
                            order.LineItems.push(li);
                        });
                        Order.save(order,function(o){
                            $scope.user.currentOrderID = o.ID;
                            User.save($scope.user, function(user){
                                $location.path('corpidCheckout');
                            })
                        })
                    }
                });
            })
        };
    }]);