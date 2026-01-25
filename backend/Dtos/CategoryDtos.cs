

public sealed record CreateCategoryRequest(
    string Email,
    string Name);

public sealed record CategoryResponse(
    int Id,
    string Name);

public sealed record UpdateCategoryRequest(
    string Email,
    int Id,
    string Name);
public sealed record DeleteCategoryRequest(
    string Email,
    int Id,
    string Name);
