(function () {

    var EmployeeEditController = function ($scope, $location, $routeParams, $timeout, config, dataService, modalService) {
        var vm = this;

        var employeeId = ($routeParams.employeeId) ? parseInt($routeParams.employeeId) : 0,
            timer,
            onRouteChangeOff;

        vm.employee = {};
        vm.employee.id = employeeId;
        vm.states = [];
        vm.title = (employeeId > 0) ? 'Edit' : 'Add';
        vm.buttonText = (employeeId > 0) ? 'Update' : 'Add';
        vm.updateStatus = false;
        vm.errorMessage = '';

        vm.isStateSelected = function (employeeStateId, stateId) {
            return employeeStateId === stateId;
        };

        vm.saveEmployee = function () {
            if ($scope.editForm.$valid) {
                if (!vm.employee.id) {
                    dataService.insertEmployee(vm.employee).then(function (insertedEmployee) {
                        vm.employee = insertedEmployee;
                        processSuccess();
                    },
                    processError);
                }
                else {
                    dataService.updateEmployee(vm.employee).then(processSuccess, processError);
                }
            }
        };

        vm.deleteEmployee = function () {
            var empName = vm.employee.firstName + ' ' + vm.employee.lastName;
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Employee',
                headerText: 'Delete ' + empName + '?',
                bodyText: 'Are you sure you want to delete this employee?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                    dataService.deleteEmployee(vm.employee).then(function () {
                        onRouteChangeOff(); //Stop listening for location changes
                        $location.path('/employees');
                    }, processError);
                }
            });
        };

        function init() {

            getStates().then(function () {
                if (employeeId > 0) {
                    dataService.getEmployee(employeeId).then(function (employee) {
                        vm.employee = employee;
                    }, processError);
                }
            });



            //Make sure they're warned if they made a change but didn't save it
            //Call to $on returns a "deregistration" function that can be called to
            //remove the listener (see routeChange() for an example of using it)
            onRouteChangeOff = $scope.$on('$locationChangeStart', routeChange);
        }

        init();

        function routeChange(event, newUrl) {
            //Navigate to newUrl if the form isn't dirty
            if (!vm.editForm || !vm.editForm.$dirty) return;

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
            return dataService.getStates().then(function (states) {
                vm.states = states;
            }, processError);
        }

        function processSuccess() {
            $scope.editForm.$dirty = false;
            vm.updateStatus = true;
            vm.title = 'Edit';
            vm.buttonText = 'Update';
            startTimer();
        }

        function processError(error) {
            vm.errorMessage = error.message;
            startTimer();
        }

        function startTimer() {
            timer = $timeout(function () {
                $timeout.cancel(timer);
                vm.errorMessage = '';
                vm.updateStatus = false;
            }, 3000);
        }
    };

    EmployeeEditController.$inject = ['$scope', '$location', '$routeParams',
                                      '$timeout', 'config', 'dataService', 'modalService'];

    angular.module('expenseApp').controller('EmployeeEditController', EmployeeEditController);

}());