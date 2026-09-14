import "dotenv/config";
import pool from "./db/index.js";

const migration = `
CREATE TABLE IF NOT EXISTS reviews (
    id             SERIAL        PRIMARY KEY,
    customer_name  VARCHAR (150) NOT NULL,
    rating         INT           NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text    TEXT          NOT NULL,
    bike_id        INT           REFERENCES bikes (id) ON DELETE SET NULL,
    status         VARCHAR (20)  DEFAULT 'pending',
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_bike ON reviews(bike_id);
`;

try {
    await pool.query(migration);
    console.log("Reviews table created successfully");
} catch (err) {
    console.error("Migration failed:", err.message);
} finally {
    await pool.end();
}
