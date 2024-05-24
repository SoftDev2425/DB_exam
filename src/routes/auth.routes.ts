import { Router, Request, Response } from "express";
import { UserSchema } from "../schemas/user.schema";
import { ZodError } from "zod";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";
import bcrypt from "bcrypt";

// New Router instance
const router = Router();

// Home routes
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Validate the received registration details
    UserSchema.parse(req.body);

    // Check if email exists. (400 if error)
    const con = await sql.connect(mssqlConfig);
    const result = await con.query`SELECT * FROM Users WHERE email = ${req.body.email}`;

    if (result.recordset.length > 0) {
      res.status(400).json({ message: "Email already exists!" });
    }

    // Salt and then hash the password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Save our user in the database.
    await con.query`
        INSERT INTO Users (FirstName, LastName, Email, PasswordHash, DateOfBirth, Gender)
        VALUES (${req.body.firstName}, ${req.body.lastName}, ${req.body.email}, ${hashedPassword}, ${req.body.dateOfBirth}, ${req.body.gender})
    `;

    await con.close();
    res.json({ message: "This is the register route!" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors[0].message + " " + error.errors[0].path });
    }

    console.log(error);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    res.json({ message: "This is the login route!" });

    // Validate the received login details
    // If there is an error in received login details , then return 400 status code and the error message.
    // Check if email exists. (400 if error)
    // Compare the password with the hashed password in the database.
    // Create a token for the user stored in redis.
    // Return the token to the user via a cookie
  } catch (error) {
    console.log(error);
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    res.json({ message: "This is the logout route!" });

    // Delete the token stored in redis.
    // Return a success message.
  } catch (error) {
    console.log(error);
  }
});

export default router;
