(function () {

    var EmployeesController = function ($location, $filter, $window, $timeout, dataService, modalService) {
        var vm = this;

        vm.employees = [];
        vm.filteredEmployees = [];
        vm.pagedEmployees = [];
        vm.filteredCount = 0;
        vm.orderby = 'lastName';
        vm.reverse = false;
        vm.searchText = null;
        vm.cardAnimationClass = 'card-animation';

        //paging
        vm.totalRecords = 0;
        vm.pageSize = 10;
        vm.currentPage = 1;
        vm.numRecordsDisplaying;

        vm.pageChanged = function (page) {
            vm.currentPage = page;
            pageRecords();
        };

        vm.deleteEmployee = function (id) {

            var emp = getEmployeeById(id);
            var empName = emp.firstName + ' ' + emp.lastName;

            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Employee',
                headerText: 'Delete ' + empName + '?',
                bodyText: 'Are you sure you want to delete this employee?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                    dataService.deleteEmployee(emp).then(function () {
                        for (var i = 0; i < vm.employees.length; i++) {
                            if (vm.employees[i].id == id) {
                                vm.employees.splice(i, 1);
                                break;
                            }
                        }
                        filterEmployees(vm.searchText);
                    }, function (error) {
                        $window.alert('Error deleting employee: ' + error.message);
                    });
                }
            });
        };

        vm.DisplayModeEnum = {
            Card: 0,
            List: 1
        };

        vm.changeDisplayMode = function (displayMode) {
            switch (displayMode) {
                case vm.DisplayModeEnum.Card:
                    vm.listDisplayModeEnabled = false;
                    break;
                case vm.DisplayModeEnum.List:
                    vm.listDisplayModeEnabled = true;
                    break;
            }
        };

        vm.navigate = function (url) {
            $location.path(url);
        };

        vm.setOrder = function (orderby) {
            if (orderby === vm.orderby) {
                vm.reverse = !vm.reverse;
            }
            vm.orderby = orderby;
        };

        vm.searchTextChanged = function () {
            filterEmployees();
        };

        function init() {
            getEmployeesSummary();
        }

        function getEmployeesSummary() {
            dataService.getEmployeesSummary(vm.currentPage - 1, vm.pageSize)
            .then(function (data) {
                vm.totalRecords = data.totalRecords;
                vm.employees = data.results;
                filterEmployees(''); //Trigger initial filter

                $timeout(function() {
                    vm.cardAnimationClass = ''; //Turn off animation
                }, 1000);

            }, function (error) {
                $window.alert('Sorry, an error occurred: ' + error.data.message);
            });
        }

        function filterEmployees() {
            vm.filteredEmployees = $filter("nameCityStateFilter")(vm.employees, vm.searchText);
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
            vm.pagingInfo = {
                currentPage: vm.currentPage,
                totalRecords: vm.totalRecords,
                pageStart: pageStart,
                pageEnd: pageEnd,
                pagedEmployeeLength: vm.pagedEmployees.length,
                numRecordsDisplaying: vm.numRecordsDisplaying
            };
        }

        function getEmployeeById(id) {
            for (var i = 0; i < vm.employees.length; i++) {
                var emp = vm.employees[i];
                if (emp.id === id) {
                    return emp;
                }
            }
            return null;
        }

        init();
    };

    EmployeesController.$inject = ['$location', '$filter', '$window', '$timeout', 'dataService', 'modalService'];

    angular.module('expenseApp').controller('EmployeesController', EmployeesController);

}());
