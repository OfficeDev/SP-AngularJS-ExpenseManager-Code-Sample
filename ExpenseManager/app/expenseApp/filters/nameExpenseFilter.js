(function () {

    var nameExpenseFilter = function () {

        function matchesExpense(employee, filterValue) {
            if (employee.expenses) {
                for (var i = 0; i < employee.expenses.length; i++) {
                    if (employee.expenses[i].title.toLowerCase().indexOf(filterValue) > -1) {
                        return true;
                    }
                }
            }
            return false;
        }

        return function (employees, filterValue) {
            if (!filterValue || !employees) return employees;

            var matches = [];
            filterValue = filterValue.toLowerCase();
            for (var i = 0; i < employees.length; i++) {
                var emp = employees[i];
                if (emp.firstName.toLowerCase().indexOf(filterValue) > -1 ||
                    emp.lastName.toLowerCase().indexOf(filterValue) > -1 ||
                    matchesExpense(emp, filterValue)) {

                    matches.push(emp);
                }
            }
            return matches;
        };
    };

    angular.module('expenseApp').filter('nameExpenseFilter', nameExpenseFilter);

}());