using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AspNetBookshop.Extensions;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AspNetBookshop.Services.IAuthService _userService;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(
        AspNetBookshop.Services.IAuthService userService,
        ApplicationDbContext context,
        IConfiguration configuration)
    {
        _userService = userService;
        _context = context;
        _configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> RegisterUser([FromBody] RegisterUserRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name)
            || string.IsNullOrWhiteSpace(request.Email)
            || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Name, email, and password are required.");
        }
        if (!string.IsNullOrWhiteSpace(request.Role)
            && request.Role != "Admin"
            && request.Role != "User")
        {
            return BadRequest("Role must be Admin or User.");
        }

        var user = UserMappingExtensions.ToEntity(request);

        var response = await _userService.RegisterAsync(user, cancellationToken);

        switch (response.Status)
        {
            case "Error":
                return BadRequest(response.Message);
            case "Conflict":
                return Conflict(response.Message);
        }

        return CreatedAtAction(nameof(RegisterUser), new { id = user.Id }, user);
    }

    [HttpPost("loginUser")]
    public async Task<IActionResult> LoginUser([FromBody] LoginUserRequest request, CancellationToken cancellationToken)
    {
        var response = await _userService.LoginAsync(request, cancellationToken);
        switch (response.Status)
        {
            case "Error":
                return BadRequest(response.Message);
            case "Unauthorized":
                return Unauthorized();
        }
        return Ok(response);
    }

    [HttpPost("logout")]
    public IActionResult LogoutUser()
    {
        // Stateless JWT logout; client should discard the token.
        return Ok(new { status = "Success", message = "Logged out." });
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        if (!TryGetEmailFromToken(Request, _configuration, out var email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(user.ToProfileResponseDto());
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
