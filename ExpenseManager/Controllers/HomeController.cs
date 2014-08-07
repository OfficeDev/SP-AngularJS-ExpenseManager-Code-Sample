using ExpenseManager.SharePointHelpers;
using Microsoft.Office365.OAuth;
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
            try
            {
                var client = await SharePointAuth.EnsureClientCreated();
                Response.Redirect("/index.html");
                return View();
            }
            catch (RedirectRequiredException ex)
            {
                return Redirect(ex.RedirectUri.ToString());
            }

        }

        public async Task<ActionResult> Title()
        {
            ViewBag.Title = await SharePointAuth.GetSiteTitle();
            return View();
        }

        public async Task<ActionResult> RefreshToken(string returnUrl)
        {
            await SharePointAuth.EnsureClientCreated();
            Response.Redirect(Server.UrlDecode(returnUrl));
            return View();
        }
    }
}