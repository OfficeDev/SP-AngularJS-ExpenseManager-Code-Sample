(function () {

    var dataService = function (config, $injector) {
        var service = $injector.get(config.dataService);
        return service;
    };

    dataService.$inject = ['config', '$injector'];

    angular.module('expenseApp').factory('dataService', dataService);

}());

