import express from "express";
import {
  createAd,
  getAds,
  getAdById,
  updateAdById,
  deleteAdById,
  uploadImage,
} from "../controllers/ads.js";
import { verifyToken } from "../utils/verifyToken.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/", verifyToken, createAd);
router.get("/", getAds);
router.get("/:id", getAdById);
router.put("/:id", verifyToken, updateAdById);
router.delete("/:id", verifyToken, deleteAdById);
router.post("/uploads", upload.single("image"), uploadImage);

export default router;
