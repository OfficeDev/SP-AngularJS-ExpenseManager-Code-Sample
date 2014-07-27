using ExpenseManager.SharePointHelpers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;

namespace ExpenseManager
{
    public class Global : System.Web.HttpApplication
    {

        //public Global()
        //{
        //    var wrapper = new EventHandlerTaskAsyncHelper(AuthenticateAsync);
        //    this.AddOnAuthenticateRequestAsync(wrapper.BeginEventHandler, wrapper.EndEventHandler);
        //}

        protected void Application_Start(object sender, EventArgs e)
        {
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            WebApiConfig.Configure(GlobalConfiguration.Configuration);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }


        //private async Task AuthenticateAsync(object sender, EventArgs e)
        //{
        //    var app = (HttpApplication)sender;
        //    var context = app.Context;

        //    var authInfo = await SharePointApi.GetAuthInfo();
        //    var token = await authInfo.GetAccessToken();

        //    var userName = authInfo.IdToken.UPN;
        //    System.Threading.Thread.CurrentPrincipal =
        //        new GenericPrincipal(new GenericIdentity(userName), null);
        //    HttpContext.Current.Items.Add("Token", token);
        //}

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {
            Debug.WriteLine(Server.GetLastError().Message);
        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}