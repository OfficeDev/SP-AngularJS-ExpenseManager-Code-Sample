(function() {

    var ExpenseChildController = function ($scope) {
        var vm = this;

        vm.employee = null;
        vm.orderby = 'product';
        vm.reverse = false;
        vm.expensesTotal = 0.00;

        init();

        vm.setOrder = function (orderby) {
            if (orderby === vm.orderby) {
                vm.reverse = !vm.reverse;
            }
            vm.orderby = orderby;
        };

        function init() {
            //See if parent $scope has an employee that's inherited (ExpensesController)
            if ($scope.employee) {
                vm.employee = $scope.employee;
                updateTotal($scope.employee);
            //Employee not available yet so listen for availability (EmployeeExpensesController)
            } else {                
                $scope.$on('employee', function (event, employee) {
                    vm.employee = employee;
                    updateTotal(employee);
                })
            }
        }

        function updateTotal(employee) {
            if (employee && employee.expenses) {
                var total = 0.00;
                for (var i = 0; i < employee.expenses.length; i++) {
                    var order = employee.expenses[i];
                    total += order.orderTotal;
                }
                vm.expensesTotal = total;
            }
        }
    };

    ExpenseChildController.$inject = ['$scope'];

    angular.module('expenseApp').controller('ExpenseChildController', ExpenseChildController);

}());