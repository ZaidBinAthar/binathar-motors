import { useState, useEffect } from "react";
import { FaCheck, FaTrash, FaStar, FaClock, FaCheckCircle, FaTimesCircle, FaUndo } from "react-icons/fa";
import api from "../../api/axios";
import StarRating from "../../components/StarRating";
import { useAuth } from "../../context/AuthContext";

const STATUS_TABS = [
  { key: "pending", label: "Pending", icon: FaClock },
  { key: "approved", label: "Approved", icon: FaCheckCircle },
  { key: "rejected", label: "Rejected", icon: FaTimesCircle },
];

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const { isOwner } = useAuth();

  const load = () => {
    setLoading(true);
    api
      .get("/reviews", { params: { status: filter } })
      .then((res) => {
        setReviews(res.data.reviews || []);
        setCounts(res.data.counts || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/reviews/${id}/status`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading">Reviews Management</h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted">Moderate customer reviews</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? key === "pending"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : key === "approved"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-surface-alt dark:bg-dark-surface-alt text-text-muted dark:text-dark-text-muted hover:bg-border dark:hover:bg-dark-border"
            }`}
          >
            <Icon size={14} />
            {label}
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              filter === key ? "bg-white/30 dark:bg-black/20" : "bg-border dark:bg-dark-border"
            }`}>
              {counts[key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <FaStar className="text-4xl text-text-muted dark:text-dark-text-muted mx-auto mb-4 opacity-40" />
          <p className="text-text-muted dark:text-dark-text-muted">
            No {filter} reviews
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={review.rating} size={14} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      review.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : review.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {review.status}
                    </span>
                  </div>

                  <p className="text-sm text-text dark:text-dark-text mb-2">
                    &ldquo;{review.review_text}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 text-xs text-text-muted dark:text-dark-text-muted">
                    <span className="font-medium text-text-heading dark:text-dark-text-heading">
                      {review.customer_name}
                    </span>
                    {review.brand && (
                      <span>
                        Purchased: {review.brand} {review.model} {review.model_year}
                      </span>
                    )}
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => handleStatus(review.id, "approved")}
                      className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-text-muted hover:text-green-600 transition-colors"
                      title="Approve"
                    >
                      <FaCheck size={14} />
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => handleStatus(review.id, "rejected")}
                      className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-text-muted hover:text-yellow-600 transition-colors"
                      title="Reject"
                    >
                      <FaTimesCircle size={14} />
                    </button>
                  )}
                  {review.status !== "pending" && (
                    <button
                      onClick={() => handleStatus(review.id, "pending")}
                      className="p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface text-text-muted hover:text-primary transition-colors"
                      title="Reset to pending"
                    >
                      <FaUndo size={14} />
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
