import { Router, Request, Response } from "express";
import { CustomRequest } from "../ICustomRequest";
import { mssqlConfig } from "../utils/mssqlConnection";
import sql from "mssql";
import UserPreferences from "../models/userpreferences.model";

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

router.put("/preferences", (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    res.status(200).json({ message: "User preferences updated!" });
  } catch (error) {}
});

export default router;
