using Cakery_Backend.Models;
using CakeryDataAccess;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cakery_Backend.Services
{
    class UsersService
    {
        // GET User by ID
        public async Task<UserDTO> GetUserById(string userId)
        {
            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var user = await db.Users.SingleOrDefaultAsync(u => u.Id.Equals(userId));
                bool isAdmin = await IsAdmin(user.Id);

                // This should never happen.
                if (user == null)
                {
                    return null;
                }

                UserDTO userDto = new UserDTO()
                {
                    UserID = user.Id,
                    Username = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Address = user.Address,
                    IsAdmin = isAdmin
                };

                return userDto;
            }
        }

        // Helper method do determine is the current user actually an admin.
        // This method is used through all controllers.
        public static async Task<bool> IsAdmin(string userId)
        {
            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                Role role = await db.Roles.SingleOrDefaultAsync(r => r.Id.Equals(userId));

                if (role == null)
                {
                    return false;
                }

                if (role.Name.Equals("admin"))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
    }
}
