import "dotenv/config";
import pool from "./index.js";

const migration = async () => {
    console.log("Running migration: inquiries chat system + auth cleanup...");

    // Add user_id to inquiries (nullable for anonymous users)
    await pool.query(`
        ALTER TABLE inquiries
        ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL
    `);

    // Add updated_at to inquiries
    await pool.query(`
        ALTER TABLE inquiries
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Create inquiry_messages table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS inquiry_messages (
            id           SERIAL    PRIMARY KEY,
            inquiry_id   INT       NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
            sender       VARCHAR(20) NOT NULL,
            message      TEXT      NOT NULL,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Index for faster lookups
    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry
        ON inquiry_messages(inquiry_id)
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_inquiries_user
        ON inquiries(user_id)
    `);

    console.log("Migration complete.");

    const tables = await pool.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log("Tables:", tables.rows.map(r => r.table_name).join(", "));

    const inquiryCols = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'inquiries' ORDER BY ordinal_position
    `);
    console.log("Inquiries columns:", inquiryCols.rows.map(r => r.column_name).join(", "));

    const msgCols = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'inquiry_messages' ORDER BY ordinal_position
    `);
    console.log("Inquiry_messages columns:", msgCols.rows.map(r => r.column_name).join(", "));

    process.exit(0);
};

migration().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
