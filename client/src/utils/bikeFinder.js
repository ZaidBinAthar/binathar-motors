// Recommendation engine for Find My Bike wizard
// Pure functions — no side effects, easily testable

const WEIGHTS = {
  budget: 30,
  usage: 15,
  brand: 20,
  engine: 20,
  year: 10,
  condition: 5,
};

// Usage → engine CC hint mapping (recommendation only, not factual claims)
const USAGE_ENGINE_HINTS = {
  daily: [70, 100, 125],
  long: [125, 150],
  performance: [150, 200],
  business: [70, 100, 125],
  any: [],
};

// Usage → condition preference
const USAGE_CONDITION_HINTS = {
  daily: ["excellent", "good"],
  long: ["excellent", "good"],
  performance: ["excellent"],
  business: ["good", "fair"],
  any: [],
};

function scoreBudget(bike, prefs) {
  if (!prefs.budget) return 0;
  const price = Number(bike.selling_price);
  if (prefs.budget === "custom") {
    const min = prefs.customMin ? Number(prefs.customMin) : 0;
    const max = prefs.customMax ? Number(prefs.customMax) : Infinity;
    if (price >= min && price <= max) return WEIGHTS.budget;
    // Partial score if close to range
    const dist = price < min ? min - price : price - max;
    if (dist <= 10000) return WEIGHTS.budget * 0.6;
    return 0;
  }

  const ranges = {
    under80k: [0, 80000],
    "80k-100k": [80000, 100000],
    "100k-150k": [100000, 150000],
    "150k-200k": [150000, 200000],
    above200k: [200000, Infinity],
  };

  const [min, max] = ranges[prefs.budget] || [0, Infinity];
  if (price >= min && price <= max) return WEIGHTS.budget;

  // Partial: within 10k of range boundary
  const dist = price < min ? min - price : price - max;
  if (dist <= 10000) return WEIGHTS.budget * 0.5;
  return 0;
}

function scoreUsage(bike, prefs) {
  if (!prefs.usage || prefs.usage === "any") return WEIGHTS.usage;

  const cc = bike.engine_cc;
  const cond = (bike.condition || "").toLowerCase();

  let score = 0;

  // Engine CC relevance
  if (cc && USAGE_ENGINE_HINTS[prefs.usage]) {
    if (USAGE_ENGINE_HINTS[prefs.usage].includes(cc)) {
      score += WEIGHTS.usage * 0.6;
    } else {
      score += WEIGHTS.usage * 0.2; // still some score — don't eliminate
    }
  } else {
    score += WEIGHTS.usage * 0.3; // no CC data, give partial
  }

  // Condition relevance
  if (cond && USAGE_CONDITION_HINTS[prefs.usage]) {
    if (USAGE_CONDITION_HINTS[prefs.usage].includes(cond)) {
      score += WEIGHTS.usage * 0.4;
    } else {
      score += WEIGHTS.usage * 0.1;
    }
  } else {
    score += WEIGHTS.usage * 0.2;
  }

  return score;
}

function scoreBrand(bike, prefs) {
  if (!prefs.brand || prefs.brand === "any") return WEIGHTS.brand;
  if (bike.brand && bike.brand.toLowerCase() === prefs.brand.toLowerCase()) {
    return WEIGHTS.brand;
  }
  return 0;
}

function scoreEngine(bike, prefs) {
  if (!prefs.engine || prefs.engine === "any") return WEIGHTS.engine;

  const cc = bike.engine_cc;
  if (!cc) return WEIGHTS.engine * 0.2; // no data, partial

  const engineRanges = {
    "70cc": [60, 80],
    "100cc": [90, 115],
    "125cc": [120, 135],
    "150cc+": [150, Infinity],
  };

  const [min, max] = engineRanges[prefs.engine] || [0, Infinity];
  if (cc >= min && cc <= max) return WEIGHTS.engine;

  // Close match
  const dist = cc < min ? min - cc : cc - max;
  if (dist <= 10) return WEIGHTS.engine * 0.5;
  return 0;
}

function scoreYear(bike) {
  const year = bike.model_year;
  if (!year) return 0;
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  if (age <= 1) return WEIGHTS.year;
  if (age <= 3) return WEIGHTS.year * 0.7;
  if (age <= 5) return WEIGHTS.year * 0.4;
  return WEIGHTS.year * 0.2;
}

function scoreCondition(bike, prefs) {
  const cond = (bike.condition || "").toLowerCase();
  if (!cond) return 0;

  if (cond === "new" || cond === "excellent") return WEIGHTS.condition;
  if (cond === "good") return WEIGHTS.condition * 0.8;
  if (cond === "fair") return WEIGHTS.condition * 0.5;
  return WEIGHTS.condition * 0.3;
}

