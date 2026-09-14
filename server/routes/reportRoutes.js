import express from "express";
import pool from "../db/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("owner"), async (req, res) => {
    try {
        const [overview, monthlySales, brandPerformance, inquiryStats, recentSales] = await Promise.all([
            pool.query(`
                SELECT
                    (SELECT COUNT(*) FROM bikes) AS total_bikes,
                    (SELECT COUNT(*) FROM bikes WHERE status = 'available') AS available_bikes,
                    (SELECT COUNT(*) FROM bikes WHERE status = 'sold') AS sold_bikes,
                    (SELECT COALESCE(SUM(sale_price), 0) FROM sales) AS total_revenue,
                    (SELECT COALESCE(SUM(sale_price - purchase_price), 0) FROM sales) AS total_profit,
                    (SELECT COALESCE(AVG(sale_price - purchase_price), 0) FROM sales) AS avg_profit,
                    (SELECT COUNT(*) FROM sales) AS total_sales,
                    (SELECT COUNT(*) FROM users) AS total_users,
                    (SELECT COUNT(*) FROM inquiries) AS total_inquiries,
                    (SELECT COUNT(*) FROM inquiries WHERE status = 'new') AS new_inquiries,
                    (SELECT COUNT(*) FROM inquiries WHERE status = 'contacted') AS contacted_inquiries,
                    (SELECT COUNT(*) FROM inquiries WHERE status = 'closed') AS closed_inquiries
            `),
            pool.query(`
                SELECT
                    TO_CHAR(sale_date, 'YYYY-MM') AS month,
                    COUNT(*) AS sales_count,
                    COALESCE(SUM(sale_price), 0) AS revenue,
                    COALESCE(SUM(sale_price - purchase_price), 0) AS profit
                FROM sales
                WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
                GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
                ORDER BY month ASC
            `),
            pool.query(`
                SELECT
                    b.brand,
                    COUNT(DISTINCT b.id) AS total_bikes,
                    COUNT(DISTINCT CASE WHEN b.status = 'sold' THEN b.id END) AS sold_bikes,
                    COUNT(DISTINCT CASE WHEN b.status = 'available' THEN b.id END) AS available_bikes,
                    COALESCE(SUM(CASE WHEN b.status = 'sold' THEN s.sale_price ELSE 0 END), 0) AS revenue,
                    COALESCE(SUM(CASE WHEN b.status = 'sold' THEN s.sale_price - s.purchase_price ELSE 0 END), 0) AS profit
                FROM bikes b
                LEFT JOIN sales s ON s.bike_id = b.id
                GROUP BY b.brand
                ORDER BY revenue DESC
            `),
            pool.query(`
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'new') AS new,
                    COUNT(*) FILTER (WHERE status = 'contacted') AS contacted,
                    COUNT(*) FILTER (WHERE status = 'closed') AS closed,
                    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS this_month,
                    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS this_week
                FROM inquiries
            `),
            pool.query(`
                SELECT s.id, s.sale_price, s.purchase_price, s.sale_date,
                       s.customer_name, s.customer_phone,
                       b.brand, b.model, b.model_year
                FROM sales s
                JOIN bikes b ON b.id = s.bike_id
                ORDER BY s.sale_date DESC
                LIMIT 10
            `)
        ]);

        res.json({
            success: true,
            data: {
                overview: overview.rows[0],
                monthlySales: monthlySales.rows,
                brandPerformance: brandPerformance.rows,
                inquiryStats: inquiryStats.rows[0],
                recentSales: recentSales.rows
            }
        });
    } catch (error) {
        console.error("Reports error:", error);
        res.status(500).json({ success: false, message: "Failed to generate reports" });
    }
});

export default router;
