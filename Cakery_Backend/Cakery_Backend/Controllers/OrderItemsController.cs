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
    public class OrderItemsController : ApiController
    {
        private UsersService usersService;

        public OrderItemsController()
        {
            usersService = new UsersService();
        }

        [HttpGet]
        [Route("api/orders/items/{id}")]
        [ResponseType(typeof(OrderItemDTO))]
        public async Task<IHttpActionResult> GetItemsForOrder(int id)
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            string orderUser = await OrdersController.OrderUser(id);

            if (String.IsNullOrEmpty(orderUser))
            {
                return BadRequest("User and/or order were not found!");
            }

            // If it is not user that has sent the order
            // AND IS NOT AN ADMIN
            // RETURN BAD REQUEST
            if (!userId.Equals(orderUser) && !IsUserAdmin)
            {
                return BadRequest("You are not authorized!");
            }

            var items = await OrderItems(id);
            return Ok(items);
        }

        [HttpPost]
        [Route("api/orders/items/{id}")]
        public async Task<IHttpActionResult> AddItem(int id, [FromBody] OrderItem item)
        {
            string userId = User.Identity.GetUserId();

            string orderUser = await OrdersController.OrderUser(id);

            // If it is not user that has sent the order
            // AND IS NOT AN ADMIN
            // RETURN BAD REQUEST
            if (!userId.Equals(orderUser))
            {
                return BadRequest("You are not authorized!");
            }

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest("Invalid Model state.");
                }

                item.OrderID = id;

                db.OrderItems.Add(item);
                await db.SaveChangesAsync();

                return Created("", $"Order item with ID={ id } is added.");
            }

        }

        // Helper method
        public static async Task<decimal> OrderSum(int id)
        {
            decimal sum = 0;
            List<OrderItemDTO> items = await OrderItems(id);

            foreach (OrderItemDTO item in items)
            {
                sum += item.Sum;
            }

            return sum;
        }

        // Helper method
        public static async Task<List<OrderItemDTO>> OrderItems(int id)
        {
            List<OrderItemDTO> orderItemsDto = new List<OrderItemDTO>();
            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var items = await db.OrderItems.Where(oi => oi.OrderID == id).ToListAsync();

                foreach (OrderItem item in items)
                {
                    ProductDTO product = await ProductsController.ProductById(item.ProductID);

                    orderItemsDto.Add(new OrderItemDTO()
                    {
                        OrderID = item.OrderID,
                        ProductID = item.ProductID,
                        Name = product.Name,
                        Description = product.Description,
                        Price = Math.Round(product.Price, 2),
                        Promotion = Math.Round(product.Promotion, 2),
                        Quantity = Math.Round(item.Quantity, 2),
                        Sum = Math.Round((item.Quantity * (product.Price - (product.Price * (product.Promotion / 100)))), 2)
                    });
                }

                return orderItemsDto;
            }
        }
    }
}
