import { useState, useEffect } from "react";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import api from "../api/axios";
import BikeCard from "../components/BikeCard";
import ScrollReveal from "../components/ScrollReveal";
import { BikeCardSkeleton } from "../components/Skeleton";

const BikeCatalog = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    api
      .get("/bikes")
      .then((res) => setBikes(res.data.bikes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const brands = [...new Set(bikes.map((b) => b.brand))].sort();

  const filtered = bikes
    .filter((b) => {
      const matchSearch =
        !search ||
        `${b.brand} ${b.model} ${b.description || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchBrand = !brand || b.brand === brand;
      const matchCondition = !condition || b.condition === condition;
      const matchStatus = !status || b.status === status;
      return matchSearch && matchBrand && matchCondition && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.selling_price - b.selling_price;
      if (sortBy === "price-high") return b.selling_price - a.selling_price;
      if (sortBy === "year") return b.model_year - a.model_year;
      return 0; // newest (default order from API)
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
          Browse Bikes
        </h1>
        <p className="text-text-muted dark:text-dark-text-muted">
          {filtered.length} bike{filtered.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted" />
            <input
              type="text"
              placeholder="Search bikes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Brand */}
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Condition */}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="year">Year: Newest</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <BikeCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FaSlidersH className="text-4xl text-text-muted dark:text-dark-text-muted mx-auto mb-4" />
          <p className="text-text-muted dark:text-dark-text-muted">
            No bikes match your filters
          </p>
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
  );
};

export default BikeCatalog;
