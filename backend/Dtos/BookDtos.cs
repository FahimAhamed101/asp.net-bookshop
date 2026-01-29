

using Microsoft.AspNetCore.Http;

public sealed record CreateBookRequest(
    string Title, 
    string ISBN, 
    string Description, 
    string Author,
    string Category,
    string Image,
    decimal Price,
    string Email);

public sealed record CreateBookFormRequest(
    string Title,
    string ISBN,
    string Description,
    string Author,
    string Category,
    IFormFile? ImageFile,
    decimal Price,
    string Email);

public sealed record BookResponse(
    int Id,
    string Title,
    string ISBN,
    string Description,
    string Author,
    string Category,
    string Image,
    decimal Price);

public sealed record UpdateBookRequest(
    string Title,
    string ISBN,
    string Description,
    string Author,
    string Category,
    string Image,
    decimal Price,
    string Email);

public sealed record UpdateBookFormRequest(
    string Title,
    string ISBN,
    string Description,
    string Author,
    string Category,
    IFormFile? ImageFile,
    decimal Price,
    string Email);

public sealed record DeleteBookRequest(   
    string ISBN,
    string Email);
