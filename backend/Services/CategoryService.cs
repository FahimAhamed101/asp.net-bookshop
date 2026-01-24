

using Microsoft.EntityFrameworkCore;

public sealed class CategoryService(ApplicationDbContext context) : ICategoryService
{
    public async Task<int> CreateCategoryAsync(Category Category, CancellationToken cancellationToken)
    {
        context.Add(Category);

        await context.SaveChangesAsync(cancellationToken);
        return Category.Id;
    }

    public async Task DeleteCategoryByIdAsync(int id, CancellationToken cancellationToken)
    {
        var Category = await context.Categories
             .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (Category is null)
        {
            throw new ArgumentException($"Category is not foud Id {id}");
        }

        context.Remove(Category);

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Category?> GetCategoryByIdAsync(int id, CancellationToken cancellationToken)
          => await context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

    public async Task<IEnumerable<Category>> GetCategoriesAsync(CancellationToken cancellationToken)
        => await context.Categories
        .AsNoTracking()
        .OrderBy(o => o.Id)
        .ToListAsync(cancellationToken);

    public async Task UpdateCategoryAsync(Category Category, CancellationToken cancellationToken)
    {
        var CategoryObj = await context.Categories
             .FirstOrDefaultAsync(b => b.Id == Category.Id, cancellationToken);

        if (CategoryObj is null)
        {
            throw new ArgumentException($"Category is not found with Id {Category.Id}");
        }

        CategoryObj.Name = Category.Name;

        await context.SaveChangesAsync(cancellationToken);
    }
}
