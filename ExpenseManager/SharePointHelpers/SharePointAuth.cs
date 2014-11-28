using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.Office365.Discovery;
using Microsoft.Office365.SharePoint.CoreServices;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using ExpenseManager.Utils;
using System;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace ExpenseManager.SharePointHelpers
{
    public static class SharePointAuth
    {
        private static DiscoveryClient _DiscoveryClient;

        public static AuthenticationContext GetAuthContext()
        {
            var signInUserId = ClaimsPrincipal.Current.FindFirst(ClaimTypes.NameIdentifier).Value; 
            //var tokenCache = new NaiveSessionCache(signInUserId);
            var tokenCache = new EFADALTokenCache(signInUserId);
            var authContext = new AuthenticationContext(SettingsHelper.AzureADAuthority, tokenCache);
            return authContext;
        }

        public static async Task<string> GetAccessToken(string resource)
        {
            var userObjectId = ClaimsPrincipal.Current.FindFirst(SettingsHelper.ClaimsObjectIdentifier).Value;
            var clientCredential = new ClientCredential(SettingsHelper.ClientId, SettingsHelper.ClientSecret);
            var userIdentifier = new UserIdentifier(userObjectId, UserIdentifierType.UniqueId);
            var authContext = GetAuthContext();

            var authResult = await authContext.AcquireTokenSilentAsync(resource, clientCredential, userIdentifier);
            return authResult.AccessToken;
        }

        public static async Task<DiscoveryClient> GetDiscoveryClient(string capability)
        {
            var userObjectId = ClaimsPrincipal.Current.FindFirst(SettingsHelper.ClaimsObjectIdentifier).Value;
            var clientCredential = new ClientCredential(SettingsHelper.ClientId, SettingsHelper.ClientSecret);
            var userIdentifier = new UserIdentifier(userObjectId, UserIdentifierType.UniqueId);
            var authContext = GetAuthContext();

            _DiscoveryClient = new DiscoveryClient(new Uri(SettingsHelper.O365DiscoveryServiceEndpoint),
                async () =>
                {
                    return await GetAccessToken(SettingsHelper.O365DiscoveryResourceId);
                });

            var dcr = await _DiscoveryClient.DiscoverCapabilityAsync(capability);

            return _DiscoveryClient;
        }

        //public static async Task<SharePointClient> GetSharePointClient()
        //{
        //    if (_DiscoveryClient == null)
        //    {
        //        _DiscoveryClient = await GetDiscoveryClient();
        //    }

        //    return new SharePointClient(new Uri(SettingsHelper.SharePointApiServiceUri), async () =>
        //    {
        //        return await GetAccessToken(SettingsHelper.SharePointDomainUri);
        //    });
        //}

        public static void SignIn()
        {
            if (!HttpContext.Current.Request.IsAuthenticated)
            {
                HttpContext.Current.GetOwinContext().Authentication.Challenge(
                    new AuthenticationProperties { RedirectUri = "/" },
                    OpenIdConnectAuthenticationDefaults.AuthenticationType);
            }
        }

        public static void Signout()
        {
            string usrObjectId = ClaimsPrincipal.Current.FindFirst(SettingsHelper.ClaimsObjectIdentifier).Value;
            AuthenticationContext authContext = new AuthenticationContext(SettingsHelper.AzureADAuthority, new NaiveSessionCache(usrObjectId));
            authContext.TokenCache.Clear();

            HttpContext.Current.GetOwinContext().Authentication.SignOut(
                OpenIdConnectAuthenticationDefaults.AuthenticationType, CookieAuthenticationDefaults.AuthenticationType);
        }

        public static void RefreshSession()
        {
            string strRedirectController = HttpContext.Current.Request.QueryString["redirect"];

            HttpContext.Current.GetOwinContext().Authentication.Challenge(
                new AuthenticationProperties { RedirectUri = String.Format("/{0}", strRedirectController) },
                OpenIdConnectAuthenticationDefaults.AuthenticationType);
        }
    }
}