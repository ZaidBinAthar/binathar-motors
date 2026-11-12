import fs from "fs";
import path from "path";
import pool from "../db/index.js";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { fileURLToPath } from "url";

// ==========================================
// DIRECTORY CONFIGURATION
// ==========================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// ==========================================
// NEON OBJECT STORAGE CONFIGURATION
// ==========================================

const STORAGE_ENDPOINT = (process.env.NEON_STORAGE_ENDPOINT || "")
    .trim()
    .replace(/\/+$/, "");

const STORAGE_REGION = (
    process.env.NEON_STORAGE_REGION || "ap-southeast-1"
).trim();

const BUCKET = (process.env.NEON_STORAGE_BUCKET || "").trim();

const ACCESS_KEY = process.env.NEON_STORAGE_ACCESS_KEY;
const SECRET_KEY = process.env.NEON_STORAGE_SECRET_KEY;

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const STORAGE_ENABLED = Boolean(
    STORAGE_ENDPOINT &&
    BUCKET &&
    ACCESS_KEY &&
    SECRET_KEY
);

// Validate endpoint without exposing credentials
if (STORAGE_ENABLED) {
    try {
        const endpointUrl = new URL(STORAGE_ENDPOINT);

        if (!["https:", "http:"].includes(endpointUrl.protocol)) {
            throw new Error("Invalid storage endpoint protocol");
        }
    } catch (error) {
        console.error("Invalid Neon Storage endpoint configuration:", error.message);
    }
}

// ==========================================
// S3 CLIENT
// ==========================================

const s3 = STORAGE_ENABLED
    ? new S3Client({
        endpoint: STORAGE_ENDPOINT,
        region: STORAGE_REGION,

        credentials: {
            accessKeyId: ACCESS_KEY,
            secretAccessKey: SECRET_KEY,
        },

        forcePathStyle: true,

        requestChecksumCalculation: "WHEN_REQUIRED",
    })
    : null;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function publicObjectUrl(filename) {
    return `${STORAGE_ENDPOINT}/${BUCKET}/${filename}`;
}

