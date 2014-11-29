(function () {

    var app = angular.module('expenseApp',
        ['ngRoute', 'ngAnimate', 'wc.directives', 'ui.bootstrap']);

    app.config(['$routeProvider', function ($routeProvider) {
        var viewBase = '/app/expenseApp/views/';

        $routeProvider
            .when('/employees', {
                controller: 'EmployeesController',
                templateUrl: viewBase + 'employees/employees.html',
                controllerAs: 'vm'
            })
            .when('/employeeExpenses/:employeeId', {
                controller: 'EmployeeExpensesController',
                templateUrl: viewBase + 'employees/employeeExpenses.html',
                controllerAs: 'vm'
            })
            .when('/employeeEdit/:employeeId', {
                controller: 'EmployeeEditController',
                templateUrl: viewBase + 'employees/employeeEdit.html',
                controllerAs: 'vm'
            })
            .when('/expenses', {
                controller: 'ExpensesController',
                templateUrl: viewBase + 'expenses/expenses.html',
                controllerAs: 'vm'
            })
            .when('/about', {
                controller: 'AboutController',
                templateUrl: viewBase + 'about.html'
            })
            .otherwise({ redirectTo: '/employees' });
    }]);

}());

