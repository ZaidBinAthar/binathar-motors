import * as biz from "./businessQueryService.js";

// ─── Helpers ─────────────────────────────────────────────────────

const PLURAL_BRANDS = {
    hondas: "Honda", yamahas: "Yamaha", suzukis: "Suzuki", uniteds: "United",
    hero: "Hero", cd70: "Honda CD 70", "cd 70": "Honda CD 70",
    "cg 125": "Honda CG 125", cg125: "Honda CG 125",
};

function extractBrand(text) {
    const lower = text.toLowerCase();
    const brands = ["Honda", "Yamaha", "Suzuki", "United", "Hero", "Ravi", "Sohrab", "Qingqi", "Metro"];
    for (const b of brands) {
        if (lower.includes(b.toLowerCase())) return b;
    }
    for (const [key, val] of Object.entries(PLURAL_BRANDS)) {
        if (lower.includes(key)) return val;
    }
    return null;
}

function extractPrice(text) {
    const lower = text.toLowerCase();
    // Match patterns like "150000", "150,000", "Rs. 150000", "1.5 lakh", "under 150k"
    let matches = [];

    // "X lakh" pattern
    const lakhMatch = lower.match(/([\d.]+)\s*(?:lakh|lac)/);
    if (lakhMatch) matches.push(parseFloat(lakhMatch[1]) * 100000);

    // "Xk" or "X thousand" pattern
    const kMatch = lower.match(/([\d.]+)\s*k\b/);
    if (kMatch) matches.push(parseFloat(kMatch[1]) * 1000);

    const thouMatch = lower.match(/([\d.]+)\s*(?:thousand|hazaar)/);
    if (thouMatch) matches.push(parseFloat(thouMatch[1]) * 1000);

    // Plain number pattern (with optional commas)
    const plainMatches = lower.match(/(?:rs\.?\s*)?([\d,]+(?:\.\d+)?)/g);
    if (plainMatches) {
        for (const m of plainMatches) {
            const num = parseFloat(m.replace(/[rs.,\s]/g, ""));
            if (num > 500 && !matches.includes(num)) matches.push(num);
        }
    }

    return matches;
}

function extractDays(text) {
    const lower = text.toLowerCase();
    const match = lower.match(/(\d+)\s*(?:days?|din)/);
    return match ? parseInt(match[1]) : null;
}

function extractLimit(text) {
    const lower = text.toLowerCase();
    const match = lower.match(/(?:top|first|show|get)\s*(\d+)/);
    return match ? parseInt(match[1]) : null;
}

function formatCurrency(n) {
    return "Rs. " + Number(n).toLocaleString("en-PK");
}

function formatTable(rows, columns) {
    if (!rows || rows.length === 0) return null;
    let md = "| " + columns.map(c => c.label).join(" | ") + " |\n";
    md += "| " + columns.map(() => "---").join(" | ") + " |\n";
    for (const row of rows.slice(0, 20)) {
        md += "| " + columns.map(c => {
            let val = row[c.key];
            if (val === null || val === undefined) return "—";
            if (c.format === "currency") val = formatCurrency(val);
            if (c.format === "date") val = new Date(val).toLocaleDateString("en-PK");
            return String(val);
        }).join(" | ") + " |\n";
    }
    return md;
}

// ─── Intent Patterns ─────────────────────────────────────────────

