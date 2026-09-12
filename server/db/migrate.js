import "dotenv/config";
import pool from "./index.js";

// Set usernames for any users still null
await pool.query(`UPDATE users SET username = 'zaid' WHERE id = 4 AND username IS NULL`);
await pool.query(`UPDATE users SET username = 'zaid2' WHERE id = 1 AND username IS NULL`);
await pool.query(`UPDATE users SET username = 'huzaifa' WHERE id = 3 AND username IS NULL`);
await pool.query(`UPDATE users SET username = 'staff1' WHERE id = 5 AND username IS NULL`);

await pool.query(`ALTER TABLE users ALTER COLUMN username SET NOT NULL`);

const r = await pool.query("SELECT id, username, email, role FROM users ORDER BY id");
r.rows.forEach(u => console.log(`id=${u.id} user=${u.username} email=${u.email} role=${u.role}`));

process.exit(0);
