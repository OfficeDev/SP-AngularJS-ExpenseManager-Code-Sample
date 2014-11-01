(function () {

    var employeesFactory = function ($http, $q, $window, $location, $timeout) {
        var serviceBase = '/Handlers/WebProxy.ashx?url=',
            refreshUrlBase = '/home/refreshtoken?returnUrl=',
            baseSPUrl = expenseManager.baseSPUrl,
            baseSPListsUrl = baseSPUrl + 'web/lists/';
        factory = {
            itemCount: 0,
            expenses: null
        },
        requestDigest = null;

        factory.getEmployeesAndExpenses = function (pageIndex, pageSize) {

            //This will get all expenses and the employee (nested) but won't group expenses by employee
            //return $http.get(serviceBase + encodeURIComponent(baseSPListsUrl + "getByTitle('Expenses')/items?$select=Amount,Created,ExpenseCategory,Title,Employee/ID,Employee/FirstName,Employee/LastName&$expand=Employee"))
            //            .then(function (data) {
            //                var employees = data.d.results;
            //            });

            var deferred = $q.defer();
            var empsPromise = $http.get(serviceBase + encodeURIComponent(baseSPListsUrl +
                "getByTitle('Employees')/items?$select=ID,FirstName,LastName&$orderby=LastName,FirstName"));
            var expensesPromise = $http.get(serviceBase + encodeURIComponent(baseSPListsUrl +
                "getByTitle('Expenses')/items?$select=Amount,Created,ExpenseCategory,Title,Employee/Id&$expand=Employee/Id"));

            //Currently the SharePoint REST API doesn't make grabbing the employees & expenses
            //all at once so we're grabbing them individually
            $q.all([empsPromise, expensesPromise])
              .then(function (results) {
                  var employees = (results[0].data.d) ? caseProps(results[0].data.d.results, propStyleEnum.camelCase) : []; //Get employees data
                  var expenses = (results[1].data.d) ? caseProps(results[1].data.d.results, propStyleEnum.camelCase) : []; //Get expenses data

                  mapEmployeeToExpenses(employees, expenses);                

                  deferred.resolve(employees);
              },
              function (error) {
                  if (error.status === 302) {
                      deferred.resolve(null);
                      //Potential infinite loop here - haven't dealt with that possibility yet
                      $window.location.href = getRedirectUrl();
                  }
              });

            return deferred.promise; //Return promise to caller
        };

        factory.getEmployeesSummary = function (pageIndex, pageSize) {
            var url = serviceBase + encodeURIComponent(baseSPListsUrl + "getByTitle('Employees')/items?$select=ID,FirstName,LastName,Address,City,State,Zip,Email,Gender&$orderby=LastName,FirstName");
            return getPagedResource(url, pageIndex, pageSize);
        };

        factory.getStates = function () {
            var url = serviceBase + encodeURIComponent(baseSPListsUrl + "getByTitle('States')/items?$select=Title&$orderby=Title");
            return $http.get(url).then(
                function (result) {
                    return caseProps(result.data.d.results, propStyleEnum.camelCase);
                });
        };

        factory.getEmployee = function (id) {
            var url = serviceBase + encodeURIComponent(baseSPListsUrl + "getByTitle('Employees')/items(" + id + ")?$select=ID,FirstName,LastName,Address,City,State,Zip,Email,Gender");
            return $http.get(url).then(function (result) {
                var cust = caseProps(result.data.d, propStyleEnum.camelCase);
                cust.zip = parseInt(cust.zip);
                return cust;
            },
            function (error) {
                if (error.status === 302) {
                    //Potential infinite loop here - haven't dealt with that possibility yet
                    $window.location.href = getRedirectUrl();
                }
            });
        };

        factory.checkUniqueValue = function (id, property, value) {
            if (!id) id = 0;
            return $http.get(serviceBase + 'checkUnique/' + id + '?property=' + property + '&value=' + escape(value)).then(
                function (results) {
                    return results.data.status;
                });
        };

        factory.getEmployeeExpenses = function (id) {

            var deferred = $q.defer();
            var empPromise = factory.getEmployee(id);
            var expensesPromise = $http.get(serviceBase + encodeURIComponent(baseSPListsUrl + "getByTitle('Expenses')/items?$filter=Employee eq " + id + "&$select=Amount,Created,ExpenseCategory,Title"));

            $q.all([empPromise, expensesPromise])
              .then(function (results) {
                  var employee = results[0]; //Get customer data
                  employee.expenses = caseProps(results[1].data.d.results, propStyleEnum.camelCase); //Get expenses data

                  calculateExpensesTotal(employee);

                  deferred.resolve(employee);
              },
              function (error) {
                  if (error.status === 302) {
                      deferred.resolve(null);
                      //Potential infinite loop here - haven't dealt with that possibility yet
                      $window.location.href = getRedirectUrl();
                  }
              });

            return deferred.promise; //Return promise to caller

        },

        factory.insertEmployee = function (employee) {

            employee = caseProps(employee, propStyleEnum.pascalCase);
            employee.Title = employee.FirstName + ' ' + employee.LastName;
            employee.Zip = employee.Zip.toString(); //Zip is a string in SharePoint
            employee.__metadata = { type: 'SP.Data.EmployeesListItem' };

            var options = {
                url: serviceBase + encodeURIComponent(baseSPListsUrl + "getByTitle('Employees')/items"),
                method: 'POST',
                data: JSON.stringify(employee),
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'X-RequestDigest': requestDigest
                },
            };

            return $http(options).then(function (result) {
                var cust = caseProps(result.data.d, propStyleEnum.camelCase);
                cust.zip = parseInt(cust.zip); //SharePoint Zip field is a string so convert to int
                return cust;
            },
            function (error) {
                $window.alert(error.message);
                return error;
            });
        };

        factory.newEmployee = function () {
            return $q.when({ });
        };

        factory.updateEmployee = function (employee) {

            employee = caseProps(employee, propStyleEnum.pascalCase);
            employee.Title = employee.FirstName + ' ' + employee.LastName;
            employee.Zip = employee.Zip.toString(); //Zip is a string in SharePoint

            var options = {
                url: serviceBase + encodeURIComponent(employee.__metadata.uri),
                method: 'MERGE',
                data: JSON.stringify(employee),
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'If-Match': employee.__metadata.etag,
                    'X-RequestDigest': requestDigest
                }
            };

            return $http(options);

        };

        factory.deleteEmployee = function (employee) {

            var options = {
                url: serviceBase + encodeURIComponent(employee.__metadata.uri),
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'If-Match': employee.__metadata.etag,
                    'X-RequestDigest': requestDigest
                }
            };

            return $http(options).then(function (status) {
                return status.data;
            },
            function (error) {
                $window.alert(error.message);
                return error;
            });
        };
        
        function getRequestDigest() {

            var options = {
                url: serviceBase + encodeURIComponent(baseSPUrl + 'contextinfo'),
                method: 'POST',
                headers: {
                    //Following will be set in HTTP Handler but listed here for completeness
                    'Accept': 'application/json;odata=verbose',
                    'ContextInfoRequest': true
                }
            };

            $http(options).success(function (data) {
                if (data && data.d) requestDigest = data.d.GetContextWebInformation.FormDigestValue;
            });
        }

        getRequestDigest();

        function getRedirectUrl() {
            var port = ($location.port()) ? ':' + $location.port() : '';
            var link = $location.protocol() + '://' + $location.host() + port +
                   refreshUrlBase + encodeURIComponent($location.absUrl());
            return link;
        }

        function getPagedResource(baseResource, pageIndex, pageSize) {
            var url = baseResource;
            //url; += (arguments.length == 3) ? buildPagingUri(pageIndex, pageSize) : '';

            //Server-side paging not currently implemented due to lack of proper paging support
            //in SharePoint OData/REST api.
            var deferred = $q.defer();
            var countPromise = $http.get(serviceBase + encodeURIComponent(baseSPListsUrl + "getByTitle('Employees')/itemcount"));
            var empPromise = $http.get(url);

            $q.all([countPromise, empPromise])
              .then(function (results) {
                  var custCount = (results[0].data.d) ? results[0].data.d.ItemCount : 0; //Get countPromise data
                  var custs = (results[1].data.d) ? caseProps(results[1].data.d.results, propStyleEnum.camelCase) : []; //Get empPromise data

                  //extendEmployees(custs);
                  var custData = {
                      totalRecords: custCount,
                      results: custs
                  };

                  deferred.resolve(custData);
              },
              function (error) {
                  if (error.status === 302) {
                      deferred.resolve(null);
                      //Potential infinite loop here - haven't dealt with that possibility yet
                      $window.location.href = getRedirectUrl();
                  }
              });

            return deferred.promise; //Return promise to caller
        }

        function buildPagingUri(pageIndex, pageSize) {
            var uri = '&$skip=' + (pageIndex * pageSize) + '&$top=' + pageSize;
            return uri;
        }

        function mapEmployeeToExpenses(employees, expenses) {
            if (employees && expenses) {
                for (var i = 0; i < employees.length; i++) {
                    var employee = employees[i];
                    var employeeExpenses = [];
                    for (var j = 0; j < expenses.length; j++) {
                        var expense = expenses[j];
                        if (expense.employee.Id === employee.id) { //Case of "Id" is correct for this instance
                            employeeExpenses.push(expense);
                        }
                    }
                    employee.expenses = employeeExpenses;
                    calculateExpensesTotal(employee);
                }
            }
        }

        function extendEmployees(employees) {
            var employeesLen = employees.length;
            //Iterate through employees
            for (var i = 0; i < employeesLen; i++) {
                var employee = employees[i];
                calculateExpensesTotal(employee);
            }
        }

        function calculateExpensesTotal(employee) {
            var expensesLen = employee.expenses.length;
            employee.expensesTotal = 0;
            //Iterate through expenses
            for (var j = 0; j < expensesLen; j++) {
                employee.expensesTotal += employee.expenses[j].amount;
            }
        }

        var propStyleEnum = {
            camelCase: 'camel',
            pascalCase: 'pascal'
        };

        function caseProps(obj, propStyle) {

            function caseProp(str) {
                if (!str) return str;

                //Camel Case Option
                if (!propStyle || propStyle === propStyleEnum.camelCase) {
                    return str.charAt(0).toLowerCase() + str.slice(1);
                }
                //Pascal Case Option
                else {
                    //SharePoint-specific fields to worry about
                    if (str !== '__metadata') {
                        return str.charAt(0).toUpperCase() + str.slice(1);
                    }
                    return str;
                }
            }

            function iterate(obj) {
                var newObj = {};
                for (prop in obj) {
                    newObj[caseProp(prop)] = obj[prop];
                }
                return newObj;
            }

            if (Array.isArray(obj)) {
                var newArray = [];
                for (var i = 0; i < obj.length; i++) {
                    newArray.push(iterate(obj[i]));
                }
                return newArray;
            }
            else {
                return iterate(obj);
            }

        }

        function getItemTypeForListName(listName) {
            return "SP.Data." + listName.charAt(0).toUpperCase() + listName.slice(1) + "ListItem";
        }

        return factory;
    };

    employeesFactory.$inject = ['$http', '$q', '$window', '$location', '$timeout'];

    angular.module('expenseApp').factory('employeesSharePointService', employeesFactory);

}());