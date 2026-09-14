import express from "express";
import { generateDescription } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/generate-description", requireAuth, requireRole("owner", "admin", "staff"), generateDescription);

export default router;
