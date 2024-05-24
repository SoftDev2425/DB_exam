import { Router } from "express";
import homeRouter from "./home.routes";
import usersRouter from "./users.routes";
import authRouter from "./auth.routes";
import authMiddleware from "../middleware/auth.middleware";

// Create a new Router instance
const router = Router();

// Mount the routers
router.use("/api/auth", authRouter);
router.use("/home", authMiddleware, homeRouter);
router.use("/users", authMiddleware, usersRouter);

export default router;
