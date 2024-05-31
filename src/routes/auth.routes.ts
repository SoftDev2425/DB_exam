import { Router, Request, Response } from "express";
import { UserLoginSchema, UserSchema } from "../schemas/user.schema";
import { ZodError } from "zod";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";
import bcrypt from "bcrypt";
import { redisClient } from "../../redis/client";
import UserPreferences from "../models/userpreferences.model";
import { v4 as uuidv4 } from "uuid";

// New Router instance
const router = Router();

// Home routes
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Validate the received registration details
    UserSchema.parse(req.body);

    // Check if email exists. (400 if error)
    const con = await sql.connect(mssqlConfig);
    // const result = await con.query`SELECT * FROM Users WHERE email = ${req.body.email}`;

    // if (result.recordset.length > 0) {
    //   res.status(400).json({ message: "User with email already exists!" });
    // }

    // Salt and then hash the password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Save our user in the database.
    const result = await con.query`
    IF NOT EXISTS (SELECT * FROM Users WHERE email = ${req.body.email})  
    BEGIN
        INSERT INTO Users (FirstName, LastName, Email, PasswordHash, DateOfBirth, Gender)
        OUTPUT INSERTED.UserId
        VALUES (${req.body.firstName.trim()}, ${req.body.lastName.trim()}, ${req.body.email}, ${hashedPassword}, ${
      req.body.dateOfBirth
    }, ${req.body.gender});
    END
    ELSE
    BEGIN
        THROW 50000, 'User with email already exists!', 1;
    END
    `;

    const userId = result.recordset[0].UserId;

    UserPreferences.create({
      UserId: userId,
      PreferedGenres: [],
      PreferedAuthors: [],
      PreferedFormats: [],
      PreferedLanguages: [],
      WishList: [],
    });

    await con.close();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.log(error);

    if (error instanceof ZodError) {
      res.status(400).json({
        message: error.errors[0].message + " " + error.errors[0].path,
      });
    }
    if (error.number === 50000) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    // Validate the received login details
    UserLoginSchema.parse(req.body);

    // If there is an error in received login details, return 400 status code and the error message
    const con = await sql.connect(mssqlConfig);
    const result = await con.query`SELECT * FROM Users WHERE email = ${req.body.email}`;

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Account does not exist!" });
    }

    const user = result.recordset[0];

    // Compare the password with the hashed password in the database
    const validPassword = await bcrypt.compare(req.body.password, user.PasswordHash);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password!" });
    }

    // Get the current session tokens for the user
    const userSessionsKey = `userSessions-${user.UserID}`;
    const userSessions = await redisClient.lRange(userSessionsKey, 0, -1);

    // If the user has 3 sessions, remove the oldest one
    if (userSessions.length >= 3) {
      const oldestSessionToken = userSessions[0];
      await redisClient.del(`sessionToken-${oldestSessionToken}`);
      await redisClient.lPop(userSessionsKey);
    }

    // Generate a new session token
    const sessionToken = uuidv4();
    const sessionTokenExpiry = req.body.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days if rememberMe is true, else 1 day

    // Store the session token in Redis with the user ID as the value
    await redisClient.set(`sessionToken-${sessionToken}`, user.UserID, {
      EX: sessionTokenExpiry,
    });

    // Add the new session token to the user's session list
    await redisClient.rPush(userSessionsKey, sessionToken);
    await redisClient.expire(userSessionsKey, sessionTokenExpiry);

    // Return the token to the user via a cookie
    res.cookie("sessionToken", sessionToken, {
      maxAge: sessionTokenExpiry * 1000,
      httpOnly: true,
    });

    await con.close();
    return res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.errors[0].message + " " + error.errors[0].path });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    // Get the session token from the cookie
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(400).json({ message: "No session token found!" });
    }

    // Check if the session token exists in Redis
    const userId = await redisClient.get(`sessionToken-${sessionToken}`);

    if (!userId) {
      return res.status(400).json({ message: "Invalid session token!" });
    }

    // Remove token from Redis
    await redisClient.del(`sessionToken-${sessionToken}`);

    // Remove the session token from the user's session list
    const userSessionsKey = `userSessions-${userId}`;
    await redisClient.lRem(userSessionsKey, 1, sessionToken);

    // Clear the cookie
    res.clearCookie("sessionToken");

    return res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
