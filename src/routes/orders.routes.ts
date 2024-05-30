import { Request, Response, Router } from "express";
import { CustomRequest } from "../ICustomRequest";

const orderRoutes = Router();

orderRoutes.get("/", async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ message: "Orders route" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default orderRoutes;
