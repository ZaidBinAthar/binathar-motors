import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import {
    getBikes,
    getBikeById,
    createBike,
    updateBike,
    deleteBike
} from "../controllers/bikesController.js";
import {
    uploadImages,
    deleteImage,
    setCover
} from "../controllers/bikeImagesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const storage = multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(null, ext && mime);
    }
});

const router = express.Router();

router.get("/", getBikes);
router.get("/:id", getBikeById);

router.post("/", requireAuth, requireRole("owner", "admin"), createBike);
router.put("/:id", requireAuth, requireRole("owner", "admin"), updateBike);
router.delete("/:id", requireAuth, requireRole("owner"), deleteBike);

router.post("/:id/images", requireAuth, requireRole("owner", "admin"), upload.array("images", 10), uploadImages);
router.put("/:bikeId/images/:imageId/cover", requireAuth, requireRole("owner", "admin"), setCover);
router.delete("/:bikeId/images/:imageId", requireAuth, requireRole("owner", "admin"), deleteImage);

export default router;
