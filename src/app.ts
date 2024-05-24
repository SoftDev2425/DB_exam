// Import express, cors, helmet and morgan
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { redisClient } from "../redis/client";
import cookieParser from "cookie-parser";

// Create Express server
const app = express(); // New express instance
const port = 3000; // Port number

// Express configuration
app.use(cors()); // Enable CORS
app.use(helmet()); // Enable Helmet
app.use(morgan("dev")); // Enable Morgan
app.use(bodyParser.json()); // Enable JSON parsing
app.use(cookieParser()); // Enable cookie parsing

mongoose
  .connect("mongodb://localhost:27017/BookStore")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to db", err);
  });

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.log("Error connecting to Redis", err);
  });

// Use routes
app.use("/", router);

// Start Express server
app.listen(port, () => {
  // Callback function when server is successfully started
  console.log(`Server started at http://localhost:${port}`);
});

// Export Express app
export default app;
