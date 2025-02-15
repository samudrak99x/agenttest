using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace OptimizedApp
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }

    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    }

    public class AuthenticationService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthenticationService> _logger;

        public AuthenticationService(AppDbContext context, ILogger<AuthenticationService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<User?> AuthenticateUserAsync(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                _logger.LogError("Invalid username or password.");
                return null;
            }

            username = username.Trim();
            var user = await _context.Users.AsNoTracking()
                              .SingleOrDefaultAsync(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

            if (user == null)
            {
                _logger.LogError("User not found.");
                return null;
            }

            if (!VerifyPassword(user.PasswordHash, password))
            {
                _logger.LogError("Invalid password.");
                return null;
            }

            _logger.LogInformation("User authenticated successfully.");
            return user;
        }

        private bool VerifyPassword(string hashedPassword, string inputPassword)
        {
            // Implement secure password hash comparison here
            return hashedPassword == inputPassword;
        }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase("TestDb")
                .Options;

            var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            var logger = loggerFactory.CreateLogger<AuthenticationService>();

            await using (var context = new AppDbContext(options))
            {
                await InitializeUsersAsync(context);
            }

            await using (var context = new AppDbContext(options))
            {
                var authService = new AuthenticationService(context, logger);

                Console.WriteLine("Enter Username:");
                string username = Console.ReadLine()?.Trim() ?? string.Empty;

                Console.WriteLine("Enter Password:");
                string password = Console.ReadLine()?.Trim() ?? string.Empty;

                if (await authService.AuthenticateUserAsync(username, password) is { } user)
                {
                    Console.WriteLine($"Welcome, {user.Username}!");
                }
            }
        }

        private static async Task InitializeUsersAsync(AppDbContext context)
        {
            if (!await context.Users.AnyAsync())
            {
                context.Users.Add(new User { Username = "testuser", PasswordHash = "testpassword" });
                await context.SaveChangesAsync();
            }
        }
    }
}