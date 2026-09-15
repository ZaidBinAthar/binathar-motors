import pool from "../db/index.js";

// ─── Inventory Queries ───────────────────────────────────────────

export async function getInventorySummary() {
    const result = await pool.query(`
        SELECT
            COUNT(*)::int AS total_bikes,
            COUNT(*) FILTER (WHERE status = 'available')::int AS available,
            COUNT(*) FILTER (WHERE status = 'sold')::int AS sold,
            COALESCE(AVG(selling_price) FILTER (WHERE status = 'available'), 0)::numeric(12,0) AS avg_price,
            COALESCE(SUM(selling_price) FILTER (WHERE status = 'available'), 0)::numeric(12,0) AS total_inventory_value,
            MIN(created_at) AS oldest_listing,
            MAX(created_at) AS newest_listing
        FROM bikes
    `);
    return result.rows[0];
}

export async function getAvailableBikes() {
    const result = await pool.query(`
        SELECT b.id, b.brand, b.model, b.model_year, b.selling_price, b.color,
               b.engine_cc, b.registration_city, b.condition, b.created_at,
               (SELECT image_url FROM bike_images WHERE bike_id = b.id AND is_cover = true LIMIT 1) AS cover_image,
               EXTRACT(DAY FROM CURRENT_TIMESTAMP - b.created_at)::int AS days_in_stock
        FROM bikes b
        WHERE b.status = 'available'
        ORDER BY b.created_at ASC
    `);
    return result.rows;
}

export async function getSoldBikes() {
    const result = await pool.query(`
        SELECT b.id, b.brand, b.model, b.model_year, b.color, b.engine_cc,
               s.sale_price, s.sale_date, s.customer_name,
               EXTRACT(DAY FROM s.sale_date - b.created_at)::int AS days_to_sell
        FROM bikes b
        JOIN sales s ON s.bike_id = b.id
        WHERE b.status = 'sold'
        ORDER BY s.sale_date DESC
    `);
    return result.rows;
}

export async function getBikesByBrand(brand) {
    const result = await pool.query(`
        SELECT b.id, b.brand, b.model, b.model_year, b.selling_price, b.color,
               b.engine_cc, b.condition, b.status, b.created_at,
               (SELECT image_url FROM bike_images WHERE bike_id = b.id AND is_cover = true LIMIT 1) AS cover_image
        FROM bikes b
        WHERE LOWER(b.brand) = LOWER($1)
        ORDER BY b.created_at DESC
    `, [brand]);
    return result.rows;
}

export async function getBikesByPriceRange(minPrice, maxPrice) {
    let query = `
        SELECT b.id, b.brand, b.model, b.model_year, b.selling_price, b.color,
               b.engine_cc, b.condition, b.status, b.created_at,
               (SELECT image_url FROM bike_images WHERE bike_id = b.id AND is_cover = true LIMIT 1) AS cover_image
        FROM bikes b
        WHERE b.status = 'available'
    `;
    const params = [];
    if (minPrice !== undefined && minPrice !== null) {
        params.push(minPrice);
        query += ` AND b.selling_price >= $${params.length}`;
    }
    if (maxPrice !== undefined && maxPrice !== null) {
        params.push(maxPrice);
        query += ` AND b.selling_price <= $${params.length}`;
    }
    query += " ORDER BY b.selling_price ASC";
    const result = await pool.query(query, params);
    return result.rows;
}

export async function getOldInventory(days = 45) {
    const result = await pool.query(`
        SELECT b.id, b.brand, b.model, b.model_year, b.selling_price, b.color,
               b.engine_cc, b.condition, b.created_at,
               EXTRACT(DAY FROM CURRENT_TIMESTAMP - b.created_at)::int AS days_in_stock
        FROM bikes b
        WHERE b.status = 'available'
          AND b.created_at < CURRENT_TIMESTAMP - ($1 || ' days')::interval
        ORDER BY b.created_at ASC
    `, [days]);
    return result.rows;
}

export async function getBikeById(id) {
    const result = await pool.query(`
        SELECT b.*, 
               (SELECT image_url FROM bike_images WHERE bike_id = b.id AND is_cover = true LIMIT 1) AS cover_image
        FROM bikes b WHERE b.id = $1
    `, [id]);
    return result.rows[0] || null;
}

// ─── Sales Queries ───────────────────────────────────────────────

export async function getRecentSales(limit = 10) {
    const result = await pool.query(`
        SELECT s.id, s.sale_price, s.purchase_price, s.sale_date,
               s.customer_name, s.customer_phone,
               b.brand, b.model, b.model_year, b.id AS bike_id,
               EXTRACT(DAY FROM s.sale_date - b.created_at)::int AS days_to_sell
        FROM sales s
        JOIN bikes b ON b.id = s.bike_id
        ORDER BY s.sale_date DESC
        LIMIT $1
    `, [limit]);
    return result.rows;
}

export async function getSalesThisMonth() {
    const result = await pool.query(`
        SELECT s.id, s.sale_price, s.purchase_price, s.sale_date,
               s.customer_name,
               b.brand, b.model, b.model_year, b.id AS bike_id
        FROM sales s
        JOIN bikes b ON b.id = s.bike_id
        WHERE s.sale_date >= DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY s.sale_date DESC
    `);
    return result.rows;
}

