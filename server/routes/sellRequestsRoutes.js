import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
    createSellRequest,
    getSellRequests,
    getSellRequestById,
    updateSellRequestStatus,
    convertToBike,
    deleteSellRequest,
} from "../controllers/sellRequestsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "sell-" + uniqueSuffix + path.extname(file.originalname));
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

router.post("/", upload.array("images", 5), createSellRequest);
router.get("/", requireAuth, requireRole("owner", "admin"), getSellRequests);
router.get("/:id", requireAuth, requireRole("owner", "admin"), getSellRequestById);
router.put("/:id/status", requireAuth, requireRole("owner", "admin"), updateSellRequestStatus);
router.post("/:id/convert", requireAuth, requireRole("owner", "admin"), convertToBike);
router.delete("/:id", requireAuth, requireRole("owner"), deleteSellRequest);

export default router;
