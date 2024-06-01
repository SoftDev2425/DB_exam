-- GetOrder Stored Procedure
CREATE PROCEDURE GetOrderById
    @OrderID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Fetch order details along with order lines
    SELECT 
        o.OrderID,
        o.OrderDate,
        o.ShippingAddress,
        o.ShippingCity,
        o.Status,
        o.CreatedAt AS OrderCreatedAt,
        o.UpdatedAt AS OrderUpdatedAt,
        ol.OrderLineID,
        ol.ISBN,
        ol.Quantity,
        ol.UnitPrice,
        b.Title AS BookTitle
    FROM Orders o
    LEFT JOIN OrderLine ol ON o.OrderID = ol.OrderID
    LEFT JOIN Books b ON ol.ISBN = b.ISBN
    WHERE o.OrderID = @OrderID;
END;
