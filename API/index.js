import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import adsRoutes from "./routes/ads.js";
import generalRoutes from "./routes/general.js";
import sdkRoutes from "./routes/sdk.js";
import statsRoutes from "./routes/stats.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ads", adsRoutes);
app.use("/general", generalRoutes);
app.use("/api/sdk", sdkRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 9000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
