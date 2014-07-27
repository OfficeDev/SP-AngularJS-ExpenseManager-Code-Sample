(function () {

    var EmployeeExpensesController = function ($scope, $routeParams, $window, dataService) {
        //Grab employeeId off of the route        
        var employeeId = ($routeParams.employeeId) ? parseInt($routeParams.employeeId) : 0;

        $scope.employee = {};
        $scope.expensesTotal = 0.00;

        init();

        function init() {
            if (employeeId > 0) {
                dataService.getEmployeeExpenses(employeeId)
                .then(function (employee) {
                    $scope.employee = employee;
                }, function (error) {
                    $window.alert("Sorry, an error occurred: " + error.message);
                });
            }
        }
    };

    EmployeeExpensesController.$inject = ['$scope', '$routeParams', '$window', 'dataService'];

    angular.module('expenseApp').controller('EmployeeExpensesController', EmployeeExpensesController);

}());