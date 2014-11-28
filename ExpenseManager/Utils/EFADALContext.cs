using ExpenseManager.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Web;

namespace ExpenseManager.Utils
{
    public class EFADALContext : DbContext
    {
        public EFADALContext() : base("EFADALContext")
        {
        }

        public DbSet<PerWebUserCache> PerUserCacheList { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}