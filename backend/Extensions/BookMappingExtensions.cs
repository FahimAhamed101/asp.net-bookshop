using Books.Api.Docker.Dtos;

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
            book.Image);
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
            Image = request.Image
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
            Image = request.Image
        };
    }
}
