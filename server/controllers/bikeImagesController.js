import fs from "fs";
import path from "path";
import pool from "../db/index.js";

const UPLOADS_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "uploads");

// POST /api/bikes/:id/images
export const uploadImages = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ success: false, message: "Invalid bike ID" });
        }

        const bike = await pool.query("SELECT id FROM bikes WHERE id = $1", [id]);
        if (bike.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Bike not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No images provided" });
        }

        const existing = await pool.query(
            "SELECT COUNT(*) FROM bike_images WHERE bike_id = $1",
            [id]
        );
        let sortOrder = parseInt(existing.rows[0].count);

        const inserted = [];
        for (const file of req.files) {
            const imageUrl = `/uploads/${file.filename}`;
            const isCover = sortOrder === 0;

            const result = await pool.query(
                `INSERT INTO bike_images (bike_id, image_url, is_cover, sort_order)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [id, imageUrl, isCover, sortOrder]
            );
            inserted.push(result.rows[0]);
            sortOrder++;
        }

        res.status(201).json({ success: true, images: inserted });
    } catch (error) {
        console.error("Upload images error:", error);
        res.status(500).json({ success: false, message: "Failed to upload images" });
    }
};

// DELETE /api/bikes/:bikeId/images/:imageId
export const deleteImage = async (req, res) => {
    try {
        const { bikeId, imageId } = req.params;

        const result = await pool.query(
            "DELETE FROM bike_images WHERE id = $1 AND bike_id = $2 RETURNING *",
            [imageId, bikeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Image not found" });
        }

        const imagePath = path.join(UPLOADS_DIR, path.basename(result.rows[0].image_url));
        fs.unlink(imagePath, () => {});

        const remaining = await pool.query(
            "SELECT id FROM bike_images WHERE bike_id = $1 ORDER BY sort_order ASC",
            [bikeId]
        );

        for (let i = 0; i < remaining.rows.length; i++) {
            await pool.query(
                "UPDATE bike_images SET sort_order = $1, is_cover = $2 WHERE id = $3",
                [i, i === 0, remaining.rows[i].id]
            );
        }

        res.json({ success: true, message: "Image deleted" });
    } catch (error) {
        console.error("Delete image error:", error);
        res.status(500).json({ success: false, message: "Failed to delete image" });
    }
};

// PUT /api/bikes/:bikeId/images/:imageId/cover
export const setCover = async (req, res) => {
    try {
        const { bikeId, imageId } = req.params;

        await pool.query(
            "UPDATE bike_images SET is_cover = false WHERE bike_id = $1",
            [bikeId]
        );

        const result = await pool.query(
            "UPDATE bike_images SET is_cover = true WHERE id = $1 AND bike_id = $2 RETURNING *",
            [imageId, bikeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Image not found" });
        }

        res.json({ success: true, image: result.rows[0] });
    } catch (error) {
        console.error("Set cover error:", error);
        res.status(500).json({ success: false, message: "Failed to set cover" });
    }
};
