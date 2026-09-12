import express from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// POST /api/inquiries — submit inquiry from BikeDetail (public or logged-in)
router.post("/", async (req, res) => {
    try {
        const { bike_id, customer_name, customer_phone, message } = req.body;

        if (!customer_name || !customer_phone) {
            return res.status(400).json({ success: false, message: "Name and phone are required" });
        }

        const userId = req.headers.authorization ? null : null;

        let userIdVal = null;
        const header = req.headers.authorization;
        if (header && header.startsWith("Bearer ")) {
            try {
                const jwt = await import("jsonwebtoken");
                const decoded = jwt.default.verify(header.split(" ")[1], process.env.JWT_SECRET);
                userIdVal = decoded.id;
            } catch {}
        }

        const result = await pool.query(
            `INSERT INTO inquiries (bike_id, customer_name, customer_phone, message, user_id, status)
             VALUES ($1, $2, $3, $4, $5, 'new')
             RETURNING *`,
            [bike_id || null, customer_name, customer_phone, message || "", userIdVal]
        );

        res.status(201).json({ success: true, inquiry: result.rows[0] });
    } catch (error) {
        console.error("Create inquiry error:", error);
        res.status(500).json({ success: false, message: "Failed to send inquiry" });
    }
});

// GET /api/inquiries — list all inquiries (admin/owner)
router.get("/", requireAuth, requireRole("owner", "admin"), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT i.*, b.brand, b.model,
                   (SELECT COUNT(*) FROM inquiry_messages m WHERE m.inquiry_id = i.id) AS message_count,
                   (SELECT m.created_at FROM inquiry_messages m WHERE m.inquiry_id = i.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at
            FROM inquiries i
            LEFT JOIN bikes b ON i.bike_id = b.id
            ORDER BY i.created_at DESC
        `);
        res.json({ success: true, inquiries: result.rows });
    } catch (error) {
        console.error("List inquiries error:", error);
        res.status(500).json({ success: false, message: "Failed to list inquiries" });
    }
});

// GET /api/inquiries/:id — get inquiry + messages (admin/owner)
router.get("/:id", requireAuth, requireRole("owner", "admin"), async (req, res) => {
    try {
        const { id } = req.params;

        const inquiryResult = await pool.query(`
            SELECT i.*, b.brand, b.model
            FROM inquiries i
            LEFT JOIN bikes b ON i.bike_id = b.id
            WHERE i.id = $1
        `, [id]);

        if (inquiryResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Inquiry not found" });
        }

        const messages = await pool.query(
            "SELECT * FROM inquiry_messages WHERE inquiry_id = $1 ORDER BY created_at ASC",
            [id]
        );

        res.json({
            success: true,
            inquiry: inquiryResult.rows[0],
            messages: messages.rows
        });
    } catch (error) {
        console.error("Get inquiry error:", error);
        res.status(500).json({ success: false, message: "Failed to get inquiry" });
    }
});

// POST /api/inquiries/:id/messages — send reply (admin/owner)
router.post("/:id/messages", requireAuth, requireRole("owner", "admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const inquiry = await pool.query("SELECT id FROM inquiries WHERE id = $1", [id]);
        if (inquiry.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Inquiry not found" });
        }

        const result = await pool.query(
            `INSERT INTO inquiry_messages (inquiry_id, sender, message)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, "admin", message.trim()]
        );

        try {
            await pool.query(
                "UPDATE inquiries SET updated_at = CURRENT_TIMESTAMP, status = 'replied' WHERE id = $1",
                [id]
            );
        } catch (updateErr) {
            console.error("Update inquiry status error:", updateErr);
        }

        res.status(201).json({ success: true, msg: result.rows[0] });
    } catch (error) {
        console.error("Send message error:", error.message);
        res.status(500).json({ success: false, message: "Failed to send message: " + error.message });
    }
});

// PUT /api/inquiries/:id/status — update status (admin/owner)
router.put("/:id/status", requireAuth, requireRole("owner", "admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = ["new", "replied", "closed"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        await pool.query(
            "UPDATE inquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [status, id]
        );

        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
});

export default router;
