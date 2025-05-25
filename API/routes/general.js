import express from "express";
import { getUser, landing } from "../controllers/general.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.get("/", landing);

export default router;
