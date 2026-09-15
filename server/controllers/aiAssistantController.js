import pool from "../db/index.js";
import { processQuestion, SUGGESTED_QUESTIONS } from "../services/aiService.js";

// ─── Rate Limiting (in-memory) ───────────────────────────────────

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per window
const rateLimitMap = new Map();

function checkRateLimit(userId) {
    const now = Date.now();
    const userRecord = rateLimitMap.get(userId);

    if (!userRecord || now - userRecord.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(userId, { windowStart: now, count: 1 });
        return true;
    }

    userRecord.count++;
    if (userRecord.count > RATE_LIMIT_MAX) {
        return false;
    }
    return true;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [userId, record] of rateLimitMap) {
        if (now - record.windowStart > RATE_LIMIT_WINDOW * 2) {
            rateLimitMap.delete(userId);
        }
    }
}, 5 * 60 * 1000);

// ─── Audit Log (in-memory, lightweight) ──────────────────────────

const auditLog = [];
const MAX_AUDIT_LOG = 500;

function logAudit(userId, username, role, question, status, responseStatus) {
    auditLog.push({
        userId,
        username,
        role,
        question: question.slice(0, 200),
        status,
        responseStatus,
        timestamp: new Date().toISOString(),
    });
    if (auditLog.length > MAX_AUDIT_LOG) {
        auditLog.shift();
    }
}

// ─── Controller ──────────────────────────────────────────────────

export const chat = async (req, res) => {
    try {
        const { question, context } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, message: "Question is required" });
        }

        // Rate limit
        if (!checkRateLimit(req.user.id)) {
            logAudit(req.user.id, req.user.username, req.user.role, question, "rate_limited", 429);
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please wait a moment before asking again.",
            });
        }

        // Sanitize question (strip potential injection)
        const sanitizedQuestion = question.trim().slice(0, 500);

        // Process
        const result = await processQuestion(sanitizedQuestion, context || {});

        logAudit(req.user.id, req.user.username, req.user.role, sanitizedQuestion, "success", 200);

        res.json({
            success: true,
            answer: result.text,
            data: result.data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("AI Assistant error:", error);
        logAudit(req.user.id, req.user.username, req.user.role, req.body?.question || "", "error", 500);
        res.status(500).json({
            success: false,
            message: "I couldn't access the dealership data right now. Please try again.",
        });
    }
};

export const getSuggestions = async (_req, res) => {
    res.json({ success: true, suggestions: SUGGESTED_QUESTIONS });
};

export const getAuditLog = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ success: false, message: "Only owners can view audit logs" });
        }
        res.json({ success: true, logs: auditLog.slice(-100).reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch audit log" });
    }
};
