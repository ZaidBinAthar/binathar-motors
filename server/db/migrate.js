import "dotenv/config";
import pool from "./index.js";

const migration = async () => {
    console.log("Running migration: add password_hash to users...");

    await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);

    console.log("Migration complete.");

    const bcrypt = await import("bcryptjs");

    const ownerEmail = "zaid@binatharmotors.com";
    const ownerPassword = "BinAthar@2024";

    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [ownerEmail]
    );

    if (existing.rows.length === 0) {
        const hash = await bcrypt.default.hash(ownerPassword, 10);
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role, status)
             VALUES ($1, $2, $3, 'owner', 'active')`,
            ["Zaid Bin Athar", ownerEmail, hash]
        );
        console.log(`Owner account created: ${ownerEmail}`);
    } else {
        const hash = await bcrypt.default.hash(ownerPassword, 10);
        await pool.query(
            "UPDATE users SET password_hash = $1, role = 'owner', status = 'active' WHERE email = $2",
            [hash, ownerEmail]
        );
        console.log(`Owner account updated: ${ownerEmail}`);
    }

    process.exit(0);
};

migration().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
