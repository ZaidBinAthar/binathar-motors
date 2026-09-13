import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../server/db/index.js";
import authRoutes from "../server/routes/authRoutes.js";
import bikesRoutes from "../server/routes/bikesRoutes.js";
import inquiryRoutes from "../server/routes/inquiryRoutes.js";

import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

const distPath = path.join(__dirname, "../client/dist");
const staticPath = path.join(__dirname, "../client/dist");
console.log("distPath:", distPath);
console.log("distPath exists:", fs.existsSync(distPath));
if (fs.existsSync(distPath)) {
    console.log("dist contents:", fs.readdirSync(distPath));
}

app.use(express.static(staticPath));
app.use("/uploads", express.static(path.join(__dirname, "../server/uploads")));

app.get("/api/test", async (req, res) => {
    try {
        const distExists = fs.existsSync(distPath);
        const distFiles = distExists ? fs.readdirSync(distPath) : [];
        const assetsPath = path.join(distPath, "assets");
        const assetsExist = fs.existsSync(assetsPath);
        const assetsFiles = assetsExist ? fs.readdirSync(assetsPath) : [];
        const result = await pool.query("SELECT NOW()");
        res.json({
            success: true,
            message: "BinAthar Motors API connected!",
            databaseTime: result.rows[0].now,
            distPath,
            distExists,
            distFiles,
            assetsFiles
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ success: false, message: "Database connection failed" });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikesRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
