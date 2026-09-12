import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();
const SALT_ROUNDS = 10;

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, status)
             VALUES ($1, $2, $3, 'user', 'active')
             RETURNING id, name, email, role, status`,
            [name, email, password_hash]
        );

        const user = result.rows[0];
        const token = generateToken(user);
        res.status(201).json({ success: true, token, user });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = result.rows[0];

        if (user.status === "disabled") {
            return res.status(403).json({ success: false, message: "Your account has been disabled" });
        }

        if (!user.password_hash) {
            return res.status(400).json({ success: false, message: "No password set for this account" });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

        const token = generateToken(user);
        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
    res.json({ success: true, user: req.user });
});

// PUT /api/auth/change-password (any logged-in user)
router.put("/change-password", requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
        const user = result.rows[0];

        if (!user.password_hash) {
            return res.status(400).json({ success: false, message: "No password set for this account" });
        }

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, req.user.id]);

        res.json({ success: true, message: "Password updated" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Failed to change password" });
    }
});

// POST /api/auth/users (owner only — create user)
router.post("/users", requireAuth, requireRole("owner"), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const userRole = ["owner", "admin", "staff", "user"].includes(role) ? role : "staff";

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, status)
             VALUES ($1, $2, $3, $4, 'active')
             RETURNING id, name, email, role, status, created_at`,
            [name, email, hash, userRole]
        );

        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ success: false, message: "Failed to create user" });
    }
});

// GET /api/auth/users (owner only)
router.get("/users", requireAuth, requireRole("owner"), async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, role, status, last_login, created_at FROM users ORDER BY created_at DESC"
        );
        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ success: false, message: "Failed to list users" });
    }
});

// PUT /api/auth/users/:id (owner only — update role/status)
router.put("/users/:id", requireAuth, requireRole("owner"), async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status } = req.body;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot change your own role/status" });
        }

        const allowedRoles = ["owner", "admin", "staff", "user"];
        const allowedStatuses = ["active", "disabled"];

        const updates = [];
        const values = [];
        let idx = 1;

        if (role && allowedRoles.includes(role)) {
            updates.push(`role = $${idx++}`);
            values.push(role);
        }
        if (status && allowedStatuses.includes(status)) {
            updates.push(`status = $${idx++}`);
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: "No valid updates provided" });
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx}
             RETURNING id, name, email, role, status, last_login, created_at`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
});

// PUT /api/auth/users/:id/password (owner only — reset any user's password)
router.put("/users/:id/password", requireAuth, requireRole("owner"), async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const result = await pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email",
            [hash, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: `Password reset for ${result.rows[0].name}` });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Failed to reset password" });
    }
});

// DELETE /api/auth/users/:id (owner only)
router.delete("/users/:id", requireAuth, requireRole("owner"), async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ success: false, message: "Cannot delete your own account" });
        }

        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
});

export default router;
