import express from "express";
import { createSale, getSaleById } from "../controllers/salesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("owner", "admin", "staff"), createSale);
router.get("/:id", requireAuth, requireRole("owner", "admin", "staff"), getSaleById);

export default router;
