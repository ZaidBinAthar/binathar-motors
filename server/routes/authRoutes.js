import express from "express";
import jwt from "jsonwebtoken";
import { authenticateGoogleUser } from "../services/authServices.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// POST /api/auth/google
// Body: { credential } — the Google ID token from the frontend
router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required"
            });
        }

        const user = await authenticateGoogleUser(credential);

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user
        });
    } catch (error) {
        console.error("Google auth error:", error.message);

        const message =
            error.message.includes("disabled") ||
            error.message.includes("waiting")
                ? error.message
                : "Google authentication failed";

        res.status(401).json({
            success: false,
            message
        });
    }
});

// GET /api/auth/me
// Requires Bearer token — returns the current authenticated user
router.get("/me", requireAuth, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

export default router;
