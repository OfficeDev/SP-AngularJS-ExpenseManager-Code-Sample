using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Owin;
using ExpenseManager.Utils;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;

namespace ExpenseManager
{
    public partial class Startup
    {
        public void ConfigureAuth(IAppBuilder app)
        {
            app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType); 
            app.UseCookieAuthentication(new CookieAuthenticationOptions()); 
            app.UseOpenIdConnectAuthentication(new OpenIdConnectAuthenticationOptions
            {
                ClientId = SettingsHelper.ClientId,
                Authority = SettingsHelper.AzureADAuthority,
                Notifications = new OpenIdConnectAuthenticationNotifications()
                {
                    AuthorizationCodeReceived = (context) =>
                    {
                        var code = context.Code;
                        var creds = new ClientCredential(SettingsHelper.ClientId, SettingsHelper.ClientSecret); 
                        var userObjectId = context.AuthenticationTicket.Identity.FindFirst(ClaimTypes.NameIdentifier).Value;
                        //var tokenCache = new NaiveSessionCache(userObjectId);
                        var tokenCache = new EFADALTokenCache(userObjectId);

                        var authContext = new AuthenticationContext(SettingsHelper.AzureADAuthority, tokenCache);
                        var redirectUri = new Uri(HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Path));
                        var authResult = authContext.AcquireTokenByAuthorizationCode(
                            code, redirectUri, creds, SettingsHelper.GraphResourceId); 
                        return Task.FromResult(0);
                    },
                    AuthenticationFailed = (context) =>
                    {
                        context.HandleResponse();
                        return Task.FromResult(0);
                    },
                    RedirectToIdentityProvider = (context) =>
                    {
                        // This ensures that the address used for sign in and sign out is picked up dynamically from the request
                        // this allows you to deploy your app (to Azure Web Sites, for example) without having to change settings
                        // Remember that the base URL of the address used here must be provisioned in Azure AD beforehand.
                        string appBaseUrl = context.Request.Scheme + "://" + context.Request.Host + context.Request.PathBase;
                        context.ProtocolMessage.RedirectUri = appBaseUrl + "/";
                        context.ProtocolMessage.PostLogoutRedirectUri = appBaseUrl;

                        return Task.FromResult(0);
                    }
                },
                TokenValidationParameters = new System.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = false
                }
            });
        }
    }
}