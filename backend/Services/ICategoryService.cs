
public interface ICategoryService
{
    public Task<Category?> GetCategoryByIdAsync(int id, CancellationToken cancellationToken);
    public Task<IEnumerable<Category>> GetCategoriesAsync(CancellationToken cancellationToken);
    public Task<int> CreateCategoryAsync(Category Category, CancellationToken cancellationToken);
    public Task UpdateCategoryAsync(Category Category, CancellationToken cancellationToken);
    public Task DeleteCategoryByIdAsync(int id, CancellationToken cancellationToken);
}
