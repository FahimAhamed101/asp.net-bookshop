using Microsoft.AspNetCore.Mvc;
using System.IO;
using Microsoft.EntityFrameworkCore;


public static class BookEndpoints
{
    public static void MapBookEndpoints(this IEndpointRouteBuilder app)
    {
        var bookGroup = app.MapGroup("api/Books");

        bookGroup.MapGet("", GetAllBooks).WithName(nameof(GetAllBooks));

        bookGroup.MapGet("{id}", GetBookById).WithName(nameof(GetBookById));

        bookGroup.MapPost("", CreateBook).WithName(nameof(CreateBook)).DisableAntiforgery();

        bookGroup.MapPut("{id}", UpdateBook).WithName(nameof(UpdateBook)).DisableAntiforgery();

        bookGroup.MapDelete("{id}", DeleteBookById).WithName(nameof(DeleteBookById));
    }

    public static async Task<IResult> GetAllBooks(
        [FromServices] IBookService bookService,
        HttpRequest request,
        CancellationToken cancellationToken)
    {
        var books = await bookService.GetBooksAsync(cancellationToken);

        if (books is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(books.Select(b => ToResponseDtoWithBaseUrl(b, request)));
    }

    public static async Task<IResult> GetBookById(
         int id,
         [FromServices] IBookService bookService,
         HttpRequest request,
    
         CancellationToken cancellationToken)
    {
        var book = await bookService.GetBookByIdAsync(id, cancellationToken);

        if (book is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(ToResponseDtoWithBaseUrl(book, request));
    }

    public static async Task<IResult> CreateBook(
            [FromForm] CreateBookFormRequest request,
            [FromServices] IBookService bookService,
            [FromServices] ApplicationDbContext context,
            [FromServices] IWebHostEnvironment environment,
            CancellationToken cancellationToken)
    {
        if (!await IsAdmin(request.Email, context, cancellationToken))
        {
            return Results.Forbid();
        }

        if (request.ImageFile is null || request.ImageFile.Length == 0)
        {
            return Results.BadRequest("Image file is required.");
        }

        var imagePath = await SaveBookImageAsync(request.ImageFile, environment, cancellationToken);
        var book = BookMappingExtensions.ToEntity(request, imagePath);

        book.Id = await bookService.CreateBookAsync(book, cancellationToken);

        return Results.CreatedAtRoute(
            nameof(CreateBook),
            new { id = book.Id },
            book);
    }

    public static async Task<IResult> UpdateBook(
            int id,
            [FromForm] UpdateBookFormRequest request,
            [FromServices] IBookService bookService,
            [FromServices] ApplicationDbContext context,
            [FromServices] IWebHostEnvironment environment,
            CancellationToken cancellationToken)
    {
        if (!await IsAdmin(request.Email, context, cancellationToken))
        {
            return Results.Forbid();
        }

        try
        {
            var existingBook = await bookService.GetBookByIdAsync(id, cancellationToken);
            if (existingBook is null)
            {
                return Results.NotFound();
            }

            var imagePath = existingBook.Image;
            if (request.ImageFile is not null && request.ImageFile.Length > 0)
            {
                imagePath = await SaveBookImageAsync(request.ImageFile, environment, cancellationToken);
            }

            var book = BookMappingExtensions.ToEntity(request, id, imagePath);

            await bookService.UpdateBookAsync(book, cancellationToken);

           

            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.NotFound(ex.Message);
        }
    }

    public static async Task<IResult> DeleteBookById(
            [FromBody] DeleteBookRequest request,
            [FromServices] IBookService bookService,
            [FromServices] ApplicationDbContext context,
            CancellationToken cancellationToken)
    {
        if (!await IsAdmin(request.Email, context, cancellationToken))
        {
            return Results.Forbid();
        }

        try
        {
            await bookService.DeleteBookByIdAsync(request.ISBN, cancellationToken);

           

            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.NotFound(ex.Message);
        }
    }

    internal static async Task<bool> IsAuthenticated(string email,  CancellationToken cancellationToken)
    {
        return !string.IsNullOrWhiteSpace(email);
    }

    internal static async Task<bool> IsAdmin(string email, ApplicationDbContext context, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        return user?.Role == "Admin";
    }

    private static async Task<string> SaveBookImageAsync(
        IFormFile imageFile,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        var webRoot = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadRoot = Path.Combine(webRoot, "uploads", "books");
        Directory.CreateDirectory(uploadRoot);

        var fileExtension = Path.GetExtension(imageFile.FileName);
        var fileName = $"{Guid.NewGuid():N}{fileExtension}";
        var filePath = Path.Combine(uploadRoot, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            await imageFile.CopyToAsync(stream, cancellationToken);
        }

        return $"/uploads/books/{fileName}";
    }

    private static BookResponse ToResponseDtoWithBaseUrl(Book book, HttpRequest request)
    {
        var image = book.Image;
        if (!string.IsNullOrWhiteSpace(image) && !image.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            var baseUrl = $"{request.Scheme}://{request.Host}";
            image = $"{baseUrl}{image}";
        }

        return new BookResponse(
            book.Id,
            book.Title,
            book.ISBN,
            book.Description,
            book.Author,
            book.Category,
            image ?? string.Empty,
            book.Price);
    }

}
