(function () {

    var EmployeeExpensesController = function ($scope, $routeParams, $window, dataService) {
        var vm = this;
        //Grab employeeId off of the route        
        var employeeId = ($routeParams.employeeId) ? parseInt($routeParams.employeeId) : 0;

        vm.employee = {};
        vm.expensesTotal = 0.00;

        init();

        function init() {
            if (employeeId > 0) {
                dataService.getEmployeeExpenses(employeeId)
                .then(function (employee) {
                    vm.employee = employee;
                    $scope.$broadcast('employee', employee);
                }, function (error) {
                    $window.alert("Sorry, an error occurred: " + error.message);
                });
            }
        }
    };

    EmployeeExpensesController.$inject = ['$scope', '$routeParams', '$window', 'dataService'];

    angular.module('expenseApp').controller('EmployeeExpensesController', EmployeeExpensesController);

}());