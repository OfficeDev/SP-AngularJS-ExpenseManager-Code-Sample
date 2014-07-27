(function() {

    var OrderChildController = function ($scope) {
        $scope.orderby = 'product';
        $scope.reverse = false;
        $scope.expensesTotal = 0.00;

        init();

        $scope.setOrder = function (orderby) {
            if (orderby === $scope.orderby) {
                $scope.reverse = !$scope.reverse;
            }
            $scope.orderby = orderby;
        };

        function init() {
            //Calculate grand total
            //Handled at this level so we don't duplicate it across parent controllers
            if ($scope.employee && $scope.employee.expenses) {
                var total = 0.00;
                for (var i = 0; i < $scope.employee.expenses.length; i++) {
                    var order = $scope.employee.expenses[i];
                    total += order.orderTotal;
                }
                $scope.expensesTotal = total;
            }
        }
    };

    OrderChildController.$inject = ['$scope'];

    angular.module('expenseApp').controller('OrderChildController', OrderChildController);

}());