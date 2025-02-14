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
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<User> AuthenticateUserAsync(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                LogError("Invalid username");
                return null;
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                LogError("Invalid password");
                return null;
            }

            var user = await _context.Users.AsNoTracking()
                              .SingleOrDefaultAsync(u => u.Username.Equals(username.Trim(), StringComparison.OrdinalIgnoreCase));

            if (user == null)
            {
                LogError("User not found");
                return null;
            }

            if (!VerifyPassword(user.PasswordHash, password))
            {
                LogError("Invalid Password");
                return null;
            }

            LogInfo("User authenticated successfully.");
            return user;
        }

        private bool VerifyPassword(string hashedPassword, string inputPassword)
        {
            // Implement a secure way to compare hashed passwords
            return hashedPassword == inputPassword;
        }

        private void LogInfo(string message) => Console.WriteLine($"[INFO] {message}");

        private void LogError(string message) => Console.WriteLine($"[ERROR] {message}");
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            using var context = new AppDbContext(options);
            var authService = new AuthenticationService(context);

            Console.WriteLine("Enter Username:");
            string username = Console.ReadLine();

            Console.WriteLine("Enter Password:");
            string password = Console.ReadLine();

            await authService.AuthenticateUserAsync(username, password);
        }
    }
}