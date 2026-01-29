using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public BooksController(IBookService bookService, ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _bookService = bookService;
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookResponse>>> GetAllBooks(CancellationToken cancellationToken)
    {
        var books = await _bookService.GetBooksAsync(cancellationToken);

        if (books is null)
        {
            return NotFound();
        }

        var response = books.Select(b => ToResponseDtoWithBaseUrl(b, Request));
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookResponse>> GetBookById(int id, CancellationToken cancellationToken)
    {
        var book = await _bookService.GetBookByIdAsync(id, cancellationToken);

        if (book is null)
        {
            return NotFound();
        }

        return Ok(ToResponseDtoWithBaseUrl(book, Request));
    }

    [HttpPost]
    [DisableAntiforgeryToken]
    public async Task<ActionResult<Book>> CreateBook([FromForm] CreateBookFormRequest request, CancellationToken cancellationToken)
    {
        if (!await IsAdmin(request.Email, _context, cancellationToken))
        {
            return Forbid();
        }

        if (request.ImageFile is null || request.ImageFile.Length == 0)
        {
            return BadRequest("Image file is required.");
        }

        var imagePath = await SaveBookImageAsync(request.ImageFile, _environment, cancellationToken);
        var book = BookMappingExtensions.ToEntity(request, imagePath);

        book.Id = await _bookService.CreateBookAsync(book, cancellationToken);

        return CreatedAtAction(nameof(GetBookById), new { id = book.Id }, book);
    }

    [HttpPut("{id:int}")]
    [DisableAntiforgeryToken]
    public async Task<IActionResult> UpdateBook(int id, [FromForm] UpdateBookFormRequest request, CancellationToken cancellationToken)
    {
        if (!await IsAdmin(request.Email, _context, cancellationToken))
        {
            return Forbid();
        }

        var existingBook = await _bookService.GetBookByIdAsync(id, cancellationToken);
        if (existingBook is null)
        {
            return NotFound();
        }

        var imagePath = existingBook.Image;
        if (request.ImageFile is not null && request.ImageFile.Length > 0)
        {
            imagePath = await SaveBookImageAsync(request.ImageFile, _environment, cancellationToken);
        }

        var book = BookMappingExtensions.ToEntity(request, id, imagePath);

        await _bookService.UpdateBookAsync(book, cancellationToken);

        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteBookById([FromBody] DeleteBookRequest request, CancellationToken cancellationToken)
    {
        if (!await IsAdmin(request.Email, _context, cancellationToken))
        {
            return Forbid();
        }

        try
        {
            await _bookService.DeleteBookByIdAsync(request.ISBN, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    private static async Task<bool> IsAdmin(string email, ApplicationDbContext context, CancellationToken cancellationToken)
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
