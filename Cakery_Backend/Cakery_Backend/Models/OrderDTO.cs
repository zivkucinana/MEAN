using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cakery_Backend.Models
{
    public class OrderDTO
    {
        public int OrderID { get; set; }
        public string UserID { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Address { get; set; }
        public DateTime Time { get; set; }
        public string Delivery { get; set; }
        public string PaymentMethod { get; set; }
        public decimal Sum { get; set; }
    }
}
