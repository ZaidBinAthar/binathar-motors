import pool from "../db/index.js";

const isValidId = (id) => /^\d+$/.test(id);

// GET all bikes
export const getBikes = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        b.*,
        (
          SELECT image_url
          FROM bike_images
          WHERE bike_id = b.id
            AND is_cover = true
          LIMIT 1
        ) AS cover_image
      FROM bikes b
      ORDER BY b.created_at DESC
    `);

        res.json({
            success: true,
            bikes: result.rows
        });
    } catch (error) {
        console.error("Get bikes error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bikes"
        });
    }
};


// GET single bike
export const getBikeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bike ID"
            });
        }

        const bikeResult = await pool.query(
            `
      SELECT *
      FROM bikes
      WHERE id = $1
      `,
            [id]
        );

        if (bikeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        const imagesResult = await pool.query(
            `
      SELECT *
      FROM bike_images
      WHERE bike_id = $1
      ORDER BY sort_order ASC, id ASC
      `,
            [id]
        );

        res.json({
            success: true,
            bike: bikeResult.rows[0],
            images: imagesResult.rows
        });
    } catch (error) {
        console.error("Get bike error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bike"
        });
    }
};


// ADD bike
export const createBike = async (req, res) => {
    try {
        const {
            brand,
            model,
            model_year,
            selling_price,
            color,
            engine_cc,
            registration_city,
            condition,
            description
        } = req.body;

        if (
            !brand ||
            !model ||
            !model_year ||
            !selling_price ||
            !condition
        ) {
            return res.status(400).json({
                success: false,
                message: "Required bike information is missing"
            });
        }

        const result = await pool.query(
            `
      INSERT INTO bikes (
        brand,
        model,
        model_year,
        selling_price,
        color,
        engine_cc,
        registration_city,
        condition,
        description,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
            [
                brand,
                model,
                model_year,
                selling_price,
                color,
                engine_cc,
                registration_city,
                condition,
                description,
                req.user.id
            ]
        );

        res.status(201).json({
            success: true,
            message: "Bike added successfully",
            bike: result.rows[0]
        });
    } catch (error) {
        console.error("Create bike error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add bike"
        });
    }
};


// UPDATE bike — only overwrites fields that are actually provided
export const updateBike = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bike ID"
            });
        }

        const allowedFields = [
            "brand",
            "model",
            "model_year",
            "selling_price",
            "color",
            "engine_cc",
            "registration_city",
            "condition",
            "description",
            "status"
        ];

        const updates = [];
        const values = [];
        let paramIndex = 1;

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = $${paramIndex}`);
                values.push(req.body[field]);
                paramIndex++;
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        updates.push(`updated_by = $${paramIndex}`);
        values.push(req.user.id);
        paramIndex++;

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        values.push(id);

        const result = await pool.query(
            `
      UPDATE bikes
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
      `,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        res.json({
            success: true,
            message: "Bike updated successfully",
            bike: result.rows[0]
        });
    } catch (error) {
        console.error("Update bike error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update bike"
        });
    }
};


// DELETE bike
export const deleteBike = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bike ID"
            });
        }

        const checkSales = await pool.query(
            `SELECT id FROM sales WHERE bike_id = $1 LIMIT 1`,
            [id]
        );

        if (checkSales.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete bike with existing sales records"
            });
        }

        const result = await pool.query(
            `
      DELETE FROM bikes
      WHERE id = $1
      RETURNING *
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        res.json({
            success: true,
            message: "Bike deleted successfully",
            bike: result.rows[0]
        });
    } catch (error) {
        console.error("Delete bike error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete bike"
        });
    }
};
