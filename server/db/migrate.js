import "dotenv/config";
import pool from "./index.js";

const migration = async () => {
    console.log("Running migration: update users table for email/password auth...");

    await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);

    await pool.query(`
        ALTER TABLE users
        DROP COLUMN IF EXISTS google_id
    `);

    console.log("Users table updated.");

    const bcrypt = await import("bcryptjs");

    const ownerEmail = "zaid@binatharmotors.com";
    const ownerPassword = "BinAthar@2024";

    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [ownerEmail]
    );

    const hash = await bcrypt.default.hash(ownerPassword, 10);

    if (existing.rows.length === 0) {
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role, status)
             VALUES ($1, $2, $3, 'owner', 'active')`,
            ["Zaid Bin Athar", ownerEmail, hash]
        );
        console.log(`Owner account created: ${ownerEmail}`);
    } else {
        await pool.query(
            "UPDATE users SET password_hash = $1, role = 'owner', status = 'active' WHERE email = $2",
            [hash, ownerEmail]
        );
        console.log(`Owner account updated: ${ownerEmail}`);
    }

    const columns = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
    `);
    console.log("Current users columns:", columns.rows.map(r => r.column_name).join(", "));

    process.exit(0);
};

migration().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
