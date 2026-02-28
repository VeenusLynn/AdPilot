import express from "express";
import {
  logout,
  register,
  login,
  getCurrentUser,
  updateProfile,
  uploadProfileImage,
  changePassword,
} from "../controllers/auth.js";
import { verifyToken } from "../utils/verifyToken.js";
import uploadProfile from "../utils/uploadProfile.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.get("/me", getCurrentUser);

router.get("/verify", verifyToken, (req, res) => {
  res.status(202).json(req.user);
});

// Profile management — authenticated user only
router.patch("/profile", verifyToken, updateProfile);
router.post(
  "/profile/image",
  verifyToken,
  uploadProfile.single("profileImage"),
  uploadProfileImage,
);

// Password management — authenticated user only
router.post("/change-password", verifyToken, changePassword);

export default router;
