import { Router } from "express";
import homeRouter from "./home.routes";
import usersRouter from "./users.routes";
import authRouter from "./auth.routes";
import authMiddleware from "../middleware/auth.middleware";
import booksRouter from "./books.routes";
import orderRoutes from "./orders.routes";
import basketRoutes from "./basket.routes";

// Create a new Router instance
const router = Router();

// Mount the routers
router.use("/api/auth", authRouter);
router.use("/home", authMiddleware, homeRouter);
router.use("/user", authMiddleware, usersRouter);
router.use("/books", authMiddleware, booksRouter);
router.use("/orders", authMiddleware, orderRoutes);
router.use("/basket", authMiddleware, basketRoutes);

export default router;
