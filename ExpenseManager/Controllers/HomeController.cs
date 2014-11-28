using ExpenseManager.SharePointHelpers;
using ExpenseManager.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ExpenseManager.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        [AllowAnonymous]
        public ActionResult Index()
        {
            ViewBag.Title = "Employee Expenses";
            return View();
        }

        //Will trigger AD authentication due to Authorize attribute on the controller
        public ActionResult Login()
        {
            return new RedirectResult("/index.html");
        }

        public ActionResult RefreshToken(string returnUrl)
        {
            SharePointAuth.RefreshSession();
            return new RedirectResult(Server.UrlDecode(returnUrl));
        }

        //Quick and dirty way to test that auth is working properly to AD and SharePoint
        public async Task<ActionResult> Title()
        {
            var token = await SharePointAuth.GetAccessToken(SettingsHelper.SharePointDomainUri);
            WebClient wc = new WebClient();
            wc.Headers.Add("Method", "GET");
            wc.Headers.Add("Accept", "application/json;odata=verbose");
            wc.Headers.Add("Authorization", "Bearer " + token);
            var title = await wc.DownloadStringTaskAsync(SettingsHelper.SharePointApiServiceUri + "web/title");
            ViewBag.Title = title;
            return View();
        }
    }
}