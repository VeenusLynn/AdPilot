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
import { requireRole } from "../middleware/requireRole.js";
import upload from "../utils/upload.js";

const router = express.Router();

// Public read routes
router.get("/", getAds);
router.get("/:id", getAdById);

// Admin-only write routes : require valid token AND admin role
router.post("/", verifyToken, requireRole("admin"), createAd);
router.put("/:id", verifyToken, requireRole("admin"), updateAdById);
router.delete("/:id", verifyToken, requireRole("admin"), deleteAdById);
router.post(
  "/uploads",
  verifyToken,
  requireRole("admin"),
  upload.single("image"),
  uploadImage,
);

export default router;
