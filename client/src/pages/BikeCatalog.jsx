import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaSlidersH, FaTimes, FaChevronDown, FaChevronUp, FaMotorcycle } from "react-icons/fa";
import api from "../api/axios";
import BikeCard from "../components/BikeCard";
import ScrollReveal from "../components/ScrollReveal";
import { BikeCardSkeleton } from "../components/Skeleton";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "year-new", label: "Year: Newest" },
  { value: "year-old", label: "Year: Oldest" },
];

const CONDITION_OPTIONS = ["New", "Excellent", "Good", "Average"];

const INITIAL_FILTERS = {
  search: "",
  brand: "",
  model: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  condition: "",
  engineCc: "",
  sort: "newest",
};

const BikeCatalog = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    year: true,
    condition: false,
    engine: false,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const readFiltersFromURL = useCallback(() => {
    const f = {};
    for (const key of Object.keys(INITIAL_FILTERS)) {
      f[key] = searchParams.get(key) || INITIAL_FILTERS[key];
    }
    return f;
  }, [searchParams]);

  const [filters, setFilters] = useState(readFiltersFromURL);

  useEffect(() => {
    setFilters(readFiltersFromURL());
  }, [searchParams, readFiltersFromURL]);

  useEffect(() => {
    api
      .get("/bikes")
      .then((res) => setBikes(res.data.bikes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateFilter = useCallback(
    (key, value) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (v && v !== INITIAL_FILTERS[k]) params.set(k, v);
      }
      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const brands = useMemo(() => [...new Set(bikes.map((b) => b.brand))].sort(), [bikes]);

  const models = useMemo(() => {
    if (!filters.brand) return [...new Set(bikes.map((b) => b.model))].sort();
    return [...new Set(bikes.filter((b) => b.brand === filters.brand).map((b) => b.model))].sort();
  }, [bikes, filters.brand]);

  const engineOptions = useMemo(() => {
    const cc = [...new Set(bikes.map((b) => b.engine_cc).filter(Boolean))].sort((a, b) => a - b);
    return cc;
  }, [bikes]);

  const yearRange = useMemo(() => {
    const years = bikes.map((b) => b.model_year).filter(Boolean);
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [bikes]);

  const priceRange = useMemo(() => {
    const prices = bikes.map((b) => b.selling_price).filter(Boolean);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [bikes]);

  const filtered = useMemo(() => {
    return bikes
      .filter((b) => {
        const kw = filters.search.toLowerCase();
        if (kw) {
          const haystack = `${b.brand} ${b.model} ${b.description || ""} ${b.registration_city || ""}`.toLowerCase();
          if (!haystack.includes(kw)) return false;
        }
        if (filters.brand && b.brand !== filters.brand) return false;
        if (filters.model && b.model !== filters.model) return false;
        if (filters.condition && b.condition !== filters.condition) return false;
        if (filters.engineCc && String(b.engine_cc) !== filters.engineCc) return false;
        if (filters.minPrice && b.selling_price < Number(filters.minPrice)) return false;
        if (filters.maxPrice && b.selling_price > Number(filters.maxPrice)) return false;
        if (filters.minYear && b.model_year < Number(filters.minYear)) return false;
        if (filters.maxYear && b.model_year > Number(filters.maxYear)) return false;
        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case "price-low": return a.selling_price - b.selling_price;
          case "price-high": return b.selling_price - a.selling_price;
          case "year-new": return b.model_year - a.model_year;
          case "year-old": return a.model_year - b.model_year;
          default: return 0;
        }
      });
  }, [bikes, filters]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.brand) c++;
    if (filters.model) c++;
    if (filters.minPrice) c++;
    if (filters.maxPrice) c++;
    if (filters.minYear) c++;
    if (filters.maxYear) c++;
    if (filters.condition) c++;
    if (filters.engineCc) c++;
    return c;
  }, [filters]);

  const filterSection = (title, sectionKey, children) => (
    <div className="border-b border-border dark:border-dark-border pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-text-heading dark:text-dark-text-heading mb-2"
      >
        {title}
        {expandedSections[sectionKey] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </button>
      {expandedSections[sectionKey] && children}
    </div>
  );

  const filterContent = (
    <div className="space-y-0">
      {/* Brand */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Brand</label>
        <select
          value={filters.brand}
          onChange={(e) => {
            updateFilter("brand", e.target.value);
            if (e.target.value) updateFilter("model", "");
          }}
          className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Model</label>
        <select
          value={filters.model}
          onChange={(e) => updateFilter("model", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">All Models</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      {filterSection("Price Range", "price", (
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`Min (${priceRange.min?.toLocaleString()})`}
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-1/2 px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="number"
            placeholder={`Max (${priceRange.max?.toLocaleString()})`}
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-1/2 px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      ))}

      {/* Year */}
      {filterSection("Model Year", "year", (
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`From (${yearRange.min})`}
            value={filters.minYear}
            onChange={(e) => updateFilter("minYear", e.target.value)}
            className="w-1/2 px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="number"
            placeholder={`To (${yearRange.max})`}
            value={filters.maxYear}
            onChange={(e) => updateFilter("maxYear", e.target.value)}
            className="w-1/2 px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      ))}

      {/* Condition */}
      {filterSection("Condition", "condition", (
        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => updateFilter("condition", filters.condition === c ? "" : c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filters.condition === c
                  ? "bg-primary text-white border-primary"
                  : "bg-surface dark:bg-dark-surface text-text dark:text-dark-text border-border dark:border-dark-border hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      ))}

      {/* Engine CC */}
      {engineOptions.length > 0 && filterSection("Engine Capacity", "engine", (
        <div className="flex flex-wrap gap-2">
          {engineOptions.map((cc) => (
            <button
              key={cc}
              onClick={() => updateFilter("engineCc", filters.engineCc === String(cc) ? "" : String(cc))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filters.engineCc === String(cc)
                  ? "bg-primary text-white border-primary"
                  : "bg-surface dark:bg-dark-surface text-text dark:text-dark-text border-border dark:border-dark-border hover:border-primary/50"
              }`}
            >
              {cc}cc
            </button>
          ))}
        </div>
      ))}

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full mt-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-1">
            Browse Bikes
          </h1>
          <p className="text-sm text-text-muted dark:text-dark-text-muted">
            {loading ? "Loading..." : `${filtered.length} bike${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {/* Search bar + mobile filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted" />
          <input
            type="text"
            placeholder="Search by brand, model, or keyword..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-alt text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>

        {/* Sort (desktop) */}
        <select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="hidden sm:block px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-alt text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface-alt text-text dark:text-dark-text text-sm font-medium"
        >
          <FaSlidersH size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-primary text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.brand && (
            <Chip label={filters.brand} onRemove={() => updateFilter("brand", "")} />
          )}
          {filters.model && (
            <Chip label={filters.model} onRemove={() => updateFilter("model", "")} />
          )}
          {filters.minPrice && (
            <Chip label={`Min Rs. ${Number(filters.minPrice).toLocaleString()}`} onRemove={() => updateFilter("minPrice", "")} />
          )}
          {filters.maxPrice && (
            <Chip label={`Max Rs. ${Number(filters.maxPrice).toLocaleString()}`} onRemove={() => updateFilter("maxPrice", "")} />
          )}
          {filters.minYear && (
            <Chip label={`From ${filters.minYear}`} onRemove={() => updateFilter("minYear", "")} />
          )}
          {filters.maxYear && (
            <Chip label={`To ${filters.maxYear}`} onRemove={() => updateFilter("maxYear", "")} />
          )}
          {filters.condition && (
            <Chip label={filters.condition} onRemove={() => updateFilter("condition", "")} />
          )}
          {filters.engineCc && (
            <Chip label={`${filters.engineCc}cc`} onRemove={() => updateFilter("engineCc", "")} />
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-red-600 dark:text-red-400 hover:underline px-1"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden sm:block w-64 shrink-0">
          <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            {filterContent}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <BikeCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FaMotorcycle className="text-5xl text-text-muted dark:text-dark-text-muted mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium text-text-heading dark:text-dark-text-heading mb-2">
                No bikes found
              </p>
              <p className="text-sm text-text-muted dark:text-dark-text-muted mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((bike, i) => (
                <ScrollReveal key={bike.id} delay={i * 60}>
                  <BikeCard bike={bike} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-dark-surface shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white dark:bg-dark-surface border-b border-border dark:border-dark-border px-4 py-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-heading dark:text-dark-text-heading">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="p-4">
              {/* Sort (mobile) */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {filterContent}
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-dark-surface border-t border-border dark:border-dark-border p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
              >
                Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-primary-dark">
      <FaTimes size={10} />
    </button>
  </span>
);

export default BikeCatalog;