const INTENTS = [
    // ── Inventory ──
    {
        patterns: [/\b(?:how many|total)\s+(?:bikes?|motorcycles?)\s+(?:are\s+)?(?:available|in\s+stock)\b/i, /\bavailable\s+bikes?\b/i, /\binventory\s+(?:count|summary|total)\b/i, /\bstock\s+(?:count|summary)\b/i],
        handler: async () => {
            const summary = await biz.getInventorySummary();
            const bikes = await biz.getAvailableBikes();
            let text = `**${summary.available} bikes** currently available in stock.\n\n`;
            text += `- Total inventory value: **${formatCurrency(summary.total_inventory_value)}**\n`;
            text += `- Average price: **${formatCurrency(summary.avg_price)}**\n`;
            if (bikes.length > 0) {
                text += "\n" + formatTable(bikes, [
                    { key: "brand", label: "Brand" },
                    { key: "model", label: "Model" },
                    { key: "model_year", label: "Year" },
                    { key: "selling_price", label: "Price", format: "currency" },
                    { key: "condition", label: "Condition" },
                ]);
            }
            return { text, data: { type: "inventory_summary", count: summary.available } };
        },
    },
    {
        patterns: [/\b(?:all|list|show)\s+(?:available|in\s+stock)\s+bikes?\b/i, /\b(?:inventory|stock)\s+(?:list|show|all)\b/i],
        handler: async () => {
            const bikes = await biz.getAvailableBikes();
            if (bikes.length === 0) return { text: "No bikes currently in stock." };
            let text = `**${bikes.length} bikes** in inventory:\n\n`;
            text += formatTable(bikes, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "model_year", label: "Year" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "days_in_stock", label: "Days" },
            ]);
            return { text, data: { type: "bike_list", bikes } };
        },
    },
    {
        patterns: [/\b(?:old|sitting|stuck|long)\s+(?:inventory|stock|bikes?)\b/i, /\b(?:more than|over|gt)\s+(\d+)\s+days?\b/i, /\bbikes?\s+(?:older|old)\s+than\s+(\d+)\s+days?\b/i, /\b(?:sitting|stuck)\s+(?:in\s+)?(?:stock|inventory)\b/i],
        handler: async (text) => {
            const daysMatch = text.match(/(\d+)\s*days?/i);
            const days = daysMatch ? parseInt(daysMatch[1]) : 45;
            const bikes = await biz.getOldInventory(days);
            if (bikes.length === 0) return { text: `No bikes have been in stock for more than ${days} days. Great job!` };
            let response = `**${bikes.length} bike${bikes.length > 1 ? "s" : ""}** in stock for more than ${days} days:\n\n`;
            response += formatTable(bikes, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "days_in_stock", label: "Days in Stock" },
            ]);
            response += `\n> These bikes may need pricing or promotional review.`;
            return { text: response, data: { type: "old_inventory", bikes, days } };
        },
    },
    // ── Brand Search ──
    {
        patterns: [/\b(?:show|list|find|get|which|what)\s+.*?(honda|yamaha|suzuki|united|hero|ravi|sohrab|qingqi|metro)\b/i, /\b(honda|yamaha|suzuki|united|hero|ravi|sohrab|qingqi|metro)\s+bikes?\b/i],
        handler: async (text) => {
            const brand = extractBrand(text);
            if (!brand) return { text: "Which brand are you looking for?" };
            const priceMatch = text.match(/(?:under|below|less than|max|upto|up to)\s*(?:rs\.?\s*)?([\d,]+)/i);
            let bikes;
            if (priceMatch) {
                const maxPrice = parseInt(priceMatch[1].replace(/,/g, ""));
                const all = await biz.getBikesByBrand(brand);
                bikes = all.filter(b => Number(b.selling_price) <= maxPrice);
            } else {
                bikes = await biz.getBikesByBrand(brand);
            }
            if (bikes.length === 0) return { text: `No ${brand} bikes found matching your criteria.` };
            let response = `**${bikes.length} ${brand} bike${bikes.length > 1 ? "s" : ""}** found:\n\n`;
            response += formatTable(bikes, [
                { key: "model", label: "Model" },
                { key: "model_year", label: "Year" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "condition", label: "Condition" },
                { key: "status", label: "Status" },
            ]);
            return { text: response, data: { type: "brand_search", brand, bikes } };
        },
    },
    // ── Price Range ──
    {
        patterns: [/\b(?:under|below|less than|max|upto|up to)\s*(?:rs\.?\s*)?([\d,]+)/i, /\bbikes?\s+(?:between|from)\s*(?:rs\.?\s*)?([\d,]+)\s*(?:and|to|-)\s*(?:rs\.?\s*)?([\d,]+)/i, /\bprice\s+range\b/i],
        handler: async (text) => {
            const betweenMatch = text.match(/(?:between|from)\s*(?:rs\.?\s*)?([\d,]+)\s*(?:and|to|-)\s*(?:rs\.?\s*)?([\d,]+)/i);
            let minPrice, maxPrice;
            if (betweenMatch) {
                minPrice = parseInt(betweenMatch[1].replace(/,/g, ""));
                maxPrice = parseInt(betweenMatch[2].replace(/,/g, ""));
            } else {
                const underMatch = text.match(/(?:under|below|less than|max|upto|up to)\s*(?:rs\.?\s*)?([\d,]+)/i);
                if (underMatch) maxPrice = parseInt(underMatch[1].replace(/,/g, ""));
            }
            const bikes = await biz.getBikesByPriceRange(minPrice, maxPrice);
            if (bikes.length === 0) return { text: "No bikes found in that price range." };
            const rangeText = maxPrice && minPrice ? `${formatCurrency(minPrice)} to ${formatCurrency(maxPrice)}` : maxPrice ? `under ${formatCurrency(maxPrice)}` : `above ${formatCurrency(minPrice)}`;
            let response = `**${bikes.length} bike${bikes.length > 1 ? "s" : ""}** ${rangeText}:\n\n`;
            response += formatTable(bikes, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "model_year", label: "Year" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "condition", label: "Condition" },
            ]);
            return { text: response, data: { type: "price_search", bikes, minPrice, maxPrice } };
        },
    },
    // ── Sales ──
    {
        patterns: [/\b(?:how many|total)\s+(?:bikes?\s+)?(?:were?\s+)?sold\s+(?:this\s+)?month\b/i, /\bsold\s+(?:this\s+)?month\b/i, /\bmonthly\s+sales?\b/i],
        handler: async () => {
            const sales = await biz.getSalesThisMonth();
            const summary = await biz.getSalesSummary();
            if (sales.length === 0) return { text: "No bikes sold this month yet." };
            let response = `**${sales.length} bike${sales.length > 1 ? "s" : ""}** sold this month.\n\n`;
            response += `- Revenue: **${formatCurrency(sales.reduce((s, x) => s + Number(x.sale_price), 0))}**\n`;
            response += "\n" + formatTable(sales, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "sale_price", label: "Sold For", format: "currency" },
                { key: "sale_date", label: "Date", format: "date" },
            ]);
            return { text: response, data: { type: "monthly_sales", sales } };
        },
    },
    {
        patterns: [/\b(?:recent|latest|last)\s+sales?\b/i, /\bsales?\s+(?:history|recent|latest)\b/i, /\bshow\s+sales?\b/i],
        handler: async (text) => {
            const limit = extractLimit(text) || 10;
            const sales = await biz.getRecentSales(limit);
            if (sales.length === 0) return { text: "No sales recorded yet." };
            let response = `**${sales.length} recent sale${sales.length > 1 ? "s" : ""}:**\n\n`;
            response += formatTable(sales, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "sale_price", label: "Sold For", format: "currency" },
                { key: "customer_name", label: "Customer" },
                { key: "sale_date", label: "Date", format: "date" },
            ]);
            return { text: response, data: { type: "recent_sales", sales } };
        },
    },
    {
        patterns: [/\b(?:sales?\s+)?summary\b/i, /\btotal\s+revenue\b/i, /\btotal\s+sales\b/i, /\brevenue\b/i],
        handler: async () => {
            const s = await biz.getSalesSummary();
            let response = "**Sales Summary:**\n\n";
            response += `- Total sales: **${s.total_sales}**\n`;
            response += `- Total revenue: **${formatCurrency(s.total_revenue)}**\n`;
            response += `- Average sale price: **${formatCurrency(s.avg_sale_price)}**\n`;
            response += `- Sold this month: **${s.this_month}**\n`;
            response += `- Sold this week: **${s.this_week}**\n`;
            response += `- Price range: ${formatCurrency(s.lowest_sale)} — ${formatCurrency(s.highest_sale)}\n`;
            return { text: response, data: { type: "sales_summary", summary: s } };
        },
    },
    // ── Inquiries ──
    {
        patterns: [/\b(?:which|what)\s+bikes?\s+(?:have|has)\s+most\s+(?:inquiries?|messages?|interest)\b/i, /\bmost\s+(?:inquired|popular|interesting)\b/i, /\bpopular\s+bikes?\b/i],
        handler: async () => {
            const bikes = await biz.getBikesWithMostInquiries();
            if (bikes.length === 0) return { text: "No bikes have received inquiries yet." };
            let response = `**Bikes with most inquiries:**\n\n`;
            response += formatTable(bikes, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "inquiry_count", label: "Inquiries" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "status", label: "Status" },
            ]);
            return { text: response, data: { type: "popular_bikes", bikes } };
        },
    },
    {
        patterns: [/\b(?:no|zero|without|without any)\s+inquiries?\b/i, /\bbikes?\s+(?:with\s+)?no\s+inquiries?\b/i, /\b(?:which|what)\s+bikes?\s+(?:haven'?t|have\s+not)\s+received/i, /\bno\s+interest\b/i],
        handler: async (text) => {
            const days = extractDays(text);
            const bikes = await biz.getBikesWithNoInquiries(days);
            if (bikes.length === 0) return { text: "All bikes have received at least one inquiry." };
            let response = `**${bikes.length} bike${bikes.length > 1 ? "s" : ""}** with no inquiries${days ? ` in the last ${days} days` : ""}:\n\n`;
            response += formatTable(bikes, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "days_in_stock", label: "Days in Stock" },
            ]);
            response += `\n> These bikes may need more visibility or promotion.`;
            return { text: response, data: { type: "no_inquiries", bikes } };
        },
    },
    {
        patterns: [/\binquiry\s+summary\b/i, /\bhow\s+many\s+inquiries?\b/i, /\binquiries?\s+(?:total|count|overview)\b/i],
        handler: async () => {
            const s = await biz.getInquirySummary();
            let response = "**Inquiry Summary:**\n\n";
            response += `- Total inquiries: **${s.total}**\n`;
            response += `- New (unread): **${s.new_inquiries}**\n`;
            response += `- Replied: **${s.replied}**\n`;
            response += `- Closed: **${s.closed}**\n`;
            response += `- This month: **${s.this_month}**\n`;
            response += `- This week: **${s.this_week}**\n`;
            return { text: response, data: { type: "inquiry_summary", summary: s } };
        },
    },
    {
        patterns: [/\b(?:recent|latest)\s+inquiries?\b/i, /\binquiries?\s+(?:recent|latest|list)\b/i, /\bshow\s+inquiries?\b/i],
        handler: async (text) => {
            const limit = extractLimit(text) || 10;
            const inquiries = await biz.getRecentInquiries(limit);
            if (inquiries.length === 0) return { text: "No inquiries yet." };
            let response = `**${inquiries.length} recent inquiries:**\n\n`;
            response += formatTable(inquiries, [
                { key: "customer_name", label: "Customer" },
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "status", label: "Status" },
                { key: "created_at", label: "Date", format: "date" },
            ]);
            return { text: response, data: { type: "recent_inquiries", inquiries } };
        },
    },
    // ── Brand Performance ──
    {
        patterns: [/\bbrand\s+(?:performance|analytics|breakdown)\b/i, /\bwhich\s+brand\s+(?:sells?|performs?|does)\b/i, /\bbrands?\s+(?:performance|summary)\b/i],
        handler: async () => {
            const brands = await biz.getBrandPerformance();
            let response = "**Brand Performance:**\n\n";
            response += formatTable(brands, [
                { key: "brand", label: "Brand" },
                { key: "total_bikes", label: "Total" },
                { key: "available", label: "Available" },
                { key: "sold", label: "Sold" },
                { key: "avg_price", label: "Avg Price", format: "currency" },
            ]);
            return { text: response, data: { type: "brand_performance", brands } };
        },
    },
    // ── Sell Requests ──
    {
        patterns: [/\bsell\s+requests?\b/i, /\bpending\s+sell\b/i, /\buser\s+sell\b/i],
        handler: async () => {
            const s = await biz.getSellRequestSummary();
            let response = "**Sell Request Summary:**\n\n";
            response += `- Total requests: **${s.total}**\n`;
            response += `- Pending review: **${s.pending}**\n`;
            response += `- Accepted: **${s.accepted}**\n`;
            response += `- Rejected: **${s.rejected}**\n`;
            return { text: response, data: { type: "sell_request_summary", summary: s } };
        },
    },
    // ── Reviews ──
    {
        patterns: [/\breviews?\s+summary\b/i, /\baverage\s+rating\b/i, /\bcustomer\s+rating\b/i, /\brating\s+summary\b/i],
        handler: async () => {
            const s = await biz.getReviewSummary();
            let response = "**Customer Reviews Summary:**\n\n";
            response += `- Average rating: **${s.avg_rating}/5** ⭐\n`;
            response += `- Total approved reviews: **${s.total_reviews}**\n`;
            response += `- 5-star: ${s.five_star} | 4-star: ${s.four_star} | 3-star: ${s.three_star} | 2-star: ${s.two_star} | 1-star: ${s.one_star}\n`;
            return { text: response, data: { type: "review_summary", summary: s } };
        },
    },
    // ── Users ──
    {
        patterns: [/\busers?\s+(?:summary|count|total)\b/i, /\bhow\s+many\s+users?\b/i, /\bteam\s+members?\b/i],
        handler: async () => {
            const s = await biz.getUserSummary();
            let response = "**User Summary:**\n\n";
            response += `- Total users: **${s.total_users}**\n`;
            response += `- Owners: ${s.owners} | Admins: ${s.admins} | Staff: ${s.staff_count} | Regular: ${s.regular_users}\n`;
            response += `- Active: **${s.active}**\n`;
            return { text: response, data: { type: "user_summary", summary: s } };
        },
    },
    // ── Specific Bike ──
    {
        patterns: [/\bbike\s+#?(\d+)\b/i, /\bbike\s+id\s+(\d+)\b/i, /\bshow\s+bike\s+(\d+)\b/i],
        handler: async (text) => {
            const idMatch = text.match(/#?(\d+)/);
            if (!idMatch) return { text: "Which bike are you looking for? Provide a bike ID." };
            const bike = await biz.getBikeById(parseInt(idMatch[1]));
            if (!bike) return { text: `Bike #${idMatch[1]} not found.` };
            let response = `**${bike.brand} ${bike.model} (${bike.model_year})**\n\n`;
            response += `- Price: **${formatCurrency(bike.selling_price)}**\n`;
            response += `- Condition: ${bike.condition}\n`;
            response += `- Status: ${bike.status}\n`;
            if (bike.color) response += `- Color: ${bike.color}\n`;
            if (bike.engine_cc) response += `- Engine: ${bike.engine_cc}cc\n`;
            if (bike.registration_city) response += `- Registration: ${bike.registration_city}\n`;
            response += `- Added: ${new Date(bike.created_at).toLocaleDateString("en-PK")}\n`;
            if (bike.description) response += `\n> ${bike.description.slice(0, 200)}${bike.description.length > 200 ? "..." : ""}\n`;
            return { text: response, data: { type: "bike_detail", bike } };
        },
    },
    // ── Inventory Overview / Needs Attention ──
    {
        patterns: [/\b(?:inventory|stock)\s+(?:overview|summary|status)\b/i, /\bgive\s+me\s+(?:an?\s+)?(?:inventory|stock)\b/i, /\bbusiness\s+(?:overview|summary|status)\b/i, /\boverview\b/i, /\bstatus\b/i],
        handler: async () => {
            const [inv, sales, inquiries, reviews, brands] = await Promise.all([
                biz.getInventorySummary(),
                biz.getSalesSummary(),
                biz.getInquirySummary(),
                biz.getReviewSummary(),
                biz.getBrandPerformance(),
            ]);
            let response = "**BinAthar Motors — Business Overview**\n\n";
            response += "**Inventory**\n";
            response += `- Available: **${inv.available}** bikes\n`;
            response += `- Sold: **${inv.sold}** bikes\n`;
            response += `- Inventory value: **${formatCurrency(inv.total_inventory_value)}**\n\n`;
            response += "**Sales**\n";
            response += `- Total sales: **${sales.total_sales}**\n`;
            response += `- Revenue: **${formatCurrency(sales.total_revenue)}**\n`;
            response += `- This month: **${sales.this_month}**\n\n`;
            response += "**Inquiries**\n";
            response += `- Total: **${inquiries.total}**\n`;
            response += `- New: **${inquiries.new_inquiries}** | Replied: **${inquiries.replied}** | Closed: **${inquiries.closed}**\n\n`;
            response += "**Reviews**\n";
            response += `- Average rating: **${reviews.avg_rating}/5** (${reviews.total_reviews} reviews)\n\n`;
            if (brands.length > 0) {
                response += "**Top Brands**\n";
                response += formatTable(brands.slice(0, 5), [
                    { key: "brand", label: "Brand" },
                    { key: "total_bikes", label: "Total" },
                    { key: "sold", label: "Sold" },
                    { key: "available", label: "Available" },
                ]);
            }
            return { text: response, data: { type: "business_overview", inventory: inv, sales, inquiries, reviews } };
        },
    },
    {
        patterns: [/\b(?:needs?|need)\s+attention\b/i, /\battention\b/i, /\bwhat\s+needs?\s+(?:action|review|attention)\b/i],
        handler: async () => {
            const [oldBikes, noInq] = await Promise.all([
                biz.getOldInventory(30),
                biz.getBikesWithNoInquiries(30),
            ]);
            let response = "**Bikes Needing Attention:**\n\n";
            if (oldBikes.length > 0) {
                response += `**Old inventory (30+ days):** ${oldBikes.length} bike${oldBikes.length > 1 ? "s" : ""}\n`;
                response += formatTable(oldBikes.slice(0, 5), [
                    { key: "brand", label: "Brand" },
                    { key: "model", label: "Model" },
                    { key: "selling_price", label: "Price", format: "currency" },
                    { key: "days_in_stock", label: "Days" },
                ]);
                response += "\n";
            }
            if (noInq.length > 0) {
                response += `**No inquiries (30+ days):** ${noInq.length} bike${noInq.length > 1 ? "s" : ""}\n`;
                response += formatTable(noInq.slice(0, 5), [
                    { key: "brand", label: "Brand" },
                    { key: "model", label: "Model" },
                    { key: "selling_price", label: "Price", format: "currency" },
                ]);
                response += "\n";
            }
            if (oldBikes.length === 0 && noInq.length === 0) {
                response = "All bikes are performing well. No immediate attention needed!";
            } else {
                response += "> Consider reviewing pricing, promotions, or visibility for these bikes.";
            }
            return { text: response, data: { type: "attention_needed", oldBikes, noInquiries: noInq } };
        },
    },
    // ── Help ──
    {
        patterns: [/\bhelp\b/i, /\bwhat\s+can\s+you\s+do\b/i, /\bcommands?\b/i, /\boptions?\b/i],
        handler: async () => {
            let response = "**Here's what I can help you with:**\n\n";
            response += "**Inventory**\n";
            response += "- How many bikes are available?\n";
            response += "- Show Honda bikes under Rs. 150,000\n";
            response += "- Which bikes have been in stock the longest?\n";
            response += "- Show bikes sitting in inventory for 45+ days\n\n";
            response += "**Sales**\n";
            response += "- How many bikes were sold this month?\n";
            response += "- Show recent sales\n";
            response += "- Give me a sales summary\n\n";
            response += "**Customer Interest**\n";
            response += "- Which bikes have the most inquiries?\n";
            response += "- Which bikes have no inquiries?\n";
            response += "- Show recent inquiries\n\n";
            response += "**Management**\n";
            response += "- Give me an inventory overview\n";
            response += "- Which bikes need attention?\n";
            response += "- Show brand performance\n";
            response += "- Review summary\n";
            response += "- Sell request summary\n";
            return { text: response, data: null };
        },
    },
];

// ─── Context-Aware Follow-Up ────────────────────────────────────

function detectFollowUp(text, context) {
    const lower = text.toLowerCase();
    const followUpPatterns = [
        { pattern: /\b(?:which\s+)?(?:one\s+)?is\s+(?:the\s+)?newest\b/i, action: "sort_newest" },
        { pattern: /\b(?:which\s+)?(?:one\s+)?is\s+(?:the\s+)?oldest\b/i, action: "sort_oldest" },
        { pattern: /\b(?:which\s+)?(?:one\s+)?is\s+(?:the\s+)?cheapest\b/i, action: "sort_cheapest" },
        { pattern: /\b(?:which\s+)?(?:one\s+)?is\s+(?:the\s+)?most\s+expensive\b/i, action: "sort_expensive" },
        { pattern: /\b(?:which\s+)?(?:one\s+)?has\s+(?:the\s+)?most\s+inquiries\b/i, action: "sort_most_inquiries" },
        { pattern: /\bshow\s+more\b/i, action: "show_more" },
        { pattern: /\bhow\s+many\b/i, action: "count" },
    ];

    if (!context || !context.lastBikes || context.lastBikes.length === 0) return null;

    for (const fp of followUpPatterns) {
        if (fp.pattern.test(lower)) {
            return { action: fp.action, bikes: context.lastBikes };
        }
    }
    return null;
}

function handleFollowUp(followUp) {
    let bikes = [...followUp.bikes];
    let text = "";

    switch (followUp.action) {
        case "sort_newest":
            bikes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            text = `**Newest bike from your results:**\n\n`;
            text += formatTable(bikes.slice(0, 1), [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "model_year", label: "Year" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "created_at", label: "Added", format: "date" },
            ]);
            break;
        case "sort_oldest":
            bikes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            text = `**Oldest bike from your results:**\n\n`;
            text += formatTable(bikes.slice(0, 1), [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "model_year", label: "Year" },
                { key: "selling_price", label: "Price", format: "currency" },
                { key: "days_in_stock", label: "Days in Stock" },
            ]);
            break;
        case "sort_cheapest":
            bikes.sort((a, b) => Number(a.selling_price) - Number(b.selling_price));
            text = `**Cheapest bike from your results:**\n\n`;
            text += formatTable(bikes.slice(0, 1), [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "selling_price", label: "Price", format: "currency" },
            ]);
            break;
        case "sort_expensive":
            bikes.sort((a, b) => Number(b.selling_price) - Number(a.selling_price));
            text = `**Most expensive bike from your results:**\n\n`;
            text += formatTable(bikes.slice(0, 1), [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "selling_price", label: "Price", format: "currency" },
            ]);
            break;
        case "count":
            text = `There are **${bikes.length} bikes** in the previous results.`;
            break;
        case "show_more":
            text = `**All ${bikes.length} bikes:**\n\n`;
            text += formatTable(bikes, [
                { key: "brand", label: "Brand" },
                { key: "model", label: "Model" },
                { key: "model_year", label: "Year" },
                { key: "selling_price", label: "Price", format: "currency" },
            ]);
            break;
        default:
            return null;
    }
    return { text, data: { type: "follow_up", bikes } };
}

