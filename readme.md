Expense Manager with AngularJS, SharePoint/Office 365 and Windows Azure Active Directory (WAAD)
===============

If you’re new to AngularJS check out the [AngularJS in 60-ish Minutes](http://weblogs.asp.net/dwahlin/video-tutorial-angularjs-fundamentals-in-60-ish-minutes) video tutorial or download the [free eBook](http://weblogs.asp.net/dwahlin/angularjs-in-60-ish-minutes-the-ebook). Also check out [The AngularJS Magazine](http://flip.it/bdyUX) for up-to-date information on using AngularJS to build Single Page Applications (SPAs).

This application is a stand-alone AngularJS application that performs CRUD operations against SharePoint/Office 365. Authentication relies on Windows Azure Active Directory (WAAD).
This application demonstrates:

* Consuming data provided by SharePoint/Office 365 RESTful APIs
* Authentication against Windows Azure Active Directory (WAAD)
* A custom "middle-man" proxy that allows cross-domain calls to be made to SharePoint/Office 365
* A complete application with read-only and editable data
* Using AngularJS with $http in a factory to access a backend RESTful service
* Techniques for showing multiple views of data (card view and list view)
* Custom filters for filtering customer and product data
* A custom directive to ensure unique values in a form for email 
* A custom directive that intercepts $http and jQuery XHR requests (in case either are used) and displays a loading dialog
* A custom directive that handles highlighting menu items automatically based upon the path navigated to by the user
* Form validation using AngularJS

To get the application running you'll need to do the following:

* Load the Expenses.wsp template into an existing Office 365/SharePoint site. This will create an Expenses site with 3 lists for employees, expenses, and states.
* Open web.config and update the SharePointResourceId and SharePointServiceRoot values to your Office 365/SharePoint Tenant value. Example: https://your_tenant.sharepoint.com.
* Open index.html and update the value assigned to expenseManager.baseSPUrl (located at the bottom of the page in the <script> tag) to your Office 365/SharePoint Tenant value.
* Create a new directory in Windows Azure Active Directory (WAAD) if you don't already have one and add a user into it.
* Add a new application into it named ExpenseManager.office365app ( more details need to be added here )
* In web.config update the ida:ClientID and ida:Password values with the appropriate values from your WAAD ExpenseManager.office365app application.
