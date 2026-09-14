import pool from "../db/index.js";

const isValidId = (id) => /^\d+$/.test(id);

// CREATE sale (transactional: insert sale + update bike status)
export const createSale = async (req, res) => {
    const client = await pool.connect();
    try {
        const { bike_id, sale_price, purchase_price, customer_name, customer_phone } = req.body;

        if (!bike_id || sale_price == null) {
            return res.status(400).json({ success: false, message: "Bike ID and sale price are required" });
        }

        if (!isValidId(bike_id)) {
            return res.status(400).json({ success: false, message: "Invalid bike ID" });
        }

        await client.query("BEGIN");

        // Check bike exists and is available
        const bikeResult = await client.query(
            "SELECT id, status, brand, model, model_year, selling_price FROM bikes WHERE id = $1 FOR UPDATE",
            [bike_id]
        );

        if (bikeResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Bike not found" });
        }

        const bike = bikeResult.rows[0];

        if (bike.status === "sold") {
            await client.query("ROLLBACK");
            return res.status(409).json({ success: false, message: "This bike has already been sold" });
        }

        // Insert sale record
        const saleResult = await client.query(
            `INSERT INTO sales (bike_id, sale_price, purchase_price, customer_name, customer_phone, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                bike_id,
                sale_price,
                purchase_price || 0,
                customer_name || null,
                customer_phone || null,
                req.user.id,
            ]
        );

        // Mark bike as sold
        await client.query(
            "UPDATE bikes SET status = 'sold', updated_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [req.user.id, bike_id]
        );

        await client.query("COMMIT");

        const sale = saleResult.rows[0];

        // Generate receipt number: BM-YYYYMMDD-XXXX
        const date = new Date(sale.sale_date || sale.created_at);
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        const receiptNumber = `BM-${dateStr}-${String(sale.id).padStart(4, "0")}`;

        res.status(201).json({
            success: true,
            message: "Bike marked as sold successfully",
            sale: { ...sale, receipt_number: receiptNumber },
            bike,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Create sale error:", error);
        res.status(500).json({ success: false, message: "Failed to record sale" });
    } finally {
        client.release();
    }
};

// GET sale by ID (for receipt)
export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid sale ID" });
        }

        const result = await pool.query(
            `SELECT
                s.*,
                b.brand, b.model, b.model_year, b.engine_cc,
                b.registration_city, b.color, b.condition,
                u.username AS sold_by
             FROM sales s
             JOIN bikes b ON s.bike_id = b.id
             LEFT JOIN users u ON s.created_by = u.id
             WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Sale not found" });
        }

        const sale = result.rows[0];
        const date = new Date(sale.sale_date || sale.created_at);
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        sale.receipt_number = `BM-${dateStr}-${String(sale.id).padStart(4, "0")}`;

        res.json({ success: true, sale });
    } catch (error) {
        console.error("Get sale error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch sale" });
    }
};
