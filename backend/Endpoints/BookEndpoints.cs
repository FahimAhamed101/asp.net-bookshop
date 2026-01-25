using Microsoft.AspNetCore.Mvc;


public static class BookEndpoints
{
    public static void MapBookEndpoints(this IEndpointRouteBuilder app)
    {
        var bookGroup = app.MapGroup("api/Books");

        bookGroup.MapGet("", GetAllBooks).WithName(nameof(GetAllBooks));

        bookGroup.MapGet("{id}", GetBookById).WithName(nameof(GetBookById));

        bookGroup.MapPost("", CreateBook).WithName(nameof(CreateBook));

        bookGroup.MapPut("{id}", UpdateBook).WithName(nameof(UpdateBook));

        bookGroup.MapDelete("{id}", DeleteBookById).WithName(nameof(DeleteBookById));
    }

    public static async Task<IResult> GetAllBooks(
        [FromServices] IBookService bookService,
      
        CancellationToken cancellationToken)
    {
        var books = await bookService.GetBooksAsync(cancellationToken);

        if (books is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(books.Select(b => BookMappingExtensions.ToResponseDto(b)));
    }

    public static async Task<IResult> GetBookById(
         int id,
         [FromServices] IBookService bookService,
    
         CancellationToken cancellationToken)
    {
        var book = await bookService.GetBookByIdAsync(id, cancellationToken);

        if (book is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(BookMappingExtensions.ToResponseDto(book));
    }

    public static async Task<IResult> CreateBook(
            [FromBody] CreateBookRequest request,
            [FromServices] IBookService bookService,
            CancellationToken cancellationToken)
    {
        if (!await IsAuthenticated(request.Email, cancellationToken))
        {
            return Results.Unauthorized();
        }

        var book = BookMappingExtensions.ToEntity(request);

        book.Id = await bookService.CreateBookAsync(book, cancellationToken);

        return Results.CreatedAtRoute(
            nameof(CreateBook),
            new { id = book.Id },
            book);
    }

    public static async Task<IResult> UpdateBook(
            int id,
            [FromBody] UpdateBookRequest request,
            [FromServices] IBookService bookService,
          
            CancellationToken cancellationToken)
    {
        if (!await IsAuthenticated(request.Email,  cancellationToken))
        {
            return Results.Unauthorized();
        }

        try
        {
            var book = BookMappingExtensions.ToEntity(request, id);

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
        
            CancellationToken cancellationToken)
    {
        if (!await IsAuthenticated(request.Email, cancellationToken))
        {
            return Results.Unauthorized();
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

}
