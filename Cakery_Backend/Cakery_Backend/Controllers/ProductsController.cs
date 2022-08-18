using Cakery_Backend.Models;
using CakeryDataAccess;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Microsoft.AspNet.Identity;
using System.Web;
using System.IO;
using Cakery_Backend.Services;

namespace Cakery_Backend.Controllers
{
    [Authorize]
    public class ProductsController : ApiController
    {
        private UsersService usersService;

        public ProductsController()
        {
            usersService = new UsersService();
        }

        [HttpGet]
        [ResponseType(typeof(ProductDTO))]
        [Route("api/products")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> GetAllProducts()
        {
            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var products = await db.Products.Select(p => new ProductDTO()
                {
                    ProductID = p.ProductID,
                    Name = p.Name,
                    Description = p.Description,
                    Price = Math.Round(p.Price, 2),
                    Promotion = Math.Round(p.Promotion ?? 0, 2), 
                    ImagePath = p.ImagePath
                }).ToListAsync();

                return Ok(products);
            }
        }

        [HttpGet]
        [ResponseType(typeof(ProductDTO))]
        [Route("api/products/{id}")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> GetProductById(int id)
        {
            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var product = await db.Products.SingleOrDefaultAsync(p => p.ProductID == id);
                if (product == null)
                {
                    return BadRequest($"Product with ID={ id } was not found!");
                }

                ProductDTO productDto = new ProductDTO()
                {
                    ProductID = product.ProductID,
                    Name = product.Name,
                    Description = product.Description,
                    Price = Math.Round(product.Price, 2),
                    Promotion = Math.Round(product.Promotion ?? 0, 2),
                    ImagePath = product.ImagePath
                };

                return Ok(productDto);
            }
        }

        [HttpPost]
        [Route("api/products")]
        public async Task<IHttpActionResult> AddProduct([FromBody]Product product)
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            if (!IsUserAdmin)
            {
                return BadRequest("You are not authorized!");
            }

            if (product == null)
            {
                return BadRequest("Product object is null.");
            }

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest("Invalid Model state.");
                }

                db.Products.Add(product);

                await db.SaveChangesAsync();

                // Returning path that is used to upload image
                return Created("" + product.ProductID, $"products/{ product.ProductID }");
            }
        }

        [Route("api/products/{id}/image")]
        public async Task<IHttpActionResult> UploadImage(int id)
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            if (!IsUserAdmin)
            {
                return BadRequest("You are not authorized!");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Model state is not valid!");
            }

            string imageName = null;
            var httpRequest = HttpContext.Current.Request;
            //Upload Image
            var postedFile = httpRequest.Files["Image"];
            //Create custom filename
            if (postedFile == null)
            {
                return BadRequest("File object is null!");
            }
            imageName = id + "_" + DateTime.Now.ToString("ddMMyyyyHHmmss") + Path.GetExtension(postedFile.FileName);
            var filePath = HttpContext.Current.Server.MapPath("~/Images/" + imageName);
            postedFile.SaveAs(filePath);

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var product = await db.Products.SingleOrDefaultAsync(p => p.ProductID == id);

                if (product == null)
                {
                    return BadRequest($"Product with ID={ id } was not found!");
                }

                product.ImagePath = imageName;
                await db.SaveChangesAsync();
                return Ok($"{ product.ImagePath }");
            }
        }

        [HttpPut]
        [Route("api/products/update/{id}")]
        public async Task<IHttpActionResult> UpdateProduct(int id, [FromBody] Product newProduct)
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            if (!IsUserAdmin)
            {
                return BadRequest("You are not authorized!");
            }

            if (newProduct == null)
            {
                return BadRequest("Product object is null.");
            }

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var product = await db.Products.SingleOrDefaultAsync(p => p.ProductID == id);

                if (product == null)
                {
                    return BadRequest($"Product with ID={ id } was not found!");
                }

                product.Name = newProduct.Name;
                product.Description = newProduct.Description;
                product.Price = newProduct.Price;
                product.Promotion = newProduct.Promotion;

                await db.SaveChangesAsync();
                // Returning path that is used to upload image
                return Ok($"products/{ product.ProductID }");
            }
        }

        [HttpDelete]
        [Route("api/products/{id}")]
        public async Task<IHttpActionResult> DeleteProduct(int id)
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            if (!IsUserAdmin)
            {
                return BadRequest("You are not authorized!");
            }

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                Product product = await db.Products.SingleOrDefaultAsync(p => p.ProductID == id);

                if (product == null)
                {
                    return BadRequest($"Product with ID={ id } was not found!");
                }

                List<OrderItem> orderItems = await db.OrderItems.Where(oi => oi.ProductID == product.ProductID).ToListAsync();

                if (orderItems.Count > 0)
                {
                    return BadRequest($"Cannot delete product { product.Name }. {orderItems.Count} orders with this product exist.");
                }

                db.Products.Remove(product);

                await db.SaveChangesAsync();

                return Ok($"Product { product.Name } is deleted.");
            }
        }

        [HttpPut]
        [Route("api/products/{id}/remove-image")]
        public async Task<IHttpActionResult> DeleteImage(int id)
        {
            string userId = User.Identity.GetUserId();
            bool IsUserAdmin = await UsersService.IsAdmin(userId);

            if (!IsUserAdmin)
            {
                return BadRequest("You are not authorized!");
            }

            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                Product product = await db.Products.SingleOrDefaultAsync(p => p.ProductID == id);

                if (product == null)
                {
                    return BadRequest($"Product with ID={ id } was not found!");
                }

                product.ImagePath = null;

                await db.SaveChangesAsync();

                return Ok($"Image for { product.Name } is removed.");
            }
        }

        // Helper method
        public static async Task<ProductDTO> ProductById(int id)
        {
            using (Cakery_DbContext db = new Cakery_DbContext())
            {
                var product = await db.Products.SingleOrDefaultAsync(p => p.ProductID == id);

                if (product == null)
                {
                    return null;
                }

                ProductDTO productDto = new ProductDTO()
                {
                    ProductID = product.ProductID,
                    Name = product.Name,
                    Description = product.Description,
                    Price = Math.Round(product.Price, 2),
                    Promotion = Math.Round(product.Promotion ?? 0, 2),
                    ImagePath = product.ImagePath
                };

                return productDto;
            }
        }
    }
}