function generateFilename(originalname) {
    const ext = path.extname(originalname).toLowerCase() || ".jpg";

    return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

// ==========================================
// POST /api/bikes/:id/images
// UPLOAD BIKE IMAGES
// ==========================================

export const uploadImages = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate bike ID
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bike ID",
            });
        }

        // Check bike existence
        const bike = await pool.query(
            "SELECT id FROM bikes WHERE id = $1",
            [id]
        );

        if (bike.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bike not found",
            });
        }

        // Check uploaded files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images provided",
            });
        }

        // Check storage configuration
        if (!STORAGE_ENABLED && IS_PRODUCTION) {
            return res.status(500).json({
                success: false,
                message: "Image storage is not configured correctly.",
            });
        }

        // Existing image count
        const existing = await pool.query(
            "SELECT COUNT(*) FROM bike_images WHERE bike_id = $1",
            [id]
        );

        let sortOrder = parseInt(existing.rows[0].count, 10);

        const inserted = [];

        // ======================================
        // PROCESS EACH IMAGE
        // ======================================

        for (const file of req.files) {
            const filename = generateFilename(file.originalname);

            const isCover = sortOrder === 0;

            let imageUrl = null;

            // ==================================
            // PRIMARY: NEON OBJECT STORAGE
            // ==================================

            if (STORAGE_ENABLED) {
                try {
                    await s3.send(
                        new PutObjectCommand({
                            Bucket: BUCKET,
                            Key: filename,
                            Body: file.buffer,
                            ContentType: file.mimetype || "image/jpeg",
                        })
                    );

                    imageUrl = publicObjectUrl(filename);

                    console.log("Image uploaded successfully to Neon Storage");

                } catch (s3Err) {
                    console.error("========== NEON STORAGE ERROR ==========");
                    console.error("Name:", s3Err.name);
                    console.error("Message:", s3Err.message);
                    console.error("Code:", s3Err.Code || s3Err.code);
                    console.error("HTTP Status:", s3Err.$metadata?.httpStatusCode);
                    console.error("Request ID:", s3Err.$metadata?.requestId);
                    console.error("Stack:", s3Err.stack);
                    console.error("========================================");

                    if (IS_PRODUCTION) {
                        throw s3Err;
                    }
                }
            }

            // ==================================
            // FALLBACK: LOCAL DEVELOPMENT ONLY
            // ==================================

            if (!imageUrl) {
                if (IS_PRODUCTION) {
                    throw new Error(
                        "Image storage is unavailable in production."
                    );
                }

                fs.mkdirSync(UPLOADS_DIR, {
                    recursive: true,
                });

                fs.writeFileSync(
                    path.join(UPLOADS_DIR, filename),
                    file.buffer
                );

                imageUrl = `/uploads/${filename}`;

                console.log("Image saved to local uploads directory");
            }

            // ==================================
            // SAVE IMAGE URL IN DATABASE
            // ==================================

            const result = await pool.query(
                `INSERT INTO bike_images
                (bike_id, image_url, is_cover, sort_order)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [id, imageUrl, isCover, sortOrder]
            );

            inserted.push(result.rows[0]);

            sortOrder++;
        }

        return res.status(201).json({
            success: true,
            message: "Images uploaded successfully",
            images: inserted,
        });

    } catch (error) {
        console.error("FINAL IMAGE UPLOAD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload images. Please try again.",
        });
    }
};

// ==========================================
// DELETE IMAGE
// DELETE /api/bikes/:bikeId/images/:imageId
// ==========================================

export const deleteImage = async (req, res) => {
    try {
        const { bikeId, imageId } = req.params;

        const result = await pool.query(
            `DELETE FROM bike_images
             WHERE id = $1 AND bike_id = $2
             RETURNING *`,
            [imageId, bikeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        const deleted = result.rows[0];

        // ==================================
        // DELETE FROM NEON OBJECT STORAGE
        // ==================================

        const storagePrefix = `${STORAGE_ENDPOINT}/${BUCKET}/`;

        if (
            STORAGE_ENABLED &&
            deleted.image_url?.startsWith(storagePrefix)
        ) {
            try {
                const key = deleted.image_url.slice(
                    storagePrefix.length
                );

                await s3.send(
                    new DeleteObjectCommand({
                        Bucket: BUCKET,
                        Key: decodeURIComponent(key),
                    })
                );

            } catch (s3Err) {
                console.error("Neon Storage delete failed:", {
                    name: s3Err.name,
                    message: s3Err.message,
                });
            }
        }

        // ==================================
        // REORDER REMAINING IMAGES
        // ==================================

        const remaining = await pool.query(
            `SELECT id FROM bike_images
             WHERE bike_id = $1
             ORDER BY sort_order ASC`,
            [bikeId]
        );

        for (let i = 0; i < remaining.rows.length; i++) {
            await pool.query(
                `UPDATE bike_images
                 SET sort_order = $1, is_cover = $2
                 WHERE id = $3`,
                [i, i === 0, remaining.rows[i].id]
            );
        }

        return res.json({
            success: true,
            message: "Image deleted successfully",
        });

    } catch (error) {
        console.error("Delete image error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete image",
        });
    }
};

// ==========================================
// SET COVER IMAGE
// PUT /api/bikes/:bikeId/images/:imageId/cover
// ==========================================

export const setCover = async (req, res) => {
    try {
        const { bikeId, imageId } = req.params;

        // Reset existing cover
        await pool.query(
            `UPDATE bike_images
             SET is_cover = false
             WHERE bike_id = $1`,
            [bikeId]
        );

        // Set new cover
        const result = await pool.query(
            `UPDATE bike_images
             SET is_cover = true
             WHERE id = $1 AND bike_id = $2
             RETURNING *`,
            [imageId, bikeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        return res.json({
            success: true,
            message: "Cover image updated successfully",
            image: result.rows[0],
        });

    } catch (error) {
        console.error("Set cover error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to set cover image",
        });
    }
};