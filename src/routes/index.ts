import { Router } from "express";
import homeRouter from "./home.routes";
import usersRouter from "./users.routes";
import authRouter from "./auth.routes";

// Create a new Router instance
const router = Router();

// Mount the routers
router.use("/api/auth", authRouter);
router.use("/", homeRouter);
router.use("/users", usersRouter);

export default router;
