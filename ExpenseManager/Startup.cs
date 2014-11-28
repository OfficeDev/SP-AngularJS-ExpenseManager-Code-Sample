using Microsoft.Owin; 
using Owin;

[assembly: OwinStartup(typeof(ExpenseManager.Startup))]   
namespace ExpenseManager 
{     
    public partial class Startup     
    {         
        public void Configuration(IAppBuilder app)         
        {             
            ConfigureAuth(app);         
        }    
    } 
}