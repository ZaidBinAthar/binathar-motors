import express from "express";
import {
    createSellRequest,
    getSellRequests,
    getSellRequestById,
    updateSellRequestStatus,
    convertToBike,
    deleteSellRequest,
} from "../controllers/sellRequestsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", createSellRequest);
router.get("/", requireAuth, requireRole("owner", "admin"), getSellRequests);
router.get("/:id", requireAuth, requireRole("owner", "admin"), getSellRequestById);
router.put("/:id/status", requireAuth, requireRole("owner", "admin"), updateSellRequestStatus);
router.post("/:id/convert", requireAuth, requireRole("owner", "admin"), convertToBike);
router.delete("/:id", requireAuth, requireRole("owner"), deleteSellRequest);

export default router;
