/**
 * Bike Recommendation Engine
 * Client-side scoring system. No external API required.
 */

const WEIGHTS = {
  sameBrand: 30,
  sameModelWord: 12,
  sameEngine: 15,
  priceClose: 12,
  priceVeryClose: 8,
  sameYear: 10,
  nearYear: 5,
  sameCondition: 6,
  availableBonus: 15,
  recentlyViewedPenalty: -50,
  sameBrandFromHistory: 10,
  priceInRange: 8,
};

function scoreSimilarity(bike, currentBike, recentlyViewedIds = []) {
  let score = 0;

  // Same brand
  if (bike.brand === currentBike.brand) score += WEIGHTS.sameBrand;

  // Shared model name words (meaningful words, 3+ chars)
  if (bike.model && currentBike.model) {
    const otherWords = bike.model.toLowerCase().split(/\s+/);
    const currentWords = currentBike.model.toLowerCase().split(/\s+/);
    const shared = otherWords.filter((w) => currentWords.includes(w) && w.length > 2);
    score += shared.length * WEIGHTS.sameModelWord;
  }

  // Same engine CC
  if (bike.engine_cc && currentBike.engine_cc && bike.engine_cc === currentBike.engine_cc) {
    score += WEIGHTS.sameEngine;
  }

  // Price proximity
  if (bike.selling_price && currentBike.selling_price) {
    const diff = Math.abs(bike.selling_price - currentBike.selling_price) / currentBike.selling_price;
    if (diff <= 0.05) score += WEIGHTS.priceVeryClose;
    else if (diff <= 0.15) score += WEIGHTS.priceClose;
    else if (diff <= 0.25) score += WEIGHTS.priceClose * 0.5;
  }

  // Year proximity
  if (bike.model_year && currentBike.model_year) {
    if (bike.model_year === currentBike.model_year) score += WEIGHTS.sameYear;
    else if (Math.abs(bike.model_year - currentBike.model_year) === 1) score += WEIGHTS.nearYear;
  }

  // Same condition
  if (bike.condition && currentBike.condition && bike.condition === currentBike.condition) {
    score += WEIGHTS.sameCondition;
  }

  // Available bonus
  if (bike.status === "available") score += WEIGHTS.availableBonus;

  // Penalty if recently viewed
  if (recentlyViewedIds.includes(bike.id)) score += WEIGHTS.recentlyViewedPenalty;

  return score;
}

function scoreForRecentViews(bike, recentViews, viewedBrands) {
  let score = 0;

  // Boost bikes from brands the visitor has viewed
  if (viewedBrands.includes(bike.brand)) score += WEIGHTS.sameBrandFromHistory;

  // Check price range alignment with recently viewed
  if (recentViews.length > 0) {
    const avgPrice = recentViews.reduce((s, v) => s + (v.price || 0), 0) / recentViews.length;
    if (bike.selling_price && avgPrice > 0) {
      const diff = Math.abs(bike.selling_price - avgPrice) / avgPrice;
      if (diff <= 0.3) score += WEIGHTS.priceInRange;
    }
  }

  if (bike.status === "available") score += 8;

  return score;
}

function scoreForBudget(bike, priceRange) {
  if (!priceRange || !bike.selling_price) return 0;
  let score = 0;

  if (bike.selling_price >= priceRange.min && bike.selling_price <= priceRange.max) {
    score += 25;
  } else {
    const dist = bike.selling_price < priceRange.min
      ? (priceRange.min - bike.selling_price) / priceRange.min
      : (bike.selling_price - priceRange.max) / priceRange.max;
    if (dist <= 0.2) score += 15;
    else if (dist <= 0.4) score += 8;
  }

  if (bike.status === "available") score += 10;

  return score;
}

/**
 * Get "Similar Bikes" — based on current bike specs
 */
export function getSimilarBikes(bike, allBikes, recentlyViewedIds = [], limit = 6) {
  return allBikes
    .filter((b) => b.id !== bike.id)
    .map((b) => ({ ...b, _score: scoreSimilarity(b, bike, recentlyViewedIds) }))
    .filter((b) => b._score > 10)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

/**
 * Get "Based on Your Recent Views" — from visitor behavior
 */
export function getRecentViewRecommendations(bike, allBikes, recentViews, viewedBrands, recentlyViewedIds, limit = 6) {
  if (recentViews.length === 0) return [];

  return allBikes
    .filter((b) => b.id !== bike.id && !recentlyViewedIds.includes(b.id))
    .map((b) => ({ ...b, _score: scoreForRecentViews(b, recentViews, viewedBrands) }))
    .filter((b) => b._score > 5)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

/**
 * Get "More Bikes in Your Budget" — based on price range preferences
 */
export function getBudgetRecommendations(bike, allBikes, priceRange, limit = 6) {
  if (!priceRange) return [];

  return allBikes
    .filter((b) => b.id !== bike.id && b.status === "available")
    .map((b) => ({ ...b, _score: scoreForBudget(b, priceRange) }))
    .filter((b) => b._score > 10)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}
