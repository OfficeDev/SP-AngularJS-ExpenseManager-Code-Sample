using ExpenseManager.SharePointHelpers;
using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
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
                Debug.WriteLine("Error in WebProxy ProcessRequest: " + exp.Message);
            }
        }

        private HttpWebRequest CreateRequest(HttpContext context, string token)
        {
            var url = context.Server.UrlDecode(context.Request["url"]);
            var contextInfoRequest = context.Request.Headers["ContextInfoRequest"];
            var requestDigest = context.Request.Headers["X-RequestDigest"];
            var ifMatch = context.Request.Headers["If-Match"];
            var restMethod = context.Request.HttpMethod.ToUpper();
            var accept = context.Request.Headers["Accept"];
            var xHttpMethod = context.Request.Headers["X-HTTP-Method"];
            var contentTypeVerbs = new string[] { "PUT", "POST", "MERGE" };

            Debug.WriteLine(url);

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Accept = "application/json;odata=verbose";
            request.ContentType = "application/json;odata=verbose";
            request.Method = restMethod;
            request.Headers.Add("Authorization", "Bearer " + token);

            if (contextInfoRequest == "true") request.ContentLength = 0;
            if (requestDigest != null) request.Headers.Add("X-RequestDigest", requestDigest);
            if (ifMatch != null) request.Headers.Add("If-Match", ifMatch);
            if (xHttpMethod != null) request.Headers.Add("X-HTTP-Method", xHttpMethod);

            if (Array.IndexOf(contentTypeVerbs, restMethod) >= 0)
            {
                var bodyStream = context.Request.GetBufferedInputStream();
                var dataStream = request.GetRequestStream();
                bodyStream.CopyTo(dataStream);
            }

            return request;
        }

        private void CreateResponse(HttpContext context, HttpWebRequest request)
        {
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            using (var stream = response.GetResponseStream())
            {
                var ms = new MemoryStream();
                stream.CopyTo(ms);
                ms.Seek(0, SeekOrigin.Begin);
                if (ms.Length > 0)
                {
                    context.Response.ContentType = "application/json";
                    ms.CopyTo(context.Response.OutputStream);
                    context.Response.Flush();
                }
            }
        }

        public bool IsReusable
        {
            get { return false; }
        }
    }
}
