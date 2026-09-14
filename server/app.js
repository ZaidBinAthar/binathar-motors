import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db/index.js";
import authRoutes from "./routes/authRoutes.js";
import bikesRoutes from "./routes/bikesRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test API + Database
app.get("/api/test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "BinAthar Motors API and Neon database are connected!",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Auth routes
app.use("/api/auth", authRoutes);

// Bike routes (protected)
app.use("/api/bikes", bikesRoutes);

// Inquiry routes
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

export default app;