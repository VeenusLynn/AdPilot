import express from "express";
import {
  createAd,
  getAds,
  getAdById,
  updateAdById,
  deleteAdById,
} from "../controllers/ads.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createAd);
router.get("/", getAds);
router.get("/:id", getAdById);
router.put("/:id", verifyToken, updateAdById);
router.delete("/:id", verifyToken, deleteAdById);
export default router;
