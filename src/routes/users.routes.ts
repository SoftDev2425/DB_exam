import { Router, Response } from "express";
import { CustomRequest } from "../ICustomRequest";
import { mssqlConfig } from "../utils/mssqlConnection";
import sql from "mssql";
import UserPreferences from "../models/userpreferences.model";
import BookMetadata from "../models/bookmetdata.model";
import { redisClient } from "../../redis/client";

// New Router instance
const usersRouter = Router();

// Users routes
usersRouter.get("/preferences", async (req: CustomRequest, res: Response) => {
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

usersRouter.put("/preferences", async (req: CustomRequest, res: Response) => {
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

usersRouter.delete("/delete", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    const con = await sql.connect(mssqlConfig);

    // Remove basket from Redis
    await redisClient.del(`basket-${userId}`);

    // Get list of session tokens for the user
    const userSessions = await redisClient.lRange(`userSessions-${userId}`, 0, -1);

    // Delete all session tokens
    for (const session of userSessions) {
      await redisClient.del(`sessionToken-${session}`);
    }

    // Delete the list of session tokens
    await redisClient.del(`userSessions-${userId}`);

    // Call stored procedure to anonymize the user
    await con.request().input("UserID", sql.UniqueIdentifier, userId).execute("AnonymizeUser");

    // Clear the cookie
    res.clearCookie("sessionToken");

    await con.close();
    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default usersRouter;
