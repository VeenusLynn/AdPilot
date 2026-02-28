import express from "express";
import { getAllUsers, updateUser } from "../controllers/admin.js";
import { verifyToken } from "../utils/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// All admin routes require a valid token AND the admin role
router.use(verifyToken, requireRole("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);

export default router;
