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
import salesRoutes from "../server/routes/salesRoutes.js";
import aiRoutes from "../server/routes/aiRoutes.js";
import reviewsRoutes from "../server/routes/reviewsRoutes.js";
import sellRequestsRoutes from "../server/routes/sellRequestsRoutes.js";

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
app.use("/api/sales", salesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/sell-requests", sellRequestsRoutes);

const distPath = path.join(__dirname, "../client/dist");
const indexHtml = fs.existsSync(path.join(distPath, "index.html"))
    ? fs.readFileSync(path.join(distPath, "index.html"), "utf-8")
    : null;

const SITE_URL = "https://binathar-motors.vercel.app";

const defaultMeta = {
    title: "BinAthar Motors – Premium Used Motorcycles",
    description: "Buy and sell quality used motorcycles at BinAthar Motors. Browse our inventory of Honda, Yamaha, Suzuki and more.",
    image: `${SITE_URL}/logo.svg`,
    url: SITE_URL,
};

app.use((req, res) => {
    if (!indexHtml) {
        return res.status(404).json({ success: false, message: "Not found" });
    }

    const bikeMatch = req.path.match(/^\/bikes\/(\d+)$/);

    if (bikeMatch) {
        const bikeId = parseInt(bikeMatch[1], 10);
        pool.query(
            "SELECT brand, model, model_year, selling_price, cover_image, description FROM bikes WHERE id = $1",
            [bikeId]
        )
            .then(({ rows }) => {
                if (rows.length === 0) {
                    res.setHeader("Content-Type", "text/html");
                    return res.send(indexHtml);
                }

                const bike = rows[0];
                const title = `${bike.brand} ${bike.model} ${bike.model_year} – Rs. ${Number(bike.selling_price).toLocaleString()} | BinAthar Motors`;
                const description = bike.description || `Buy ${bike.brand} ${bike.model} ${bike.model_year} for Rs. ${Number(bike.selling_price).toLocaleString()} at BinAthar Motors.`;
                const image = bike.cover_image || defaultMeta.image;
                const url = `${SITE_URL}/bikes/${bikeId}`;

                const metaTags = `
    <meta property="og:title" content="${title.replace(/"/g, "&quot;")}" />
    <meta property="og:description" content="${description.replace(/"/g, "&quot;").replace(/\n/g, " ").slice(0, 200)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}" />
    <meta name="twitter:description" content="${description.replace(/"/g, "&quot;").replace(/\n/g, " ").slice(0, 200)}" />
    <meta name="twitter:image" content="${image}" />`;

                const html = indexHtml.replace("</head>", `${metaTags}\n</head>`);
                res.setHeader("Content-Type", "text/html");
                res.send(html);
            })
            .catch(() => {
                res.setHeader("Content-Type", "text/html");
                res.send(indexHtml);
            });
        return;
    }

    res.setHeader("Content-Type", "text/html");
    res.send(indexHtml);
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
