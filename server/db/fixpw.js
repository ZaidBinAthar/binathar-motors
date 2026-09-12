import "dotenv/config";
import pool from "./index.js";

const r = await pool.query("SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'inquiries' ORDER BY ordinal_position");
r.rows.forEach(c => console.log(c.column_name, "default:", c.column_default, "nullable:", c.is_nullable));

process.exit(0);