// ─── Main Process Function ───────────────────────────────────────

export async function processQuestion(question, context = {}) {
    const text = question.trim();
    if (!text) {
        return { text: "Please ask me a question about BinAthar Motors.", data: null };
    }

    // Check for follow-up
    const followUp = detectFollowUp(text, context);
    if (followUp) {
        const result = handleFollowUp(followUp);
        if (result) return result;
    }

    // Match against intent patterns
    for (const intent of INTENTS) {
        for (const pattern of intent.patterns) {
            if (pattern.test(text)) {
                return await intent.handler(text);
            }
        }
    }

    // Fallback
    return {
        text: "I'm not sure how to answer that. Try asking about:\n\n" +
              "- **Inventory**: \"How many bikes are available?\"\n" +
              "- **Sales**: \"Show recent sales\"\n" +
              "- **Inquiries**: \"Which bikes have the most inquiries?\"\n" +
              "- **Brands**: \"Show Honda bikes\"\n" +
              "- **Overview**: \"Give me a business overview\"\n\n" +
              "Type **help** to see all available commands.",
        data: null,
    };
}

export const SUGGESTED_QUESTIONS = [
    { category: "Inventory", questions: [
        "How many bikes are available?",
        "Which bikes have been in stock the longest?",
        "Show Honda bikes under Rs. 150,000",
    ]},
    { category: "Sales", questions: [
        "How many bikes were sold this month?",
        "Show recent sales",
        "Give me a sales summary",
    ]},
    { category: "Customer Interest", questions: [
        "Which bikes have the most inquiries?",
        "Which bikes have no inquiries?",
        "Show recent inquiries",
    ]},
    { category: "Management", questions: [
        "Give me a business overview",
        "Which bikes need attention?",
        "Show brand performance",
    ]},
];
