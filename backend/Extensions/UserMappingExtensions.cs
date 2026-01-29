namespace AspNetBookshop.Extensions;

public static class UserMappingExtensions
{
    public static UserResponse ToResponseDto(this User User)
    {
        return new(
            User.Id,
            User.Name,
            User.Email,
            User.Password,
            User.Initials ?? string.Empty,
            User.Role);
    }

    public static UserProfileResponse ToProfileResponseDto(this User User)
    {
        return new(
            User.Id,
            User.Name,
            User.Email,
            User.Initials ?? string.Empty,
            User.Role);
    }

    public static User ToEntity(this RegisterUserRequest request)
    {
        return new()
        {           
            Name = request.Name,
            Email = request.Email,
            Password = request.Password,
            Initials = request.Initials ?? string.Empty,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role
        };
    }

    public static User ToEntity(this UpdateUserRequest request, int id)
    {
        return new()
        {
            Id = request.Id,
            Name = request.Name,
            Email = request.Email,
            Password = request.Password,
            Initials = request.Initials ?? string.Empty,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role
        };
    }
}
