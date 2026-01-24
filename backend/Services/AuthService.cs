
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Books.Api.Docker.Dtos;
using Microsoft.EntityFrameworkCore;
using Books.Api.Docker.Entities;

namespace Books.Api.Docker.Services;

public sealed class AuthService(ApplicationDbContext context, IConfiguration configuration) : IAuthService
{
    public async Task<Response> RegisterAsync(User user, CancellationToken cancellationToken)
    {
        try
        {
            var userExists = await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Email == user.Email, cancellationToken);

            if (userExists == null)
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                context.Users.Add(user);
                await context.SaveChangesAsync(cancellationToken);

                return new Response { Status = ResponseStatus.Success, Message = "User created successfully!" };
            }
            else
            {
                return new Response { Status = ResponseStatus.Warning, Message = "User already exist!" };
            }
        }
        catch (Exception)
        {
            return new Response { Status = ResponseStatus.Error, Message = "User creation failed! Please check user details and try again." };
        }
    }

    public async Task<Response> LoginAsync(LoginUserRequest request, CancellationToken cancellationToken)
    {        
        try
        {
            var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (dbUser == null)
            {
                return  new Response { Status = ResponseStatus.Error, Message = "User not found!" };
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, dbUser.Password))
            {
                return new Response { Status = ResponseStatus.Error, Message = "Wrong password!" };
            }

            if (string.IsNullOrWhiteSpace(configuration["JWT:Secret"]))
            {
                return new Response { Status = ResponseStatus.Error, Message = "JWT secret is not configured." };
            }

            var token = GenerateToken(dbUser);

            var authResponse = new UserAuthResponse(
                token,
                dbUser.Id,
                dbUser.Name,
                dbUser.Email,
                dbUser.Initials ?? string.Empty
            );

            return new Response { Status = ResponseStatus.Success, Message = "Login successful!", Data = authResponse };

        }
        catch (Exception)
        {
            return new Response { Status = ResponseStatus.Error, Message = "Login failed! Please check user details and try again." };
        }       
    }

    private string GenerateToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var secret = configuration["JWT:Secret"] ?? string.Empty;
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("JWT secret is not configured.");
        }

        var tokenKey = Encoding.UTF8.GetBytes(secret);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, "Admin"),
                    new Claim(ClaimTypes.Role, "Customer")
                }),
            Expires = DateTime.UtcNow.AddDays(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

}
