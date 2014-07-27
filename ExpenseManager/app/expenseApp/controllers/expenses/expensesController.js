(function () {

    var ExpensesController = function ($scope, $filter, $window, dataService) {
        $scope.employees = [];
        $scope.filteredEmployees = [];
        $scope.pagedEmployees = [];
        $scope.filteredCount = 0;
        $scope.searchText = null;

        //paging
        $scope.totalRecords = 0;
        $scope.pageSize = 5;
        $scope.currentPage = 1;
        $scope.numRecordsDisplaying;

        $scope.pageChanged = function (page) {
            $scope.currentPage = page;
            pageRecords();
        };

        $scope.searchTextChanged = function () {
            filterEmployeesExpenses($scope.searchText);
        };

        function init() {
            getEmployeesAndExpenses();
        }

        function filterEmployeesExpenses(filterText) {
            $scope.filteredEmployees = $filter("nameExpenseFilter")($scope.employees, filterText);
            $scope.filteredCount = $scope.filteredEmployees.length;

            //Factor in paging
            $scope.currentPage = 1;
            $scope.totalRecords = $scope.filteredCount;
            pageRecords();
        }

        function pageRecords() {
            var useFiltered = $scope.searchText && $scope.searchText.length > 0,
                pageStart = ($scope.currentPage - 1) * $scope.pageSize,
                pageEnd = pageStart + $scope.pageSize;

            if (useFiltered) {
                if (pageEnd > $scope.filteredCount) pageEnd = $scope.filteredCount;
            }
            else {
                if (pageEnd > $scope.employees.length) pageEnd = $scope.employees.length;
                $scope.totalRecords = $scope.employees.length;
            }

            $scope.pagedEmployees = (useFiltered) ? $scope.filteredEmployees.slice(pageStart, pageEnd) : $scope.employees.slice(pageStart, pageEnd);
            $scope.numRecordsDisplaying = $scope.pagedEmployees.length;
        }

        function getEmployeesAndExpenses() {
            dataService.getEmployeesAndExpenses()
                .then(function (employees) {
                        $scope.totalRecords = employees.length;
                        $scope.employees = employees;
                        filterEmployeesExpenses('');
                   }, function (error) {
                        $window.alert(error.message);
                });
        }

        init();

    };

    ExpensesController.$inject = ['$scope', '$filter', '$window', 'dataService'];

    angular.module('expenseApp').controller('ExpensesController', ExpensesController);

}());



