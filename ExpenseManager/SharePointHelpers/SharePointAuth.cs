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
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace ExpenseManager.SharePointHelpers
{
    static class SharePointAuth
    {
        static string ServiceResourceId = ConfigurationManager.AppSettings["SharePointResourceId"];
        static readonly Uri ServiceEndpointUri = new Uri(ConfigurationManager.AppSettings["SharePointServiceRoot"]);

        // Do not make static in Web apps; store it in session or in a cookie instead
        public static string _lastLoggedInUser;
        static DiscoveryContext _discoveryContext;

        public static async Task<string> GetSiteTitle()
        {
            var client = await EnsureClientCreated();


            WebClient wc = new WebClient();
            wc.Headers.Add("Method", "GET");
            wc.Headers.Add("Accept", "application/json;odata=verbose");
            wc.Headers.Add("Authorization", "Bearer " + GetAccessToken);
            return await wc.DownloadStringTaskAsync(ServiceEndpointUri + "/web/title");
        }

        public static Func<Task<String>> GetAccessToken = async () =>
        {
            CapabilityDiscoveryResult dcr = await _discoveryContext.DiscoverCapabilityAsync("Contacts");
 
            UserIdentifier userId = new UserIdentifier(dcr.UserId, UserIdentifierType.UniqueId);

            string clientId = _discoveryContext.AppIdentity.ClientId;

            AuthenticationResult authResult = await _discoveryContext
                      .AuthenticationContext
                      .AcquireTokenSilentAsync(ServiceResourceId, clientId, userId);

            return authResult.AccessToken;
        };

        public static async Task<SharePointClient> EnsureClientCreated()
        {
            if (_discoveryContext == null)
            {
                _discoveryContext = await DiscoveryContext.CreateAsync();
            }

            var dcr = await _discoveryContext.DiscoverResourceAsync(ServiceResourceId);

            _lastLoggedInUser = dcr.UserId;

            return new SharePointClient(ServiceEndpointUri, async () =>
            {
                return (await _discoveryContext.AuthenticationContext.AcquireTokenByRefreshTokenAsync(new SessionCache().Read("RefreshToken"), new Microsoft.IdentityModel.Clients.ActiveDirectory.ClientCredential(_discoveryContext.AppIdentity.ClientId, _discoveryContext.AppIdentity.ClientSecret), ServiceResourceId)).AccessToken;
            });
        }

        public static Uri SignOut(string postLogoutRedirect)
        {
            if (_discoveryContext == null)
            {
                _discoveryContext = new DiscoveryContext();
            }

            _discoveryContext.ClearCache();

            return _discoveryContext.GetLogoutUri<SessionCache>(postLogoutRedirect);
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