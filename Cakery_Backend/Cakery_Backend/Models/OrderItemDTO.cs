using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cakery_Backend.Models
{
    public class OrderItemDTO
    {
        public int OrderID { get; set; }
        public int ProductID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public decimal Promotion { get; set; }
        public decimal Quantity { get; set; }
        public decimal Sum { get; set; }
    }
}
