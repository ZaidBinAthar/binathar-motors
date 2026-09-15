import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaWhatsapp,
  FaPhone,
  FaSearch,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../api/axios";
import { CONTACT } from "../config/contact";
import BikeCard from "./BikeCard";
import { BikeCardSkeleton } from "./Skeleton";
import {
  findMatchingBikes,
  getAvailableBrands,
  getAvailableEngineCategories,
  generateWhatsAppMessage,
} from "../utils/bikeFinder";

const STEPS = ["budget", "usage", "brand", "engine"];

const BUDGET_OPTIONS = [
  { value: "under80k", label: "Under Rs. 80,000" },
  { value: "80k-100k", label: "Rs. 80,000 – 100,000" },
  { value: "100k-150k", label: "Rs. 100,000 – 150,000" },
  { value: "150k-200k", label: "Rs. 150,000 – 200,000" },
  { value: "above200k", label: "Above Rs. 200,000" },
  { value: "custom", label: "Custom Budget" },
];

const USAGE_OPTIONS = [
  { value: "daily", label: "Daily Use", icon: "🏙️", desc: "Normal city commuting" },
  { value: "long", label: "Long Routes", icon: "🛣️", desc: "Longer-distance riding" },
  { value: "performance", label: "Performance", icon: "⚡", desc: "More engine performance" },
  { value: "business", label: "Business / Delivery", icon: "💼", desc: "Frequent commercial use" },
  { value: "any", label: "Doesn't Matter", icon: "🤷", desc: "No preference" },
];

const getWhatsAppUrl = (message) => {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
};

