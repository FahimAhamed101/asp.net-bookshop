

public sealed record CreateBookRequest(
    string Title, 
    string ISBN, 
    string Description, 
    string Author,
    string Category,
    string Image,
    string Email);

public sealed record BookResponse(
    int Id,
    string Title,
    string ISBN,
    string Description,
    string Author,
    string Category,
    string Image);

public sealed record UpdateBookRequest(
    string Title,
    string ISBN,
    string Description,
    string Author,
    string Category,
    string Image,
    string Email);

public sealed record DeleteBookRequest(   
    string ISBN,
    string Email);
