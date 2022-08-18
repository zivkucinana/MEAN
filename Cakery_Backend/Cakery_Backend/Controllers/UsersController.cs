using Cakery_Backend.Models;
using Cakery_Backend.Services;
using CakeryDataAccess;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;

namespace Cakery_Backend.Controllers
{
    [Authorize]
    public class UsersController : ApiController
    {
        private UsersService service;
        public UsersController()
        {
            service = new UsersService();
        }

        // Getting information about current user that is logged in.
        [HttpGet]
        [ResponseType(typeof(UserDTO))]
        [Route("api/users/current")]
        public async Task<IHttpActionResult> GetCurrentUser()
        {
            string userId = User.Identity.GetUserId();

            UserDTO user = await service.GetUserById(userId);

            return Ok(user);
        }

    }
}
