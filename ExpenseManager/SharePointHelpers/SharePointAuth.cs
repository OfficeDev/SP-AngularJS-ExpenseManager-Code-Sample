using Microsoft.Office365.OAuth;
using Microsoft.Office365.SharePoint;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.Caching;
using System.Web;
using System.Security.Principal;
using System.Diagnostics;
using System.Configuration;

namespace ExpenseManager.SharePointHelpers
{
    static class SharePointAuth
    {
        static string SharePointResourceId = ConfigurationManager.AppSettings["SharePointResourceId"];
        static string SharePointServiceRoot = ConfigurationManager.AppSettings["SharePointServiceRoot"];

        public static async Task<string> GetSiteTitle()
        {
            var authInfo = await GetAuthInfo();
            var token = await authInfo.GetAccessToken();

            WebClient wc = new WebClient();
            wc.Headers.Add("Method", "GET");
            wc.Headers.Add("Accept", "application/json;odata=verbose");
            wc.Headers.Add("Authorization", "Bearer " + token);
            return await wc.DownloadStringTaskAsync(SharePointServiceRoot + "/web/title");
        }

        public static async Task<AuthenticationInfo> GetAuthInfo()
        {
            var authenticator = new Authenticator();
            var authInfo = await authenticator.AuthenticateAsync(SharePointResourceId, ServiceIdentifierKind.Resource);
            return authInfo;
        }

        public static async void Logout(Uri postLogoutRedirect)
        {
            var authInfo = await GetAuthInfo();
            var cache = MemoryCache.Default;
            cache.Remove(authInfo.IdToken.UPN);
            new Authenticator().Logout(postLogoutRedirect);
        }

        public static string GetSessionToken()
        {
            var session = HttpContext.Current.Session;
            if (session != null)
            {
                var startTokenKey = "_O365#AccessToken#";
                var SharePointResourceId = ConfigurationManager.AppSettings["SharePointResourceId"];

                var tokenKey = session.Keys
                                .Cast<string>()
                                .Where(k => k.Contains(startTokenKey))
                                .SingleOrDefault();

                if (tokenKey != null)
                {
                    var tokenObject = session[startTokenKey + SharePointResourceId];
                    //Hack to get value since CacheItem type isn't accessible
                    if (tokenObject != null)
                    {
                        var token = tokenObject.GetType().GetField("Value").GetValue(tokenObject).ToString();
                        return token;
                    }
                }
            }
            return null;
        }
    }
}


