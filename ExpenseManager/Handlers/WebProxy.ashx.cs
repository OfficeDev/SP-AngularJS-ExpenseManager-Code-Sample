using ExpenseManager.SharePointHelpers;
using System;
using System.Configuration;
using System.Diagnostics;
using System.Net;
using System.Web;
using System.Web.SessionState;

namespace ExpenseManager.Handlers
{
    public class WebProxy : IHttpHandler, IRequiresSessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            try
            {
                //Get SharePoint Access Token
                string token = SharePointAuth.GetSessionToken();

                if (!String.IsNullOrEmpty(token))
                {
                    Debug.WriteLine("Bearer token found: " + token);
                    HttpWebRequest request = CreateRequest(context, token);
                    CreateResponse(context, request);
                }
                else
                {
                    Debug.WriteLine("No bearer token found in WebProxy.ashx.cs");
                    context.Response.StatusCode = (int)HttpStatusCode.Redirect;
                    context.Response.End();
                }
            }
            catch (Exception exp)
            {
                Debug.WriteLine(exp.Message);
            }
        }

        private HttpWebRequest CreateRequest(HttpContext context, string token)
        {
            var url = context.Server.UrlDecode(context.Request["url"]);
            var restMethod = context.Request.HttpMethod.ToUpper();
            var restTypes = new string[] { "PUT", "POST", "DELETE", "MERGE" };

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Accept = "application/json;odata=verbose";
            request.Headers.Add("Authorization", "Bearer " + token);
            request.ContentType = "application/json;odata=verbose";
            if (Array.IndexOf(restTypes, restMethod) >= 0) //See if it's a PUT/POST/DELETE/MERGE
            {
                CreatePost(context, restMethod, request);
            }
            else
            {
                request.Method = restMethod;
            }
            return request;
        }

        private void CreateResponse(HttpContext context, HttpWebRequest request)
        {
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            using (var stream = response.GetResponseStream())
            {
                context.Response.ContentType = "application/json";
                stream.CopyTo(context.Response.OutputStream);
                context.Response.Flush();
            }
        }

        private void CreatePost(HttpContext context, string restMethod, HttpWebRequest request)
        {
            request.Method = "POST";

            if (!String.IsNullOrEmpty(context.Request.Headers["X-HTTP-Method"]))
            {
                request.Headers.Add("X-HTTP-Method", context.Request.Headers["X-HTTP-Method"]);
            }
            else
            {
                request.Headers.Add("X-HTTP-Method", restMethod); //Method RESTful service expects
            }

            //Handle eTag header if it's available
            var eTag = (!String.IsNullOrEmpty(context.Request.Headers["If-Match"]))
                        ? context.Request.Headers["If-Match"] : "*";
            request.Headers.Add("If-Match", eTag);

            if (!String.IsNullOrEmpty(context.Request.Headers["X-RequestDigest"]))
            {
                request.Headers.Add("X-RequestDigest", context.Request.Headers["X-RequestDigest"]);
            }

            //Get Body data sent to HTTP Handler and forward to target RESTful service
            var bodyStream = context.Request.GetBufferedInputStream();
            var dataStream = request.GetRequestStream();
            bodyStream.CopyTo(dataStream);
        }

        public bool IsReusable
        {
            get { return false; }
        }
    }
}