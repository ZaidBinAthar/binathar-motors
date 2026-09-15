import { useCallback } from "react";

const STORAGE_KEY = "bm_visitor";
const MAX_RECENT = 20;
const MAX_BRANDS = 10;

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { recentViewed: [], viewedBrands: [], priceRanges: [] };
  } catch {
    return { recentViewed: [], viewedBrands: [], priceRanges: [] };
  }
};

const write = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export const useVisitorBehavior = () => {
  const trackView = useCallback((bike) => {
    const data = read();

    // Add to recently viewed (deduplicate, keep most recent)
    data.recentViewed = data.recentViewed.filter((r) => r.id !== bike.id);
    data.recentViewed.unshift({
      id: bike.id,
      brand: bike.brand,
      model: bike.model,
      model_year: bike.model_year,
      price: bike.selling_price,
      engine_cc: bike.engine_cc,
      condition: bike.condition,
      timestamp: Date.now(),
    });
    data.recentViewed = data.recentViewed.slice(0, MAX_RECENT);

    // Track viewed brands
    if (bike.brand && !data.viewedBrands.includes(bike.brand)) {
      data.viewedBrands.unshift(bike.brand);
      data.viewedBrands = data.viewedBrands.slice(0, MAX_BRANDS);
    }

    // Track approximate price ranges ( buckets: under 50k, 50-100k, 100-200k, 200k+)
    if (bike.selling_price) {
      const bucket =
        bike.selling_price < 50000 ? "under50k"
        : bike.selling_price < 100000 ? "50k-100k"
        : bike.selling_price < 200000 ? "100k-200k"
        : "200k+";
      if (!data.priceRanges.includes(bucket)) {
        data.priceRanges.push(bucket);
      }
    }

    write(data);
  }, []);

  const getBehavior = useCallback(() => read(), []);

  const getRecentIds = useCallback(() => {
    return read().recentViewed.map((r) => r.id);
  }, []);

  const getTopBrands = useCallback(() => {
    return read().viewedBrands.slice(0, 5);
  }, []);

  const getPreferredPriceRange = useCallback(() => {
    const data = read();
    if (data.recentViewed.length === 0) return null;
    const prices = data.recentViewed.map((r) => r.price).filter(Boolean);
    if (prices.length === 0) return null;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { min: avg * 0.6, max: avg * 1.4 };
  }, []);

  const clearBehavior = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { trackView, getBehavior, getRecentIds, getTopBrands, getPreferredPriceRange, clearBehavior };
};
