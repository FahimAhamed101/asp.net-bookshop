


public sealed record RegisterUserRequest(    
    string Name,
    string Email,
    string Password,
    string Initials,
    string Role = "User");

public sealed record UpdateUserRequest(
    int Id,
    string Name,
    string Email,
    string Password,
    string Initials,
    string Role = "User");

public sealed record UserResponse(
    int Id,
    string Name,
    string Email,
    string Password,
    string Initials,
    string Role);

public sealed record UserProfileResponse(
    int Id,
    string Name,
    string Email,
    string Initials,
    string Role);

public sealed record LoginUserRequest(  
    string Email,
    string Password);

public sealed record UserAuthResponse( 
    string Token,
    int UserId,
    string Name,
    string Email,
    string Initials,
    string Role);
