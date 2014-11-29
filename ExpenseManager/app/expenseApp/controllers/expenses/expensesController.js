(function () {

    var ExpensesController = function ($filter, $window, dataService) {
        var vm = this;

        vm.employees = [];
        vm.filteredEmployees = [];
        vm.pagedEmployees = [];
        vm.filteredCount = 0;
        vm.searchText = null;

        //paging
        vm.totalRecords = 0;
        vm.pageSize = 5;
        vm.currentPage = 1;
        vm.numRecordsDisplaying;

        vm.pageChanged = function (page) {
            vm.currentPage = page;
            pageRecords();
        };

        vm.searchTextChanged = function () {
            filterEmployeesExpenses(vm.searchText);
        };

        function init() {
            getEmployeesAndExpenses();
        }

        function filterEmployeesExpenses(filterText) {
            vm.filteredEmployees = $filter("nameExpenseFilter")(vm.employees, filterText);
            vm.filteredCount = vm.filteredEmployees.length;

            //Factor in paging
            vm.currentPage = 1;
            vm.totalRecords = vm.filteredCount;
            pageRecords();
        }

        function pageRecords() {
            var useFiltered = vm.searchText && vm.searchText.length > 0,
                pageStart = (vm.currentPage - 1) * vm.pageSize,
                pageEnd = pageStart + vm.pageSize;

            if (useFiltered) {
                if (pageEnd > vm.filteredCount) pageEnd = vm.filteredCount;
            }
            else {
                if (pageEnd > vm.employees.length) pageEnd = vm.employees.length;
                vm.totalRecords = vm.employees.length;
            }

            vm.pagedEmployees = (useFiltered) ? vm.filteredEmployees.slice(pageStart, pageEnd) : vm.employees.slice(pageStart, pageEnd);
            vm.numRecordsDisplaying = vm.pagedEmployees.length;
        }

        function getEmployeesAndExpenses() {
            dataService.getEmployeesAndExpenses()
                .then(function (employees) {
                        vm.totalRecords = employees.length;
                        vm.employees = employees;
                        filterEmployeesExpenses('');
                   }, function (error) {
                        $window.alert(error.message);
                });
        }

        init();

    };

    ExpensesController.$inject = ['$filter', '$window', 'dataService'];

    angular.module('expenseApp').controller('ExpensesController', ExpensesController);

}());



