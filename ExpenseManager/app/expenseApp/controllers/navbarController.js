(function () {

    var NavbarController = function () {
        var vm = this;
        vm.isCollapsed = false;
        vm.appTitle = 'Expense Management';
    };

    NavbarController.$inject = ['$scope'];

    angular.module('expenseApp').controller('NavbarController', NavbarController);

}());
