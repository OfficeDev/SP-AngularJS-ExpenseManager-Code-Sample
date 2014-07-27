using ExpenseManager.SharePointHelpers;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Principal;
using System.Threading.Tasks;
using System.Web;

namespace ExpenseManager.Modules
{
    public class MAADModule : IHttpModule
    {
        public void Init(HttpApplication context)
        {
            EventHandlerTaskAsyncHelper asyncHelper = new EventHandlerTaskAsyncHelper(PreRequestHandlerExecute);
            context.AddOnPreRequestHandlerExecuteAsync(asyncHelper.BeginEventHandler, asyncHelper.EndEventHandler);
        }

        public void Dispose() { }

        public async Task PreRequestHandlerExecute(object sender, EventArgs e)
        {
            Debug.WriteLine("In PreRequestHandlerExecute");
            var authInfo = await SharePointAuth.GetAuthInfo();
            var token = await authInfo.GetAccessToken();

            var userName = authInfo.IdToken.UPN;
            System.Threading.Thread.CurrentPrincipal =
                new GenericPrincipal(new GenericIdentity(userName), null);
            HttpContext.Current.Items.Add(userName, token);
        }
    }
}