// AI Description Generator
// Currently uses a smart template engine.
// To connect an AI provider, replace generateWithTemplate() with an API call.
// Example for OpenAI:
//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
//     body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }] })
//   });

const SYSTEM_PROMPT = `You are a professional motorcycle listing writer for a Pakistani dealership called BinAthar Motors.
Write a concise, trustworthy, and professional bike listing description.
Rules:
- Only use information provided by the user. Never invent mileage, ownership history, accident history, documents, or condition details not provided.
- Do not make unrealistic claims like "100% guaranteed" or "brand new condition" unless the user explicitly says so.
- Keep the tone suitable for a Pakistani motorcycle marketplace.
- Use clear, simple English.
- Format as a clean paragraph or short bullet points where appropriate.
- Do not include a title or heading, just the description body.`;

const conditionMap = {
    New: "brand new",
    Excellent: "excellent condition",
    Good: "good condition",
    Average: "fair condition",
};

function generateWithTemplate(data) {
    const {
        brand = "",
        model = "",
        model_year = "",
        selling_price = "",
        condition = "",
        engine_cc = "",
        color = "",
        registration_city = "",
        mileage = "",
        new_parts = "",
        features = "",
        notes = "",
    } = data;

    const bikeName = `${brand} ${model}`.trim();
    const year = model_year || "this";
    const price = selling_price ? `Rs. ${Number(selling_price).toLocaleString()}` : "";
    const condDesc = conditionMap[condition] || condition?.toLowerCase() || "";

    const parts = [];

    // Opening
    parts.push(`For sale: ${bikeName} ${year} model${condDesc ? ` in ${condDesc}` : ""}.`);

    // Price
    if (price) {
        parts.push(`Asking price is ${price}${registration_city ? `, negotiable` : ""}.`);
    }

    // Engine
    if (engine_cc) {
        parts.push(`Powered by a ${engine_cc}cc engine that runs smoothly.`);
    }

    // Color
    if (color) {
        parts.push(`Finished in ${color} color.`);
    }

    // Registration
    if (registration_city) {
        parts.push(`Registered in ${registration_city}.`);
    }

    // Mileage
    if (mileage) {
        parts.push(`Odometer reading: ${mileage}.`);
    }

    // Condition details
    if (condDesc && !parts.some((p) => p.includes(condDesc))) {
        parts.push(`The bike is in ${condDesc}.`);
    }

    // New parts / repairs
    if (new_parts) {
        parts.push(`Recently replaced / repaired: ${new_parts}.`);
    }

    // Special features
    if (features) {
        parts.push(`Notable features: ${features}.`);
    }

    // Notes
    if (notes) {
        parts.push(notes);
    }

    // Closing
    parts.push(`Contact BinAthar Motors for more details or to schedule a viewing.`);

    return parts.join(" ");
}

// TODO: Replace this function body with an actual AI API call
// async function generateWithAI(data, prompt) {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", { ... });
//     const json = await response.json();
//     return json.choices[0].message.content.trim();
// }

export const generateDescription = async (req, res) => {
    try {
        const data = req.body;

        if (!data.brand && !data.model) {
            return res.status(400).json({ success: false, message: "At least brand or model is required" });
        }

        // Build the user prompt for future AI integration
        const prompt = `Generate a professional bike listing description for:
Brand: ${data.brand || "N/A"}
Model: ${data.model || "N/A"}
Year: ${data.model_year || "N/A"}
Price: ${data.selling_price ? "Rs. " + data.selling_price : "N/A"}
Condition: ${data.condition || "N/A"}
Engine: ${data.engine_cc ? data.engine_cc + "cc" : "N/A"}
Color: ${data.color || "N/A"}
Registration: ${data.registration_city || "N/A"}
Mileage: ${data.mileage || "N/A"}
New parts/repairs: ${data.new_parts || "N/A"}
Special features: ${data.features || "N/A"}
Other notes: ${data.notes || "N/A"}`;

        // Template-based generation (swap with generateWithAI for real AI)
        const description = generateWithTemplate(data);

        res.json({ success: true, description });
    } catch (error) {
        console.error("Generate description error:", error);
        res.status(500).json({ success: false, message: "Failed to generate description" });
    }
};