const FindMyBike = ({ embedded = false }) => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0-3 = wizard, 4 = results
  const [prefs, setPrefs] = useState({
    budget: "",
    customMin: "",
    customMax: "",
    usage: "",
    brand: "",
    engine: "",
  });

  useEffect(() => {
    api
      .get("/bikes")
      .then((res) => setBikes(res.data.bikes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(() => getAvailableBrands(bikes), [bikes]);
  const engineCategories = useMemo(() => getAvailableEngineCategories(bikes), [bikes]);

  const results = useMemo(() => {
    if (step !== 4) return [];
    return findMatchingBikes(bikes, prefs);
  }, [step, bikes, prefs]);

  const updatePref = (key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) return !!prefs.budget;
    if (step === 1) return !!prefs.usage;
    if (step === 2) return true; // brand is optional (can be "any")
    if (step === 3) return true; // engine is optional
    return false;
  };

  const handleFind = () => setStep(4);

  const handleStartOver = () => {
    setPrefs({ budget: "", customMin: "", customMax: "", usage: "", brand: "", engine: "" });
    setStep(0);
  };

  const handleChangePrefs = () => setStep(0);

  const waMessage = generateWhatsAppMessage(prefs);
  const waUrl = getWhatsAppUrl(waMessage);

  const stepLabels = ["Budget", "Usage", "Brand", "Engine"];

  return (
    <div className={embedded ? "" : "max-w-3xl mx-auto px-4 sm:px-6 py-10"}>
      {/* Wizard Header */}
      {step < 4 && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
            🔎 Find Your Perfect Bike
          </h2>
          <p className="text-text-muted dark:text-dark-text-muted">
            Answer 4 simple questions and we'll find the best bikes for you.
          </p>
        </div>
      )}

      {/* Progress indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-surface-alt dark:bg-dark-surface-alt text-text-muted dark:text-dark-text-muted border border-border dark:border-dark-border"
                }`}
              >
                {i < step ? <FaCheck size={12} /> : i + 1}
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-border dark:bg-dark-border"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      {step < 4 && (
        <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border p-6 md:p-8 animate-page-in" key={step}>
          {/* Step 1: Budget */}
          {step === 0 && (
            <div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-1">
                What's your budget?
              </h3>
              <p className="text-sm text-text-muted dark:text-dark-text-muted mb-6">
                Step 1 of 4
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePref("budget", opt.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      prefs.budget === opt.value
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border dark:border-dark-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              {prefs.budget === "custom" && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-text-muted dark:text-dark-text-muted mb-1 block">Min Price (Rs.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={prefs.customMin}
                      onChange={(e) => updatePref("customMin", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text-heading dark:text-dark-text-heading text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-text-muted dark:text-dark-text-muted mb-1 block">Max Price (Rs.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150000"
                      value={prefs.customMax}
                      onChange={(e) => updatePref("customMax", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text-heading dark:text-dark-text-heading text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Usage */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-1">
                What will you mainly use the bike for?
              </h3>
              <p className="text-sm text-text-muted dark:text-dark-text-muted mb-6">
                Step 2 of 4
              </p>
              <div className="grid grid-cols-1 gap-3">
                {USAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePref("usage", opt.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      prefs.usage === opt.value
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border dark:border-dark-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-text-heading dark:text-dark-text-heading block">
                        {opt.label}
                      </span>
                      <span className="text-xs text-text-muted dark:text-dark-text-muted">
                        {opt.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Brand */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-1">
                Preferred brand?
              </h3>
              <p className="text-sm text-text-muted dark:text-dark-text-muted mb-6">
                Step 3 of 4
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => updatePref("brand", "any")}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    prefs.brand === "any" || !prefs.brand
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-border dark:border-dark-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl block mb-1">🏍️</span>
                  <span className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                    Any Brand
                  </span>
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => updatePref("brand", brand)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      prefs.brand === brand
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border dark:border-dark-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                      {brand}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Engine */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-1">
                Engine preference?
              </h3>
              <p className="text-sm text-text-muted dark:text-dark-text-muted mb-6">
                Step 4 of 4
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => updatePref("engine", "any")}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    prefs.engine === "any" || !prefs.engine
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-border dark:border-dark-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl block mb-1">⚙️</span>
                  <span className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                    Any Engine
                  </span>
                </button>
                {engineCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updatePref("engine", cat)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      prefs.engine === cat
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border dark:border-dark-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                      {cat}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border dark:border-dark-border">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text transition-colors"
              >
                <FaArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <FaArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFind}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FaSearch size={14} /> Find My Bikes
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {step === 4 && (
        <div>
          {/* Results header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
              🎯 Best Matches For You
            </h2>
            <p className="text-text-muted dark:text-dark-text-muted mb-4">
              {results.length > 0
                ? `Found ${results.length} bike${results.length !== 1 ? "s" : ""} matching your preferences`
                : "No exact matches found"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleChangePrefs}
                className="flex items-center gap-2 px-4 py-2 border border-border dark:border-dark-border text-text dark:text-dark-text text-sm font-medium rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors"
              >
                <FaArrowLeft size={12} /> Change Preferences
              </button>
              <button
                onClick={handleStartOver}
                className="flex items-center gap-2 px-4 py-2 border border-border dark:border-dark-border text-text dark:text-dark-text text-sm font-medium rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors"
              >
                <FaRedo size={12} /> Start Over
              </button>
            </div>
          </div>

          {/* Results grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {results.map((result, i) => (
                <div key={result.bike.id} className="animate-page-in" style={{ animationDelay: `${i * 80}ms` }}>
                  {/* Match badge */}
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      result.percentage >= 80
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : result.percentage >= 60
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                    }`}>
                      {result.percentage}% Match
                    </span>
                  </div>

                  {/* Bike card */}
                  <BikeCard bike={result.bike} />

                  {/* Reasons */}
                  {result.reasons.length > 0 && (
                    <div className="mt-2 px-3 py-2 bg-surface-alt dark:bg-dark-surface rounded-lg">
                      <p className="text-[10px] font-semibold text-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-1">
                        Why this bike?
                      </p>
                      {result.reasons.map((reason, j) => (
                        <p key={j} className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <FaCheck size={9} /> {reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* No results */
            <div className="text-center py-12 bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border mb-8">
              <p className="text-4xl mb-4">😕</p>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-2">
                Can't Find Your Perfect Bike?
              </h3>
              <p className="text-sm text-text-muted dark:text-dark-text-muted mb-6 max-w-md mx-auto">
                We couldn't find an exact match in our current inventory. Tell us what you're looking for and we'll notify you when we have something suitable.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg no-underline transition-colors"
              >
                <FaWhatsapp size={16} /> Tell BinAthar Motors What You Need
              </a>
            </div>
          )}

          {/* WhatsApp CTA for non-empty results too */}
          {results.length > 0 && (
            <div className="text-center py-8 bg-surface-alt dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border">
              <p className="text-sm text-text-muted dark:text-dark-text-muted mb-3">
                Didn't find exactly what you need?
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg no-underline transition-colors"
              >
                <FaWhatsapp size={14} /> Tell Us What You're Looking For
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindMyBike;
