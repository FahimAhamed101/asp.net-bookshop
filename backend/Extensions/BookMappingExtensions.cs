

public static class BookMappingExtensions
{
    public static BookResponse ToResponseDto(this Book book)
    {
        return new(
            book.Id,
            book.Title,
            book.ISBN,
            book.Description,
            book.Author,
            book.Category,
            book.Image,
            book.Price);
    }

    public static Book ToEntity(this CreateBookRequest request)
    {
        return new()
        {
            Title = request.Title,
            ISBN = request.ISBN,
            Description = request.Description,
            Author = request.Author,
            Category = request.Category,
            Image = request.Image,
            Price = request.Price
        };
    }

    public static Book ToEntity(this CreateBookFormRequest request, string imagePath)
    {
        return new()
        {
            Title = request.Title,
            ISBN = request.ISBN,
            Description = request.Description,
            Author = request.Author,
            Category = request.Category,
            Image = imagePath,
            Price = request.Price
        };
    }

    public static Book ToEntity(this UpdateBookRequest request, int id)
    {
        return new()
        {
            Id = id,
            Title = request.Title,
            ISBN = request.ISBN,
            Description = request.Description,
            Author = request.Author,
            Category = request.Category,
            Image = request.Image,
            Price = request.Price
        };
    }

    public static Book ToEntity(this UpdateBookFormRequest request, int id, string imagePath)
    {
        return new()
        {
            Id = id,
            Title = request.Title,
            ISBN = request.ISBN,
            Description = request.Description,
            Author = request.Author,
            Category = request.Category,
            Image = imagePath,
            Price = request.Price
        };
    }
}
