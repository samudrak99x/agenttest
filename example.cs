using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NonOptimizedApp
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
    }

    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseSqlServer("your_connection_string_here");
        }
    }

    public class AuthenticationService
    {
        private readonly AppDbContext _context;

        public AuthenticationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> AuthenticateUserAsync(string username, string password)
        {
            // ❌ Unoptimized Query - No `AsNoTracking()` (Wastes resources)
            var users = await _context.Users.ToListAsync();
            var user = users.FirstOrDefault(u => u.Username == username);

            if (user == null)
            {
                Console.WriteLine("User not found");
                return null;
            }

            // ❌ Insecure Password Checking (Direct Comparison)
            if (user.PasswordHash != password)
            {
                Console.WriteLine("Invalid Password");
                return null;
            }

            return user;
        }
    }

    public class Utility
    {
        // ❌ Duplicate Utility Methods (Redundant Code)
        public static string TrimInput(string input)
        {
            return input.Trim();
        }

        public static string Sanitize(string input)
        {
            return input.Trim().Replace("'", "''"); // SQL injection risk
        }
    }

    public class LoggingService
    {
        // ❌ No centralized logging structure (Inefficient)
        public static void LogInfo(string message)
        {
            Console.WriteLine("[INFO] " + message);
        }

        public static void LogError(string message)
        {
            Console.WriteLine("[ERROR] " + message);
        }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            using var context = new AppDbContext();
            var authService = new AuthenticationService(context);

            Console.WriteLine("Enter Username:");
            string username = Console.ReadLine();

            Console.WriteLine("Enter Password:");
            string password = Console.ReadLine();

            var user = await authService.AuthenticateUserAsync(username, password);

            if (user != null)
            {
                Console.WriteLine("✅ User authenticated successfully.");
            }
            else
            {
                Console.WriteLine("❌ Authentication failed.");
            }
        }
    }
}
