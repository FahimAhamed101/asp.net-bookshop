using Books.Api.Docker.Dtos;
using Books.Api.Docker.Extensions;
using Books.Api.Docker.Services;
using Microsoft.AspNetCore.Mvc;


public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var categoryGroup = app.MapGroup("api/Categories");

        categoryGroup.MapGet("", GetAllCategories).WithName(nameof(GetAllCategories));

        categoryGroup.MapGet("{id}", GetCategoryById).WithName(nameof(GetCategoryById));

        categoryGroup.MapPost("", CreateCategory).WithName(nameof(CreateCategory));

        categoryGroup.MapPut("{id}", UpdateCategory).WithName(nameof(UpdateCategory));

        categoryGroup.MapDelete("{id}", DeleteCategoryById).WithName(nameof(DeleteCategoryById));
    }

    public static async Task<IResult> GetAllCategories(
        [FromServices] ICategoryService CategoryService,
        CancellationToken cancellationToken)
    {
        var categories = await CategoryService.GetCategoriesAsync(cancellationToken);

        return Results.Ok(categories.Select(b => b.ToResponseDto()));
    }

    public static async Task<IResult> GetCategoryById(
         int id,
         [FromServices] ICategoryService CategoryService,
         
         CancellationToken cancellationToken)
    {
        var category = await CategoryService.GetCategoryByIdAsync(id, cancellationToken);

        if (category is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(category.ToResponseDto());
    }

    public static async Task<IResult> CreateCategory(
             [FromBody] CreateCategoryRequest request,
            [FromServices] ICategoryService CategoryService,
            CancellationToken cancellationToken)
    {
        if (!await IsAuthenticated(request.Email,  cancellationToken))
        {
            return Results.Unauthorized();
        }

        var category = request.ToEntity();

        category.Id = await CategoryService.CreateCategoryAsync(category, cancellationToken);

        return Results.CreatedAtRoute(
            nameof(CreateCategory),
            new { id = category.Id },
            category);
    }

    public static async Task<IResult> UpdateCategory(
            int id,
            [FromBody] UpdateCategoryRequest request,
            [FromServices] ICategoryService CategoryService,
        
            CancellationToken cancellationToken)
    {
        if (!await IsAuthenticated(request.Email,  cancellationToken))
        {
            return Results.Unauthorized();
        }

        try
        {
            var category = request.ToEntity(id);

            await CategoryService.UpdateCategoryAsync(category, cancellationToken);

            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.NotFound(ex.Message);
        }
    }

    public static async Task<IResult> DeleteCategoryById(
            [FromBody] DeleteCategoryRequest request,
            [FromServices] ICategoryService CategoryService,
          
            CancellationToken cancellationToken)
    {
        if (!await IsAuthenticated(request.Email, cancellationToken))
        {
            return Results.Unauthorized();
        }

        try
        {
            await CategoryService.DeleteCategoryByIdAsync(request.Id, cancellationToken);

            return Results.NoContent();
        }
        catch (Exception ex)
        {
            return Results.NotFound(ex.Message);
        }
    }
    internal static async Task<bool> IsAuthenticated(string email, CancellationToken cancellationToken)
    {
        return !string.IsNullOrWhiteSpace(email);
    }

}
