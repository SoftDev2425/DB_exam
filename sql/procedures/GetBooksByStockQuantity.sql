-- Create a stored procedure to get books with a specific stock quantity
CREATE PROCEDURE GetBooksByStockQuantity
    @StockQuantity INT
AS
BEGIN
    -- Select all books with the specified stock quantity
    SELECT 
        ISBN,
        Title,
        StockQuantity,
        Price,
        CreatedAt,
        UpdatedAt
    FROM 
        Books
    WHERE 
        StockQuantity <= @StockQuantity
    ORDER BY 
        UpdatedAt DESC;
END;
