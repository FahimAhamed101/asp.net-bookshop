using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

public static class CheckoutEndpoints
{
    public static void MapCheckoutEndpoints(this IEndpointRouteBuilder app)
    {
        var checkoutGroup = app.MapGroup("api/Checkout");

        checkoutGroup.MapPost("/create-session", CreateSession).WithName(nameof(CreateSession)).DisableAntiforgery();
    }

    public static async Task<IResult> CreateSession(
        CreateCheckoutSessionRequest request,
        ApplicationDbContext context,
        IConfiguration configuration,
        HttpRequest httpRequest,
        CancellationToken cancellationToken)
    {
        if (request.Items is null || request.Items.Length == 0)
        {
            return Results.BadRequest("Cart is empty.");
        }

        var secretKey = configuration["Stripe:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            return Results.Problem("Stripe secret key is not configured.");
        }

        StripeConfiguration.ApiKey = secretKey;

        var bookIds = request.Items.Select(i => i.BookId).ToArray();
        var books = await context.Books
            .AsNoTracking()
            .Where(b => bookIds.Contains(b.Id))
            .ToListAsync(cancellationToken);

        if (books.Count != bookIds.Length)
        {
            return Results.BadRequest("One or more books were not found.");
        }

        var lineItems = new List<SessionLineItemOptions>();
        foreach (var item in request.Items)
        {
            var book = books.First(b => b.Id == item.BookId);
            var quantity = Math.Max(1, item.Quantity);

            lineItems.Add(new SessionLineItemOptions
            {
                Quantity = quantity,
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = (long)Math.Round(book.Price * 100M, 0),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = book.Title,
                        Description = book.Author,
                        Images = string.IsNullOrWhiteSpace(book.Image)
                            ? null
                            : new List<string> { EnsureAbsoluteImageUrl(book.Image, httpRequest) }
                    }
                }
            });
        }

        var frontendBaseUrl = configuration["FrontendBaseUrl"];
        if (string.IsNullOrWhiteSpace(frontendBaseUrl))
        {
            frontendBaseUrl = $"{httpRequest.Scheme}://{httpRequest.Host}";
        }

        var sessionOptions = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = $"{frontendBaseUrl}/checkout/success",
            CancelUrl = $"{frontendBaseUrl}/cart",
            LineItems = lineItems,
            Metadata = new Dictionary<string, string?>
            {
                ["fullName"] = request.Address.FullName,
                ["email"] = request.Address.Email,
                ["phone"] = request.Address.Phone,
                ["addressLine1"] = request.Address.AddressLine1,
                ["addressLine2"] = request.Address.AddressLine2,
                ["city"] = request.Address.City,
                ["state"] = request.Address.State,
                ["postalCode"] = request.Address.PostalCode,
                ["country"] = request.Address.Country
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(sessionOptions, cancellationToken: cancellationToken);

        return Results.Ok(new CreateCheckoutSessionResponse(session.Url ?? string.Empty));
    }

    private static string EnsureAbsoluteImageUrl(string imageUrl, HttpRequest request)
    {
        if (imageUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            return imageUrl;
        }

        var baseUrl = $"{request.Scheme}://{request.Host}";
        return $"{baseUrl}{imageUrl}";
    }
}
