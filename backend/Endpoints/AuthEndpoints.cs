
namespace Auth.Api.Docker.Endpoints;

public static class AuthEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var UserGroup = app.MapGroup("api/Auth");

        UserGroup.MapPost("", RegisterUser).WithName(nameof(RegisterUser));

        UserGroup.MapPost("/loginUser", LoginUser).WithName(nameof(LoginUser));
    }

    public static async Task<IResult> RegisterUser(
             RegisterUserRequest request,
             AspNetBookshop.Services.IAuthService UserService,
             CancellationToken cancellationToken)
    {
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
}
