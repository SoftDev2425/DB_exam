import { Router, Request, Response } from "express";
import { CustomRequest } from "../ICustomRequest";
import { mssqlConfig } from "../utils/mssqlConnection";
import sql from "mssql";
import UserPreferences from "../models/userpreferences.model";
import BookMetadata from "../models/bookmetdata.model";
import { redisClient } from "../../redis/client";

// New Router instance
const router = Router();

// Users routes
router.get("/preferences", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    const userPreferences = await UserPreferences.findOne({ UserId: userId });

    if (!userPreferences) {
      return res.status(404).json({ message: "User preferences not found!" });
    }

    res.status(200).json(userPreferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.put("/preferences", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    const {
      PreferedFormats: formats,
      PreferedLanguages: languages,
      PreferedGenres: genres,
      PreferedAuthors: authors,
    } = req.body;

    const distinctValues = await BookMetadata.aggregate([
      {
        $group: {
          _id: null,
          formats: { $addToSet: "$format" },
          languages: { $addToSet: "$language" },
          genres: { $addToSet: "$genres" },
          authors: { $addToSet: "$authors" },
        },
      },
    ]);

    const result = distinctValues.length > 0 ? distinctValues : [{}];

    console.log(distinctValues[0].genres);

    // Check if any provided values don't match distinct values fetched from the books collection
    const invalidFormats = formats.filter((format: string) => !result[0].formats.includes(format));
    const invalidLanguages = languages.filter((language: string) => !result[0].languages.includes(language));
    const invalidGenres = genres.filter((genre: string) => !result[0].genres.flat().includes(genre));
    const invalidAuthors = authors.filter((author: string) => !result[0].authors.flat().includes(author));

    let errorMsg = "";

    if (invalidFormats.length > 0) {
      errorMsg += "Invalid format(s) provided! ";
    }

    if (invalidLanguages.length > 0) {
      errorMsg += "Invalid language(s) provided! ";
    }

    if (invalidGenres.length > 0) {
      errorMsg += "Invalid genre(s) provided! ";
    }

    if (invalidAuthors.length > 0) {
      errorMsg += "Invalid author(s) provided! ";
    }

    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    // Proceed with updating user preferences if all values are valid
    const userPreferences = await UserPreferences.findOneAndUpdate(
      { UserId: userId },
      { PreferedFormats: formats, PreferedLanguages: languages, PreferedGenres: genres, PreferedAuthors: authors },
      { new: true }
    );

    if (!userPreferences) {
      return res.status(404).json({ message: "User preferences not found!" });
    }

    res.status(200).json({ message: "User preferences updated!", userPreferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.delete("/delete", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies.sessionToken;
    
    if (!sessionToken) {
      return res.status(400).json({ message: "No session token found!" });
    }

    // Check if the session token exists in Redis
    const userId = await redisClient.get(`sessionToken-${sessionToken}`);

    if (!userId) {
      return res.status(400).json({ message: "Invalid session token!" });
    }

    console.log(userId);
    

    const con = await sql.connect(mssqlConfig);

    // Call stored procedure to anonymize the user
    await con.request()
      .input("UserID", sql.UniqueIdentifier, userId)
      .execute("AnonymizeUser");

    await con.close();
    
    // Remove token from Redis
    await redisClient.del(`sessionToken-${sessionToken}`);

    // Remove the session token from the user's session list
    const userSessionsKey = `userSessions-${userId}`;
    await redisClient.lRem(userSessionsKey, 1, sessionToken);

    // Clear the cookie
    res.clearCookie("sessionToken");
    
    return res.status(200).json({ message: "User deleted successfully!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
