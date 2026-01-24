using Books.Api.Docker.Dtos;

public static class CategoryMappingExtensions
{
    public static CategoryResponse ToResponseDto(this Category Category)
    {
        return new(
            Category.Id,
            Category.Name);
    }

    public static Category ToEntity(this CreateCategoryRequest request)
    {
        return new()
        {
            Name = request.Name
        };
    }

    public static Category ToEntity(this UpdateCategoryRequest request, int id)
    {
        return new()
        {
            Id = id,
            Name = request.Name
        };
    }
}
