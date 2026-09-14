import pool from "../db/index.js";

const isValidId = (id) => /^\d+$/.test(id);

// PUBLIC: Get approved reviews (homepage + bike detail)
export const getPublicReviews = async (req, res) => {
    try {
        const { bike_id, limit = 20 } = req.query;

        let query = `
            SELECT r.*, b.brand, b.model, b.model_year
            FROM reviews r
            LEFT JOIN bikes b ON r.bike_id = b.id
            WHERE r.status = 'approved'
        `;
        const params = [];

        if (bike_id && isValidId(bike_id)) {
            params.push(bike_id);
            query += ` AND r.bike_id = $${params.length}`;
        }

        query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);
        res.json({ success: true, reviews: result.rows });
    } catch (error) {
        console.error("Get public reviews error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

// PUBLIC: Get rating summary
export const getRatingSummary = async (req, res) => {
    try {
        const { bike_id } = req.query;

        let whereClause = "WHERE status = 'approved'";
        const params = [];

        if (bike_id && isValidId(bike_id)) {
            params.push(bike_id);
            whereClause += ` AND bike_id = $${params.length}`;
        }

        const statsResult = await pool.query(
            `SELECT
                COUNT(*)::int AS total_reviews,
                COALESCE(AVG(rating), 0)::numeric(3,1) AS avg_rating
             FROM reviews ${whereClause}`,
            params
        );

        const distResult = await pool.query(
            `SELECT rating, COUNT(*)::int AS count
             FROM reviews ${whereClause}
             GROUP BY rating
             ORDER BY rating DESC`,
            params
        );

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        distResult.rows.forEach((r) => { distribution[r.rating] = r.count; });

        res.json({
            success: true,
            summary: {
                total_reviews: statsResult.rows[0].total_reviews,
                avg_rating: Number(statsResult.rows[0].avg_rating),
                distribution,
            },
        });
    } catch (error) {
        console.error("Get rating summary error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch rating summary" });
    }
};

// PUBLIC: Submit a review (no auth required)
export const submitReview = async (req, res) => {
    try {
        const { customer_name, rating, review_text, bike_id } = req.body;

        if (!customer_name || !customer_name.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }
        if (!review_text || !review_text.trim()) {
            return res.status(400).json({ success: false, message: "Review text is required" });
        }
        if (review_text.trim().length < 10) {
            return res.status(400).json({ success: false, message: "Review must be at least 10 characters" });
        }
        if (bike_id && !isValidId(bike_id)) {
            return res.status(400).json({ success: false, message: "Invalid bike ID" });
        }

        // Check for duplicate submissions (same name + same bike within 24h)
        const dupCheck = await pool.query(
            `SELECT id FROM reviews
             WHERE LOWER(customer_name) = LOWER($1)
               AND created_at > NOW() - INTERVAL '24 hours'
               ${bike_id ? "AND bike_id = $2" : "AND bike_id IS NULL"}`,
            bike_id ? [customer_name.trim(), bike_id] : [customer_name.trim()]
        );

        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ success: false, message: "You have already submitted a review recently. Please try again later." });
        }

        const result = await pool.query(
            `INSERT INTO reviews (customer_name, rating, review_text, bike_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [customer_name.trim(), rating, review_text.trim(), bike_id || null]
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully! It will appear after moderation.",
            review: result.rows[0],
        });
    } catch (error) {
        console.error("Submit review error:", error);
        res.status(500).json({ success: false, message: "Failed to submit review" });
    }
};

// STAFF/ADMIN: Get all reviews (with status filter)
export const getAllReviews = async (req, res) => {
    try {
        const { status, bike_id } = req.query;

        let query = `
            SELECT r.*, b.brand, b.model, b.model_year
            FROM reviews r
            LEFT JOIN bikes b ON r.bike_id = b.id
            WHERE 1=1
        `;
        const params = [];

        if (status && ["pending", "approved", "rejected"].includes(status)) {
            params.push(status);
            query += ` AND r.status = $${params.length}`;
        }

        if (bike_id && isValidId(bike_id)) {
            params.push(bike_id);
            query += ` AND r.bike_id = $${params.length}`;
        }

        query += " ORDER BY r.created_at DESC";

        const result = await pool.query(query, params);

        // Get counts by status
        const countsResult = await pool.query(
            `SELECT status, COUNT(*)::int AS count FROM reviews GROUP BY status`
        );
        const counts = { pending: 0, approved: 0, rejected: 0 };
        countsResult.rows.forEach((r) => { counts[r.status] = r.count; });

        res.json({ success: true, reviews: result.rows, counts });
    } catch (error) {
        console.error("Get all reviews error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

// STAFF/ADMIN: Update review status (approve/reject)
export const updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid review ID" });
        }
        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const result = await pool.query(
            "UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.json({ success: true, review: result.rows[0] });
    } catch (error) {
        console.error("Update review status error:", error);
        res.status(500).json({ success: false, message: "Failed to update review" });
    }
};

// ADMIN: Delete review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid review ID" });
        }

        const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.json({ success: true, message: "Review deleted" });
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ success: false, message: "Failed to delete review" });
    }
};
