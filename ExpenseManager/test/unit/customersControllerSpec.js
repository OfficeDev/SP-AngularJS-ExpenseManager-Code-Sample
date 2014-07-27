describe('employeesController Tests', function () {
    var $scope,
        createController,
        createBreezeController,
        fakeEmployeesService,
        q;

    fakeEmployeesService = {
        getEmployeesSummary: function () {
            var data = {
                totalRecords: 1,
                results: [{
                    "id": 1,
                    "firstName": "Marcus",
                    "lastName": "HighTower",
                    "city": "Phoenix",
                    "state": {
                        "id": 1,
                        "abbreviation": "AZ",
                        "name": " Arizona"
                    },
                    "orderCount": 6,
                    "gender": "Male"
                }]
            }
            return q.when(data); //return promise
        }
    };

    //Define module under test
    beforeEach(function () {
        module('expenseApp');

        inject(function ($controller, $rootScope, $q) {
            $scope = $rootScope.$new();
            q = $q;

            //Create a re-useable way to create controllers that use different factories
            createController = function () {
                return $controller('EmployeesController', {
                    $scope: $scope,
                    dataService: fakeEmployeesService
                });
            };
        });
    });

    it('should have 1 employee when using $http factory', function () {
        var ctrl = createController();
        $scope.$apply(); //Ensure promises are resolved
        expect($scope.employees.length).toEqual(1);
    });

    it('should have 1 totalRecord when using $http factory', function () {
        var ctrl = createController();
        $scope.$apply(); //Ensure promises are resolved
        expect($scope.totalRecords).toEqual(1);
    });

    it('should switch to card view', function () {
        var ctrl = createController();
        $scope.changeDisplayMode($scope.DisplayModeEnum.Card);
        $scope.$apply();
        expect($scope.listDisplayModeEnabled).toBe(false);
    });

    it('should switch to list view', function () {
        var ctrl = createController();
        $scope.changeDisplayMode($scope.DisplayModeEnum.List);
        $scope.$apply();
        expect($scope.listDisplayModeEnabled).toBe(true);
    });

    describe('employeesController Filtering Tests', function () {

        it('should return 1 filtered employee', function () {
            var ctrl = createController();
            doFilter({
                filter: '',
                expectedCount: 1
            });
        });

        it('should filter and return 0 employees', function () {
            var ctrl = createController();
            doFilter({
                filter: 'Foo',
                expectedCount: 0
            });
        });

        it('should filter by firstName and return 1 employee', function () {
            var ctrl = createController();
            doFilter({
                filter: 'Marcus',
                expectedCount: 1
            });
        });

        it('should filter by lastName and return 1 employee', function () {
            var ctrl = createController();
            doFilter({
                filter: 'HighTower',
                expectedCount: 1
            });
        });

        it('should filter by city and return 1 employee', function () {
            var ctrl = createController();
            doFilter({
                filter: 'Phoenix',
                expectedCount: 1
            });
        });

        it('should filter by state and return 1 employee', function () {
            var ctrl = createController();
            doFilter({
                filter: 'Arizona',
                expectedCount: 1
            });
        });

        function doFilter(data) {
            $scope.searchText = data.filter;
            $scope.$apply();
            $scope.searchTextChanged();
            expect($scope.filteredEmployees).not.toBe([]);
            expect($scope.filteredCount).toEqual(data.expectedCount);
        }
    });

});
