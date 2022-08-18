using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Cakery_Backend.Startup))]

namespace Cakery_Backend
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);

            ConfigureAuth(app);
        }
    }
}
