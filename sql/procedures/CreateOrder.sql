CREATE PROCEDURE CreateOrder
    @UserID UNIQUEIDENTIFIER,
    @ShippingAddress VARCHAR(255),
    @ShippingCity VARCHAR(50),
    @Basket NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    DECLARE @OrderID UNIQUEIDENTIFIER;
    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @BasketItems TABLE (
        ISBN VARCHAR(20),
        Quantity INT,
        Price DECIMAL(10, 2)
    );

    -- Parse the basket JSON into a table
    INSERT INTO @BasketItems (ISBN, Quantity, Price)
    SELECT ISBN, Quantity, Price
    FROM OPENJSON(@Basket)
    WITH (
        ISBN VARCHAR(20) '$.isbn',
        Quantity INT '$.quantity',
        Price DECIMAL(10, 2) '$.price'
    );

    -- Validate basket items and create order lines
    BEGIN TRY
        -- Create order
        INSERT INTO Orders (UserID, ShippingAddress, ShippingCity)
        OUTPUT INSERTED.OrderID
        VALUES (@UserID, @ShippingAddress, @ShippingCity);

        SET @OrderID = (SELECT TOP 1 OrderID FROM Orders WHERE UserID = @UserID AND ShippingAddress = @ShippingAddress AND ShippingCity = @ShippingCity ORDER BY CreatedAt DESC);

        DECLARE @CurrentISBN VARCHAR(20);
        DECLARE @CurrentQuantity INT;
        DECLARE @CurrentPrice DECIMAL(10, 2);

        DECLARE cur CURSOR FOR
        SELECT ISBN, Quantity, Price FROM @BasketItems;

        OPEN cur;
        FETCH NEXT FROM cur INTO @CurrentISBN, @CurrentQuantity, @CurrentPrice;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            DECLARE @LatestPrice DECIMAL(10, 2);
            DECLARE @LatestQuantity INT;

            -- Fetch the latest data from the Books table
            SELECT @LatestPrice = Price, @LatestQuantity = StockQuantity
            FROM Books
            WHERE ISBN = @CurrentISBN;

            IF @LatestQuantity < @CurrentQuantity
            BEGIN
                SET @ErrorMessage = N'Insufficient stock for ISBN: ' + @CurrentISBN;
                THROW 50001, @ErrorMessage, 1;
            END

            IF @LatestPrice <> @CurrentPrice
            BEGIN
                SET @ErrorMessage = N'Price mismatch for ISBN: ' + @CurrentISBN;
                THROW 50002, @ErrorMessage, 1;
            END

            -- Create order line
            INSERT INTO OrderLine (OrderID, ISBN, Quantity, UnitPrice)
            VALUES (@OrderID, @CurrentISBN, @CurrentQuantity, @CurrentPrice);

            -- Update stock quantity
            UPDATE Books
            SET StockQuantity = StockQuantity - @CurrentQuantity
            WHERE ISBN = @CurrentISBN;

            FETCH NEXT FROM cur INTO @CurrentISBN, @CurrentQuantity, @CurrentPrice;
        END

        CLOSE cur;
        DEALLOCATE cur;

        COMMIT TRANSACTION;

        SELECT @OrderID AS OrderID;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;

        -- Return error message
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
