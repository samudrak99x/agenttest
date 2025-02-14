using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace OptimizedApp
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
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                LoggingService.LogError("Invalid username or password");
                return null;
            }

            var user = await _context.Users.AsNoTracking()
                               .SingleOrDefaultAsync(u => u.Username == username.Trim());

            if (user == null)
            {
                LoggingService.LogError("User not found");
                return null;
            }

            if (!VerifyPassword(user.PasswordHash, password))
            {
                LoggingService.LogError("Invalid Password");
                return null;
            }

            return user;
        }

        private bool VerifyPassword(string hashedPassword, string inputPassword)
        {
            return hashedPassword == inputPassword; // Replace this with a proper hashing function
        }
    }

    public static class LoggingService
    {
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
                LoggingService.LogInfo("User authenticated successfully.");
            }
            else
            {
                LoggingService.LogError("Authentication failed.");
            }
        }
    }
}