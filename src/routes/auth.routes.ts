import { Router, Request, Response } from "express";
import { UserLoginSchema, UserSchema } from "../schemas/user.schema";
import { ZodError } from "zod";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";
import bcrypt from "bcrypt";
import { redisClient } from "../../redis/client";

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
      res.status(400).json({ message: "User with email already exists!" });
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
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: error.errors[0].message + " " + error.errors[0].path,
      });
    }

    console.log(error);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    // Validate the received login details
    UserLoginSchema.parse(req.body);

    // If there is an error in received login details , then return 400 status code and the error message.

    const con = await sql.connect(mssqlConfig);
    const result = await con.query`SELECT * FROM Users WHERE email = ${req.body.email}`;

    if (result.recordset.length === 0) {
      res.status(400).json({ message: "Account does not exist!" });
    }

    const user = result.recordset[0];

    // Compare the password with the hashed password in the database.
    const validPassword = await bcrypt.compare(req.body.password, user.PasswordHash);
    if (!validPassword) {
      res.status(400).json({ message: "Invalid password!" });
    }

    // check if the user is active
    const sessionTokenExists = await redisClient.exists(`sessionToken-${user.UserID}`);

    if (sessionTokenExists) {
      // delete the token
      await redisClient.del(`sessionToken-${user.UserID}`);
    }

    const sessionToken = crypto.randomUUID();
    const sessionTokenExpiry = req.body.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // Create a token for the user stored in redis.
    await redisClient.set(`sessionToken-${user.UserID}`, sessionToken, {
      EX: sessionTokenExpiry,
    });

    // Return the token to the user via a cookie
    res.cookie("sessionToken", sessionToken, {
      maxAge: sessionTokenExpiry * 1000,
      httpOnly: true,
    });

    await con.close();
    return res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors[0].message + " " + error.errors[0].path });
    }

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
