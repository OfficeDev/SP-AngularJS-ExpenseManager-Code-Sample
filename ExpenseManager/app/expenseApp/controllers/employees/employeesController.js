(function () {

    var EmployeesController = function ($scope, $location, $filter, $window, $timeout, dataService, modalService) {

        $scope.employees = [];
        $scope.filteredEmployees = [];
        $scope.pagedEmployees = [];
        $scope.filteredCount = 0;
        $scope.orderby = 'lastName';
        $scope.reverse = false;
        $scope.searchText = null;
        $scope.cardAnimationClass = 'card-animation';

        //paging
        $scope.totalRecords = 0;
        $scope.pageSize = 10;
        $scope.currentPage = 1;
        $scope.numRecordsDisplaying;

        $scope.pageChanged = function (page) {
            $scope.currentPage = page;
            pageRecords();
        };

        $scope.deleteEmployee = function (id) {

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
                        for (var i = 0; i < $scope.employees.length; i++) {
                            if ($scope.employees[i].id == id) {
                                $scope.employees.splice(i, 1);
                                break;
                            }
                        }
                        filterEmployees($scope.searchText);
                    }, function (error) {
                        $window.alert('Error deleting employee: ' + error.message);
                    });
                }
            });
        };

        $scope.DisplayModeEnum = {
            Card: 0,
            List: 1
        };

        $scope.changeDisplayMode = function (displayMode) {
            switch (displayMode) {
                case $scope.DisplayModeEnum.Card:
                    $scope.listDisplayModeEnabled = false;
                    break;
                case $scope.DisplayModeEnum.List:
                    $scope.listDisplayModeEnabled = true;
                    break;
            }
        };

        $scope.navigate = function (url) {
            $location.path(url);
        };

        $scope.setOrder = function (orderby) {
            if (orderby === $scope.orderby) {
                $scope.reverse = !$scope.reverse;
            }
            $scope.orderby = orderby;
        };

        $scope.searchTextChanged = function () {
            filterEmployees();
        };

        function init() {
            getEmployeesSummary();
        }

        function getEmployeesSummary() {
            dataService.getEmployeesSummary($scope.currentPage - 1, $scope.pageSize)
            .then(function (data) {
                $scope.totalRecords = data.totalRecords;
                $scope.employees = data.results;
                filterEmployees(''); //Trigger initial filter

                $timeout(function() {
                    $scope.cardAnimationClass = ''; //Turn off animation
                }, 1000);

            }, function (error) {
                $window.alert('Sorry, an error occurred: ' + error.data.message);
            });
        }

        function filterEmployees() {
            $scope.filteredEmployees = $filter("nameCityStateFilter")($scope.employees, $scope.searchText);
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
            $scope.pagingInfo = {
                currentPage: $scope.currentPage,
                totalRecords: $scope.totalRecords,
                pageStart: pageStart,
                pageEnd: pageEnd,
                pagedEmployeeLength: $scope.pagedEmployees.length,
                numRecordsDisplaying: $scope.numRecordsDisplaying
            };
        }

        function getEmployeeById(id) {
            for (var i = 0; i < $scope.employees.length; i++) {
                var emp = $scope.employees[i];
                if (emp.id === id) {
                    return emp;
                }
            }
            return null;
        }

        init();
    };

    EmployeesController.$inject = ['$scope', '$location', '$filter', '$window', '$timeout', 'dataService', 'modalService'];

    angular.module('expenseApp').controller('EmployeesController', EmployeesController);

}());
