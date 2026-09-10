import express from "express";
import cors from "cors";
import pool from "../server/db/index.js";
import authRoutes from "../server/routes/authRoutes.js";
import bikesRoutes from "../server/routes/bikesRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
        req.url = req.path.replace("/api", "");
    }
    next();
});

app.get("/test", async (req, res) => {
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

app.use("/auth", authRoutes);
app.use("/bikes", bikesRoutes);

app.use("/", (req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
