import express from "express";
import { login } from "../controllers/login.js";
import { register } from "../controllers/register.js";
import { logout } from "../controllers/logout.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.get("/verify", verifyToken, (req, res) => {
  res.status(202).json(req.user);
});

export default router;
