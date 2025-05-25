import express from "express";
import {
  logout,
  register,
  login,
  getCurrentUser,
} from "../controllers/auth.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.get("/me", getCurrentUser);

router.get("/verify", verifyToken, (req, res) => {
  res.status(202).json(req.user);
});

export default router;
