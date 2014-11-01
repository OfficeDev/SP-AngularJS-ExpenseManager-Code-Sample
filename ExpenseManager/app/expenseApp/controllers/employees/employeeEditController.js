(function () {

    var EmployeeEditController = function ($rootScope, $scope, $location, $routeParams, $timeout, config, dataService, modalService) {

        var employeeId = ($routeParams.employeeId) ? parseInt($routeParams.employeeId) : 0,
            timer,
            onRouteChangeOff;

        $scope.employee = {};
        $scope.states = [];
        $scope.title = (employeeId > 0) ? 'Edit' : 'Add';
        $scope.buttonText = (employeeId > 0) ? 'Update' : 'Add';
        $scope.updateStatus = false;
        $scope.errorMessage = '';

        $scope.isStateSelected = function (employeeStateId, stateId) {
            return employeeStateId === stateId;
        };

        $scope.saveEmployee = function () {
            if ($scope.editForm.$valid) {
                if (!$scope.employee.id) {
                    dataService.insertEmployee($scope.employee).then(function (insertedEmployee) {
                        $scope.employee = insertedEmployee;
                        processSuccess();
                    },
                    processError);
                }
                else {
                    dataService.updateEmployee($scope.employee).then(processSuccess, processError);
                }
            }
        };

        $scope.deleteEmployee = function () {
            var empName = $scope.employee.firstName + ' ' + $scope.employee.lastName;
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Employee',
                headerText: 'Delete ' + empName + '?',
                bodyText: 'Are you sure you want to delete this employee?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                    dataService.deleteEmployee($scope.employee).then(function () {
                        onRouteChangeOff(); //Stop listening for location changes
                        $location.path('/employees');
                    }, processError);
                }
            });
        };

        function init() {

            getStates();

            if (employeeId > 0) {
                dataService.getEmployee(employeeId).then(function (employee) {
                    $scope.employee = employee;
                }, processError);
            } else {
                dataService.newEmployee().then(function (employee) {
                    $scope.employee = employee;
                });

            }            

            //Make sure they're warned if they made a change but didn't save it
            //Call to $on returns a "deregistration" function that can be called to
            //remove the listener (see routeChange() for an example of using it)
            onRouteChangeOff = $scope.$on('$locationChangeStart', routeChange);
        }

        init();

        function routeChange(event, newUrl) {
            //Navigate to newUrl if the form isn't dirty
            if (!$scope.editForm || !$scope.editForm.$dirty) return;

            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Ignore Changes',
                headerText: 'Unsaved Changes',
                bodyText: 'You have unsaved changes. Leave the page?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                    onRouteChangeOff(); //Stop listening for location changes
                    $location.path($location.url(newUrl).hash()); //Go to page they're interested in
                }
            });

            //prevent navigation by default since we'll handle it
            //once the user selects a dialog option
            event.preventDefault();
            return;
        }

        function getStates() {
            dataService.getStates().then(function (states) {
                $scope.states = states;
            }, processError);
        }

        function processSuccess() {
            $scope.editForm.$dirty = false;
            $scope.updateStatus = true;
            $scope.title = 'Edit';
            $scope.buttonText = 'Update';
            startTimer();
        }

        function processError(error) {
            $scope.errorMessage = error.message;
            startTimer();
        }

        function startTimer() {
            timer = $timeout(function () {
                $timeout.cancel(timer);
                $scope.errorMessage = '';
                $scope.updateStatus = false;
            }, 3000);
        }
    };

    EmployeeEditController.$inject = ['$rootScope', '$scope', '$location', '$routeParams',
                                      '$timeout', 'config', 'dataService', 'modalService'];

    angular.module('expenseApp').controller('EmployeeEditController', EmployeeEditController);

}());