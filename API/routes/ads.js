import express from "express";
import { createAd } from "../controllers/createAd.js";

const router = express.Router();

router.post("/create", createAd);

export default router;