export async function getSalesSummary() {
    const result = await pool.query(`
        SELECT
            COUNT(*)::int AS total_sales,
            COALESCE(SUM(sale_price), 0)::numeric(12,0) AS total_revenue,
            COALESCE(AVG(sale_price), 0)::numeric(12,0) AS avg_sale_price,
            COALESCE(MIN(sale_price), 0) AS lowest_sale,
            COALESCE(MAX(sale_price), 0) AS highest_sale,
            COUNT(*) FILTER (WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE))::int AS this_month,
            COUNT(*) FILTER (WHERE sale_date >= DATE_TRUNC('week', CURRENT_DATE))::int AS this_week
        FROM sales
    `);
    return result.rows[0];
}

// ─── Inquiry Queries ─────────────────────────────────────────────

export async function getInquirySummary() {
    const result = await pool.query(`
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'new')::int AS new_inquiries,
            COUNT(*) FILTER (WHERE status = 'replied')::int AS replied,
            COUNT(*) FILTER (WHERE status = 'closed')::int AS closed,
            COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE))::int AS this_month,
            COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE))::int AS this_week
        FROM inquiries
    `);
    return result.rows[0];
}

export async function getBikesWithMostInquiries() {
    const result = await pool.query(`
        SELECT b.id, b.brand, b.model, b.model_year, b.selling_price, b.status,
               COUNT(i.id)::int AS inquiry_count
        FROM bikes b
        LEFT JOIN inquiries i ON i.bike_id = b.id
        GROUP BY b.id
        HAVING COUNT(i.id) > 0
        ORDER BY inquiry_count DESC
        LIMIT 10
    `);
    return result.rows;
}

export async function getBikesWithNoInquiries(days = null) {
    let query = `
        SELECT b.id, b.brand, b.model, b.model_year, b.selling_price, b.color, b.status,
               b.created_at,
               EXTRACT(DAY FROM CURRENT_TIMESTAMP - b.created_at)::int AS days_in_stock
        FROM bikes b
        WHERE b.id NOT IN (SELECT DISTINCT bike_id FROM inquiries WHERE bike_id IS NOT NULL)
    `;
    const params = [];
    if (days) {
        params.push(days);
        query += ` AND b.created_at < CURRENT_TIMESTAMP - ($1 || ' days')::interval`;
    }
    query += " ORDER BY b.created_at ASC";
    const result = await pool.query(query, params);
    return result.rows;
}

export async function getRecentInquiries(limit = 10) {
    const result = await pool.query(`
        SELECT i.id, i.customer_name, i.customer_phone, i.message, i.status, i.created_at,
               b.brand, b.model, b.id AS bike_id
        FROM inquiries i
        LEFT JOIN bikes b ON i.bike_id = b.id
        ORDER BY i.created_at DESC
        LIMIT $1
    `, [limit]);
    return result.rows;
}

// ─── Review Queries ──────────────────────────────────────────────

export async function getReviewSummary() {
    const result = await pool.query(`
        SELECT
            COUNT(*)::int AS total_reviews,
            COALESCE(AVG(rating), 0)::numeric(3,1) AS avg_rating,
            COUNT(*) FILTER (WHERE rating = 5)::int AS five_star,
            COUNT(*) FILTER (WHERE rating = 4)::int AS four_star,
            COUNT(*) FILTER (WHERE rating = 3)::int AS three_star,
            COUNT(*) FILTER (WHERE rating = 2)::int AS two_star,
            COUNT(*) FILTER (WHERE rating = 1)::int AS one_star
        FROM reviews
        WHERE status = 'approved'
    `);
    return result.rows[0];
}

// ─── Brand Analytics ─────────────────────────────────────────────

export async function getBrandPerformance() {
    const result = await pool.query(`
        SELECT
            b.brand,
            COUNT(DISTINCT b.id)::int AS total_bikes,
            COUNT(DISTINCT CASE WHEN b.status = 'sold' THEN b.id END)::int AS sold,
            COUNT(DISTINCT CASE WHEN b.status = 'available' THEN b.id END)::int AS available,
            COALESCE(AVG(b.selling_price) FILTER (WHERE b.status = 'available'), 0)::numeric(12,0) AS avg_price
        FROM bikes b
        GROUP BY b.brand
        ORDER BY total_bikes DESC
    `);
    return result.rows;
}

// ─── Sell Request Queries ────────────────────────────────────────

export async function getSellRequestSummary() {
    const result = await pool.query(`
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
            COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted,
            COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
        FROM sell_requests
    `);
    return result.rows[0];
}

// ─── User Queries ────────────────────────────────────────────────

export async function getUserSummary() {
    const result = await pool.query(`
        SELECT
            COUNT(*)::int AS total_users,
            COUNT(*) FILTER (WHERE role = 'owner')::int AS owners,
            COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
            COUNT(*) FILTER (WHERE role = 'staff')::int AS staff_count,
            COUNT(*) FILTER (WHERE role = 'user')::int AS regular_users,
            COUNT(*) FILTER (WHERE status = 'active')::int AS active
        FROM users
    `);
    return result.rows[0];
}
