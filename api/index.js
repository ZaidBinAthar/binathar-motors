import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../server/db/index.js";
import authRoutes from "../server/routes/authRoutes.js";
import bikesRoutes from "../server/routes/bikesRoutes.js";
import inquiryRoutes from "../server/routes/inquiryRoutes.js";
import reportRoutes from "../server/routes/reportRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "../client/dist")));
app.use("/uploads", express.static(path.join(__dirname, "../server/uploads")));

app.get("/api/test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            success: true,
            message: "BinAthar Motors API connected!",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ success: false, message: "Database connection failed" });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikesRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
