import "dotenv/config";
import pool from "./db/index.js";

const migrate = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sell_requests (
                id SERIAL PRIMARY KEY,
                seller_name VARCHAR(150) NOT NULL,
                seller_phone VARCHAR(20) NOT NULL,
                seller_email VARCHAR(150),
                user_id INT REFERENCES users(id) ON DELETE SET NULL,
                brand VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                model_year INT NOT NULL,
                expected_price NUMERIC NOT NULL,
                color VARCHAR(50),
                engine_cc INT,
                registration_city VARCHAR(100),
                condition VARCHAR(20) NOT NULL DEFAULT 'Good',
                description TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                admin_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_sell_requests_status ON sell_requests(status);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_sell_requests_user ON sell_requests(user_id);
        `);

        console.log("sell_requests table created successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        pool.end();
    }
};

migrate();
