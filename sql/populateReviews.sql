BEGIN TRANSACTION;

-- Set the number of users, orders, and reviews you want to insert
DECLARE @NumUsers INT = 1500;
DECLARE @NumOrders INT = 2000;
DECLARE @NumReviews INT = 1250;

DECLARE @i INT = 1;
WHILE @i <= @NumUsers
BEGIN
    INSERT INTO Users (FirstName, LastName, Email, PasswordHash, DateOfBirth, Gender)
    VALUES (
        LEFT(CONVERT(VARCHAR(36), NEWID()), 8),                                 -- Random FirstName
        LEFT(CONVERT(VARCHAR(36), NEWID()), 8),                                 -- Random LastName
        LEFT(CONVERT(VARCHAR(36), NEWID()), 8) + '@example.com',                -- Random Email
        HASHBYTES('SHA2_256', CONVERT(VARCHAR(36), NEWID())),                   -- Random PasswordHash
        DATEADD(DAY, -ABS(CHECKSUM(NEWID()) % 20000), GETDATE()),               -- Random DateOfBirth
        CASE ABS(CHECKSUM(NEWID()) % 2) 
            WHEN 0 THEN 'M' 
            ELSE 'F' 
        END                                                                     -- Random Gender
    );

    SET @i = @i + 1;
END


-- Generate random orders
SET @i = 1;
WHILE @i <= @NumOrders
BEGIN
    INSERT INTO Orders (UserID, ShippingAddress, ShippingCity)
    SELECT 
        (SELECT TOP 1 UserID FROM Users ORDER BY NEWID()), -- Random UserID
        LEFT(NEWID(), 16),                                 -- Random ShippingAddress
        LEFT(NEWID(), 8)                                   -- Random ShippingCity
    ;

    SET @i = @i + 1;
END

-- Generate random reviews
SET @i = 1;
WHILE @i <= @NumReviews
BEGIN
    -- Generate a random rating between 1 and 5
    DECLARE @Rating INT = ABS(CHECKSUM(NEWID()) % 5) + 1;

    -- Insert a new review with random UserID, ISBN, and Comment based on Rating
    INSERT INTO Reviews (UserID, ISBN, Rating, Comment)
    SELECT 
        (SELECT TOP 1 UserID FROM Users ORDER BY NEWID()), -- Random UserID
        (SELECT TOP 1 ISBN FROM Books ORDER BY NEWID()),   -- Random ISBN
        @Rating,                                          -- Random Rating
        CASE @Rating
            WHEN 1 THEN 
                CASE ABS(CHECKSUM(NEWID()) % 2) 
                    WHEN 0 THEN 'Bad' 
                    ELSE 'Waste of time' 
                END
            WHEN 2 THEN 
                CASE ABS(CHECKSUM(NEWID()) % 2) 
                    WHEN 0 THEN 'Could be better' 
                    ELSE 'I wouldn''t recommend to all I know' 
                END
            WHEN 3 THEN 
                CASE ABS(CHECKSUM(NEWID()) % 3) 
                    WHEN 0 THEN 'I enjoyed it' 
                    WHEN 1 THEN 'Not a masterpiece, but not an awful read either' 
                    ELSE 'Something was missing' 
                END
            WHEN 4 THEN 
                CASE ABS(CHECKSUM(NEWID()) % 2) 
                    WHEN 0 THEN 'Really good' 
                    ELSE 'Glad this was recommended to me' 
                END
            WHEN 5 THEN 
                CASE ABS(CHECKSUM(NEWID()) % 3) 
                    WHEN 0 THEN 'A masterpiece' 
                    WHEN 1 THEN 'Book of the year I tell you' 
                    ELSE 'Please read for your own sake' 
                END
        END; 

    SET @i = @i + 1;
END

COMMIT TRANSACTION;
