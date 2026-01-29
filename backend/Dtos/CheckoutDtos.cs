public sealed record CheckoutItemRequest(
    int BookId,
    int Quantity);

public sealed record CheckoutAddressRequest(
    string FullName,
    string Email,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string PostalCode,
    string Country);

public sealed record CreateCheckoutSessionRequest(
    CheckoutItemRequest[] Items,
    CheckoutAddressRequest Address);

public sealed record CreateCheckoutSessionResponse(
    string Url);
