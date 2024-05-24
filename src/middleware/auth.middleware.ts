import { Request, Response, NextFunction } from "express";
import { redisClient } from "../../redis/client";
import { CustomRequest } from "../ICustomRequest";

const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({ message: "Authentication required!" });
    }

    const userId = await redisClient.get(`sessionToken-${sessionToken}`);

    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired session token!" });
    }

    req.userId = userId;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authMiddleware;
