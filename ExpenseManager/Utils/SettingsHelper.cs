using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace ExpenseManager.Utils
{
    internal class SettingsHelper
    {
        static string _AzureADUri = "https://login.windows.net";
        static string _GraphResourceId = "https://graph.windows.net";
        static string _O365DiscoveryServiceEndpoint = "https://api.office.com/discovery/v1.0/me/";
        static string _O365DiscoveryResourceId = "https://api.office.com/discovery/";
        static string _ClaimsObjectIdentifier = "http://schemas.microsoft.com/identity/claims/objectidentifier";
        static string _ContactsCapability = "Contacts";

        public static string Tenant
        {
            get { return ConfigurationManager.AppSettings["ida:Tenant"]; }
        }

        public static string TenantId
        {
            get { return ConfigurationManager.AppSettings["ida:TenantID"]; }
        }

        public static string ClientId
        {
            get { return ConfigurationManager.AppSettings["ida:ClientID"]; }
        }

        public static string ClientSecret
        {
            get { return ConfigurationManager.AppSettings["ida:Password"]; }
        }

        public static string O365DiscoveryResourceId
        {
            get { return _O365DiscoveryResourceId; }
        }

        public static string O365DiscoveryServiceEndpoint
        {
            get { return _O365DiscoveryServiceEndpoint; }
        }

        public static string GraphResourceId
        {
            get { return _GraphResourceId; }
        }

        public static string AzureADAuthority
        {
            get { return string.Format(_AzureADUri + "/{0}/", TenantId); }
        }

        public static string ClaimsObjectIdentifier
        {
            get { return _ClaimsObjectIdentifier; }
        }

        public static string ContactsCapability
        {
            get { return _ContactsCapability; }
        }

        public static string SharePointDomainUri
        {
            get { return String.Format(ConfigurationManager.AppSettings["SharePointDomainUri"], Tenant); }
        }

        public static string SharePointApiServiceUri
        {
            get { return String.Format(ConfigurationManager.AppSettings["SharePointApiServiceUri"], Tenant); }
        }
    }
}