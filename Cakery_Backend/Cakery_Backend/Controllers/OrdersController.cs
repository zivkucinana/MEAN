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
    public class OrdersController : ApiController
    {
        private UsersService usersService;

        public OrdersController()
        {
            this.usersService = new UsersService();
        }

        [HttpDelete]
        [Route("api/orders/{id}")]
        public async Task<IHttpActionResult> DeleteOrder(int id)
        {
            string userId = User.Identity.GetUserId();

            string orderUser = await OrderUser(id);
            // If it is not user that has sent the order
            // RETURN BAD REQUEST
            // EVEN ADMIN has no rights to delete an order
            if (!userId.Equals(orderUser))
            {
                return BadRequest("You are not authorized!");
            }

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                Order order = await db.Orders.SingleOrDefaultAsync(p => p.OrderID == id);

                if (order == null)
                {
                    return BadRequest($"Order with ID={ id } was not found!");
                }

                order.OrderItems = await db.OrderItems.Where(oi => oi.OrderID == id).ToListAsync();

                db.Orders.Remove(order);

                await db.SaveChangesAsync();

                return Ok($"Order { order.OrderID } has been deleted.");
            }
        }

        // Get all orders
        // If user is not admin, only orders that he had been made will be displayed
        // If user is admin, all orders will be displayed
        [HttpGet]
        [ResponseType(typeof(OrderDTO))]
        [Route("api/orders")]
        public async Task<IHttpActionResult> GetAllOrders()
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            using (Cakery_DbContext db = new Cakery_DbContext())
            {

                var orders = (List<Order>)null;

                if (IsUserAdmin)
                {
                    orders = await db.Orders.OrderByDescending(o => o.OrderID).ToListAsync();
                }
                else
                {
                    orders = await db.Orders.Where(o => o.UserID.Equals(userId)).OrderByDescending(o => o.OrderID).ToListAsync();
                }

                if (orders == null)
                {
                    return BadRequest("No orders found!");
                }

                List<OrderDTO> ordersDto = new List<OrderDTO>();

                foreach (Order order in orders)
                {
                    UserDTO user = await usersService.GetUserById(order.UserID);

                    ordersDto.Add(new OrderDTO()
                    {
                        OrderID = order.OrderID,
                        UserID = order.UserID,
                        Username = user.Username,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Address = user.Address,
                        Time = order.Time,
                        Delivery = order.Delivery,
                        PaymentMethod = order.PaymentMethod,
                        Sum = await OrderItemsController.OrderSum(order.OrderID)
                    });
                }

                if (ordersDto == null)
                {
                    return BadRequest("No orders found!");
                }

                return Ok(ordersDto);

            }
        }

        [HttpGet]
        [ResponseType(typeof(OrderDTO))]
        [Route("api/orders/{id}")]
        public async Task<IHttpActionResult> GetOrderById(int id)
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            using (Cakery_DbContext db = new Cakery_DbContext())
            {

                string orderUser = await OrderUser(id);

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

                var order = await db.Orders.SingleOrDefaultAsync(o => o.OrderID == id);

                if (order == null)
                {
                    return BadRequest("Order was not found!");
                }

                UserDTO user = await usersService.GetUserById(order.UserID);

                if (user == null)
                {
                    return BadRequest("User in the order was not found!");
                }

                OrderDTO orderDto = new OrderDTO()
                {
                    OrderID = order.OrderID,
                    UserID = order.UserID,
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Address = user.Address,
                    Time = order.Time,
                    Delivery = order.Delivery,
                    PaymentMethod = order.PaymentMethod,
                    Sum = await OrderItemsController.OrderSum(order.OrderID)
                };

                return Ok(orderDto);
            }
        }

        [HttpPost]
        [Route("api/orders")]
        public async Task<IHttpActionResult> AddOrder([FromBody] Order order)
        {
            string userId = User.Identity.GetUserId();

            if (order == null)
            {
                return BadRequest("Order object is null.");
            }

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest("Invalid Model state.");
                }

                order.Time = DateTime.Now;

                db.Orders.Add(order);
                await db.SaveChangesAsync();
                
                return Created("", $"Order { order.OrderID } has been created successfully.");
            }
        }

        // Helper method to determine who has sent the order.
        public static async Task<string> OrderUser(int orderId)
        {
            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var order = await db.Orders.SingleOrDefaultAsync(o => o.OrderID == orderId);

                if (order == null)
                {
                    return null;
                }

                return order.UserID;
            }
        }
    }
}
