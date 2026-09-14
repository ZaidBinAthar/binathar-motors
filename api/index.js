import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import pool from "../server/db/index.js";
import authRoutes from "../server/routes/authRoutes.js";
import bikesRoutes from "../server/routes/bikesRoutes.js";
import inquiryRoutes from "../server/routes/inquiryRoutes.js";
import reportRoutes from "../server/routes/reportRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));
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

const distPath = path.join(__dirname, "../client/dist");
const indexHtml = fs.existsSync(path.join(distPath, "index.html"))
    ? fs.readFileSync(path.join(distPath, "index.html"))
    : null;

app.use((req, res) => {
    if (indexHtml) {
        res.setHeader("Content-Type", "text/html");
        res.send(indexHtml);
    } else {
        res.status(404).json({ success: false, message: "Not found" });
    }
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
