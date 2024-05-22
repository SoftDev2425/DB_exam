-- Stored Procedure to Anonymize User
CREATE PROCEDURE AnonymizeUser @UserID UNIQUEIDENTIFIER
AS
BEGIN
    -- Update the user information to anonymize
    UPDATE Users
    SET 
        FirstName = 'Deleted',
        LastName = 'User',
        Email = CONCAT('deleteduser_', NEWID(), '@example.com'),
        PasswordHash = NULL,
        DateOfBirth = NULL,
        Gender = NULL,
        IsAnonymized = 1,
        UpdatedAt = GETDATE()
    WHERE UserID = @UserID;
END;
