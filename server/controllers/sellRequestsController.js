import pool from "../db/index.js";

const isValidId = (id) => /^\d+$/.test(id);

// POST /api/sell-requests — public submission
export const createSellRequest = async (req, res) => {
    try {
        const {
            seller_name,
            seller_phone,
            seller_email,
            brand,
            model,
            model_year,
            expected_price,
            color,
            engine_cc,
            registration_city,
            condition,
            description,
        } = req.body;

        if (!seller_name || !seller_phone || !brand || !model || !model_year || !expected_price || !condition) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            });
        }

        let userIdVal = null;
        const header = req.headers.authorization;
        if (header && header.startsWith("Bearer ")) {
            try {
                const jwt = await import("jsonwebtoken");
                const decoded = jwt.default.verify(header.split(" ")[1], process.env.JWT_SECRET);
                userIdVal = decoded.id;
            } catch {}
        }

        const imageUrls = (req.files || []).map((f) => `/uploads/${f.filename}`);

        const result = await pool.query(
            `INSERT INTO sell_requests
                (seller_name, seller_phone, seller_email, user_id, brand, model, model_year, expected_price, color, engine_cc, registration_city, condition, description, bike_images)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             RETURNING *`,
            [
                seller_name,
                seller_phone,
                seller_email || null,
                userIdVal,
                brand,
                model,
                model_year,
                expected_price,
                color || null,
                engine_cc || null,
                registration_city || null,
                condition,
                description || null,
                imageUrls.length > 0 ? imageUrls : null,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Your sell request has been submitted successfully. We will review it shortly.",
            sellRequest: result.rows[0],
        });
    } catch (error) {
        console.error("Create sell request error:", error);
        res.status(500).json({ success: false, message: "Failed to submit sell request" });
    }
};

// GET /api/sell-requests — admin/owner list all
export const getSellRequests = async (req, res) => {
    try {
        const { status } = req.query;

        let query = "SELECT * FROM sell_requests";
        const params = [];

        if (status && ["pending", "accepted", "rejected"].includes(status)) {
            query += " WHERE status = $1";
            params.push(status);
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, params);

        const countsResult = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'pending') AS pending,
                COUNT(*) FILTER (WHERE status = 'accepted') AS accepted,
                COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
            FROM sell_requests
        `);

        res.json({
            success: true,
            sellRequests: result.rows,
            counts: countsResult.rows[0],
        });
    } catch (error) {
        console.error("Get sell requests error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch sell requests" });
    }
};

// GET /api/sell-requests/:id — admin/owner get details
export const getSellRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const result = await pool.query("SELECT * FROM sell_requests WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Sell request not found" });
        }

        res.json({ success: true, sellRequest: result.rows[0] });
    } catch (error) {
        console.error("Get sell request error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch sell request" });
    }
};

// PUT /api/sell-requests/:id/status — admin/owner accept or reject
export const updateSellRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_note } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'" });
        }

        const result = await pool.query(
            `UPDATE sell_requests
             SET status = $1, admin_note = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [status, admin_note || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Sell request not found" });
        }

        res.json({
            success: true,
            message: `Sell request ${status}`,
            sellRequest: result.rows[0],
        });
    } catch (error) {
        console.error("Update sell request status error:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};

// POST /api/sell-requests/:id/convert — admin/owner accept → create bike in inventory
export const convertToBike = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { selling_price, admin_note } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        await client.query("BEGIN");

        const srResult = await client.query(
            "SELECT * FROM sell_requests WHERE id = $1 FOR UPDATE",
            [id]
        );

        if (srResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Sell request not found" });
        }

        const sr = srResult.rows[0];

        if (sr.status === "accepted") {
            await client.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Sell request already converted" });
        }

        const price = selling_price || sr.expected_price;

        const bikeResult = await client.query(
            `INSERT INTO bikes (brand, model, model_year, selling_price, color, engine_cc, registration_city, condition, description, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             RETURNING *`,
            [sr.brand, sr.model, sr.model_year, price, sr.color, sr.engine_cc, sr.registration_city, sr.condition, sr.description, req.user.id]
        );

        const newBikeId = bikeResult.rows[0].id;

        if (sr.bike_images && sr.bike_images.length > 0) {
            for (let i = 0; i < sr.bike_images.length; i++) {
                await client.query(
                    `INSERT INTO bike_images (bike_id, image_url, is_cover, sort_order)
                     VALUES ($1, $2, $3, $4)`,
                    [newBikeId, sr.bike_images[i], i === 0, i]
                );
            }
        }

        await client.query(
            `UPDATE sell_requests
             SET status = 'accepted', admin_note = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [admin_note || `Converted to bike #${bikeResult.rows[0].id}`, id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Bike added to inventory successfully",
            bike: bikeResult.rows[0],
            sellRequest: { ...sr, status: "accepted", admin_note: admin_note || `Converted to bike #${bikeResult.rows[0].id}` },
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Convert sell request error:", error);
        res.status(500).json({ success: false, message: "Failed to convert sell request" });
    } finally {
        client.release();
    }
};

// DELETE /api/sell-requests/:id — owner only
export const deleteSellRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        const result = await pool.query("DELETE FROM sell_requests WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Sell request not found" });
        }

        res.json({ success: true, message: "Sell request deleted" });
    } catch (error) {
        console.error("Delete sell request error:", error);
        res.status(500).json({ success: false, message: "Failed to delete sell request" });
    }
};
