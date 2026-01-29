
using Microsoft.EntityFrameworkCore;
using AspNetBookshop.Extensions;

namespace Auth.Api.Docker.Endpoints;

public static class AuthEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var UserGroup = app.MapGroup("api/Auth");

        UserGroup.MapPost("", RegisterUser).WithName(nameof(RegisterUser));

        UserGroup.MapPost("/loginUser", LoginUser).WithName(nameof(LoginUser));

        UserGroup.MapGet("/profile", GetProfile).WithName(nameof(GetProfile));

        UserGroup.MapPost("/logout", LogoutUser).WithName(nameof(LogoutUser));
    }

    public static async Task<IResult> RegisterUser(
             RegisterUserRequest request,
             AspNetBookshop.Services.IAuthService UserService,
             CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name)
            || string.IsNullOrWhiteSpace(request.Email)
            || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest("Name, email, and password are required.");
        }
        if (!string.IsNullOrWhiteSpace(request.Role)
            && request.Role != "Admin"
            && request.Role != "User")
        {
            return Results.BadRequest("Role must be Admin or User.");
        }

        var user = AspNetBookshop.Extensions.UserMappingExtensions.ToEntity(request);        

        var response = await UserService.RegisterAsync(user, cancellationToken);

        switch (response.Status)
        {
            case "Error":
                return Results.BadRequest(response.Message);
            case "Conflict":
                return Results.Conflict(response.Message);
        }

        return Results.CreatedAtRoute(
            nameof(RegisterUser),
            new { id = user.Id },
            user);
    }

    public static async Task<IResult> LoginUser(
             LoginUserRequest request,
             AspNetBookshop.Services.IAuthService UserService,
             CancellationToken cancellationToken)
    {
        var response = await UserService.LoginAsync(request, cancellationToken);
        switch (response.Status)
        {
            case "Error":
                return Results.BadRequest(response.Message);
            case "Unauthorized":
                return Results.Unauthorized();
        }
        return Results.Ok(response);
    }

    public static IResult LogoutUser()
    {
        // Stateless JWT logout; client should discard the token.
        return Results.Ok(new { status = "Success", message = "Logged out." });
    }

    public static async Task<IResult> GetProfile(
             HttpRequest httpRequest,
             ApplicationDbContext context,
             IConfiguration configuration,
             CancellationToken cancellationToken)
    {
        if (!TryGetEmailFromToken(httpRequest, configuration, out var email))
        {
            return Results.Unauthorized();
        }

        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(user.ToProfileResponseDto());
    }

    private static bool TryGetEmailFromToken(
        HttpRequest httpRequest,
        IConfiguration configuration,
        out string email)
    {
        email = string.Empty;
        var authHeader = httpRequest.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return false;
        }

        var token = authHeader["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        var secret = configuration["JWT:Secret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            return false;
        }

        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var key = System.Text.Encoding.UTF8.GetBytes(secret);
        try
        {
            var principal = tokenHandler.ValidateToken(
                token,
                new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1)
                },
                out _);

            var claim = principal.FindFirst(System.Security.Claims.ClaimTypes.Email);
            if (claim is null || string.IsNullOrWhiteSpace(claim.Value))
            {
                return false;
            }

            email = claim.Value;
            return true;
        }
        catch
        {
            return false;
        }
    }
}
