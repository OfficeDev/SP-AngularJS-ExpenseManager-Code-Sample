(function () {

    var NavbarController = function ($scope) {
        $scope.isCollapsed = false;
        $scope.appTitle = 'Expense Management';
    };

    NavbarController.$inject = ['$scope'];

    angular.module('expenseApp').controller('NavbarController', NavbarController);

}());
