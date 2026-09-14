import { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import api from "../api/axios";

const WriteReview = ({ bikeId, bikeName, onClose, onSubmitted }) => {
  const [form, setForm] = useState({
    customer_name: "",
    rating: 0,
    review_text: "",
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) {
      setError("Please select a rating");
      return;
    }
    if (form.review_text.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/reviews", {
        customer_name: form.customer_name,
        rating: form.rating,
        review_text: form.review_text,
        bike_id: bikeId || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSubmitted?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-md animate-page-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading">
            Write a Review
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStar size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-1">
              Thank you!
            </p>
            <p className="text-sm text-text-muted dark:text-dark-text-muted">
              Your review has been submitted and will appear after moderation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {bikeName && (
              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                Reviewing: <span className="font-medium text-text-heading dark:text-dark-text-heading">{bikeName}</span>
              </p>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-heading dark:text-dark-text-heading mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                placeholder="Enter your name"
                required
                className={inputClass}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-text-heading dark:text-dark-text-heading mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <FaStar
                      size={28}
                      className={
                        star <= (hoveredStar || form.rating)
                          ? "text-yellow-400"
                          : "text-gray-200 dark:text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-text-heading dark:text-dark-text-heading mb-1">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.review_text}
                onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                placeholder="Share your experience with BinAthar Motors..."
                required
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-border dark:border-dark-border text-text dark:text-dark-text rounded-lg text-sm font-medium hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WriteReview;