export function scoreBike(bike, prefs) {
  const total =
    scoreBudget(bike, prefs) +
    scoreUsage(bike, prefs) +
    scoreBrand(bike, prefs) +
    scoreEngine(bike, prefs) +
    scoreYear(bike) +
    scoreCondition(bike, prefs);

  const maxTotal = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const percentage = Math.round((total / maxTotal) * 100);

  return {
    bike,
    score: total,
    percentage: Math.min(percentage, 100),
  };
}

export function findMatchingBikes(bikes, prefs) {
  // Only available bikes
  const available = bikes.filter((b) => b.status === "available");

  const scored = available.map((bike) => {
    const result = scoreBike(bike, prefs);

    // Generate reasons
    const reasons = [];
    if (scoreBudget(bike, prefs) >= WEIGHTS.budget * 0.8) {
      reasons.push("Within your budget");
    }
    if (prefs.brand && prefs.brand !== "any" && bike.brand?.toLowerCase() === prefs.brand.toLowerCase()) {
      reasons.push("Preferred brand");
    }
    if (prefs.engine && prefs.engine !== "any" && bike.engine_cc) {
      const engineRanges = { "70cc": [60, 80], "100cc": [90, 115], "125cc": [120, 135], "150cc+": [150, Infinity] };
      const [min, max] = engineRanges[prefs.engine] || [0, Infinity];
      if (bike.engine_cc >= min && bike.engine_cc <= max) {
        reasons.push("Matching engine preference");
      }
    }
    if (prefs.usage && prefs.usage !== "any") {
      const hints = USAGE_ENGINE_HINTS[prefs.usage] || [];
      if (bike.engine_cc && hints.includes(bike.engine_cc)) {
        reasons.push("Suitable for your usage");
      }
    }
    if (bike.model_year && bike.model_year >= new Date().getFullYear() - 2) {
      reasons.push("Recent model year");
    }
    if (bike.condition && ["new", "excellent"].includes(bike.condition.toLowerCase())) {
      reasons.push("Great condition");
    }

    return { ...result, reasons };
  });

  // Sort by score descending, filter out very low matches
  return scored
    .filter((s) => s.percentage >= 20)
    .sort((a, b) => b.score - a.score);
}

// Extract unique brands from available bikes
export function getAvailableBrands(bikes) {
  const brands = [...new Set(bikes.filter((b) => b.status === "available" && b.brand).map((b) => b.brand))];
  return brands.sort();
}

// Extract available engine CC categories from inventory
export function getAvailableEngineCategories(bikes) {
  const ccs = bikes.filter((b) => b.status === "available" && b.engine_cc).map((b) => b.engine_cc);
  if (ccs.length === 0) return [];

  const categories = new Set();
  ccs.forEach((cc) => {
    if (cc <= 80) categories.add("70cc");
    else if (cc <= 115) categories.add("100cc");
    else if (cc <= 135) categories.add("125cc");
    else categories.add("150cc+");
  });

  const order = ["70cc", "100cc", "125cc", "150cc+"];
  return order.filter((c) => categories.has(c));
}

// Generate WhatsApp message from preferences
export function generateWhatsAppMessage(prefs) {
  const budgetLabels = {
    under80k: "Under Rs. 80,000",
    "80k-100k": "Rs. 80,000 – 100,000",
    "100k-150k": "Rs. 100,000 – 150,000",
    "150k-200k": "Rs. 150,000 – 200,000",
    above200k: "Above Rs. 200,000",
    custom: prefs.customMin || prefs.customMax
      ? `Rs. ${Number(prefs.customMin || 0).toLocaleString()} – ${Number(prefs.customMax || "∞").toLocaleString()}`
      : "Any budget",
  };

  const usageLabels = {
    daily: "Daily Use",
    long: "Long Routes",
    performance: "Performance",
    business: "Business / Delivery",
    any: "No preference",
  };

  const lines = [
    "Assalamualaikum BinAthar Motors,",
    "I am looking for a motorcycle with the following preferences:",
    "",
    `Budget: ${budgetLabels[prefs.budget] || "Any"}`,
    `Usage: ${usageLabels[prefs.usage] || "No preference"}`,
    `Preferred Brand: ${prefs.brand && prefs.brand !== "any" ? prefs.brand : "Any"}`,
    `Engine Preference: ${prefs.engine && prefs.engine !== "any" ? prefs.engine : "Any"}`,
    "",
    "Please let me know if you have a suitable bike available.",
  ];

  return lines.join("\n");
}
