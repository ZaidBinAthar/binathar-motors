import express from "express";
import {
    getPublicReviews,
    getRatingSummary,
    submitReview,
    getAllReviews,
    updateReviewStatus,
    deleteReview,
} from "../controllers/reviewsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.get("/public", getPublicReviews);
router.get("/summary", getRatingSummary);
router.post("/", submitReview);

// Staff/Admin
router.get("/", requireAuth, requireRole("owner", "admin", "staff"), getAllReviews);
router.put("/:id/status", requireAuth, requireRole("owner", "admin", "staff"), updateReviewStatus);

// Owner only
router.delete("/:id", requireAuth, requireRole("owner"), deleteReview);

export default router;
