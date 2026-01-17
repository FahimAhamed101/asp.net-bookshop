using Books.Api.Docker.Dtos;

public interface IAuthService
{
    public Task<Response> RegisterAsync(User user, CancellationToken cancellationToken);
    public Task<Response> LoginAsync(LoginUserRequest user, CancellationToken cancellationToken);
}