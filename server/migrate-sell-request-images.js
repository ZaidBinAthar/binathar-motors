import "dotenv/config";
import pool from "./db/index.js";

const migrate = async () => {
    try {
        await pool.query(`
            ALTER TABLE sell_requests
            ADD COLUMN IF NOT EXISTS bike_images TEXT[] DEFAULT '{}';
        `);

        console.log("sell_requests.bike_images column added successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        pool.end();
    }
};

migrate();
