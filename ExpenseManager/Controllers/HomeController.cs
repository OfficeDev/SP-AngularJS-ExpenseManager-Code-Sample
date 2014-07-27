using ExpenseManager.SharePointHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ExpenseManager.Controllers
{
    public class HomeController : Controller
    {

        public ActionResult Index()
        {
            ViewBag.Title = "Employee Expenses";
            return View();
        }

        public async Task<ActionResult> Login()
        {
            var authInfo = await SharePointAuth.GetAuthInfo();
            if (authInfo != null)
            {
                Response.Redirect("/index.html");
            }
            return View();
        }

        public async Task<ActionResult> Title()
        {
            ViewBag.Title = await SharePointAuth.GetSiteTitle();
            return View();
        }

        public async Task<ActionResult> RefreshToken(string returnUrl)
        {
            await SharePointAuth.GetAuthInfo();
            Response.Redirect(Server.UrlDecode(returnUrl));
            return View();
        }
    }
}