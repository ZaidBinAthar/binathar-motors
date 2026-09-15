import express from "express";
import { chat, getSuggestions, getAuditLog } from "../controllers/aiAssistantController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/chat", requireAuth, requireRole("owner", "admin", "staff"), chat);
router.get("/suggestions", requireAuth, requireRole("owner", "admin", "staff"), getSuggestions);
router.get("/audit-log", requireAuth, requireRole("owner"), getAuditLog);

export default router;
