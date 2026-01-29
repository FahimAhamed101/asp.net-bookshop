using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetAllCategories(CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetCategoriesAsync(cancellationToken);
        var response = categories.Select(CategoryMappingExtensions.ToResponseDto);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> GetCategoryById(int id, CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id, cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        return Ok(CategoryMappingExtensions.ToResponseDto(category));
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        if (!IsAuthenticated(request.Email))
        {
            return Unauthorized();
        }

        var category = CategoryMappingExtensions.ToEntity(request);
        category.Id = await _categoryService.CreateCategoryAsync(category, cancellationToken);

        return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        if (!IsAuthenticated(request.Email))
        {
            return Unauthorized();
        }

        try
        {
            var category = CategoryMappingExtensions.ToEntity(request, id);
            await _categoryService.UpdateCategoryAsync(category, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteCategoryById([FromBody] DeleteCategoryRequest request, CancellationToken cancellationToken)
    {
        if (!IsAuthenticated(request.Email))
        {
            return Unauthorized();
        }

        try
        {
            await _categoryService.DeleteCategoryByIdAsync(request.Id, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    private static bool IsAuthenticated(string email)
    {
        return !string.IsNullOrWhiteSpace(email);
    }
}
