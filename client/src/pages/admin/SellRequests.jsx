import { useState, useEffect } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle, FaTrash, FaPhone, FaEnvelope, FaMotorcycle, FaExchangeAlt, FaImage } from "react-icons/fa";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const STATUS_TABS = [
  { key: "pending", label: "Pending", icon: FaClock },
  { key: "accepted", label: "Accepted", icon: FaCheckCircle },
  { key: "rejected", label: "Rejected", icon: FaTimesCircle },
];

const SellRequests = () => {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, accepted: 0, rejected: 0 });
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionType, setActionType] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [convertPrice, setConvertPrice] = useState("");
  const [processing, setProcessing] = useState(false);
  const { isOwner } = useAuth();

  const load = () => {
    setLoading(true);
    api
      .get("/sell-requests", { params: { status: filter } })
      .then((res) => {
        setRequests(res.data.sellRequests || []);
        setCounts(res.data.counts || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const openAction = (req, type) => {
    setActionModal(req);
    setActionType(type);
    setAdminNote("");
    setConvertPrice(type === "convert" ? req.expected_price : "");
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await api.put(`/sell-requests/${actionModal.id}/status`, {
        status: "rejected",
        admin_note: adminNote || null,
      });
      setActionModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const handleConvert = async () => {
    setProcessing(true);
    try {
      await api.post(`/sell-requests/${actionModal.id}/convert`, {
        selling_price: Number(convertPrice) || undefined,
        admin_note: adminNote || null,
      });
      setActionModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to convert");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this sell request?")) return;
    try {
      await api.delete(`/sell-requests/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading">Sell Requests</h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted">Manage bike sell requests from customers</p>
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
                  : key === "accepted"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-surface-alt dark:bg-dark-surface-alt text-text-muted dark:text-dark-text-muted hover:bg-border dark:hover:bg-dark-border"
            }`}
          >
            <Icon size={14} />
            {label}
            <span
              className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                filter === key ? "bg-white/30 dark:bg-black/20" : "bg-border dark:bg-dark-border"
              }`}
            >
              {counts[key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <FaMotorcycle className="text-4xl text-text-muted dark:text-dark-text-muted mx-auto mb-4 opacity-40" />
          <p className="text-text-muted dark:text-dark-text-muted">No {filter} sell requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((sr) => (
            <div
              key={sr.id}
              className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sr.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : sr.status === "accepted"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {sr.status}
                    </span>
                    <span className="text-xs text-text-muted dark:text-dark-text-muted">{formatDate(sr.created_at)}</span>
                  </div>

                  {/* Bike info */}
                  <p className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-1">
                    {sr.brand} {sr.model} ({sr.model_year})
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted dark:text-dark-text-muted mb-2">
                    {sr.color && <span>{sr.color}</span>}
                    {sr.engine_cc && <span>{sr.engine_cc}cc</span>}
                    {sr.registration_city && <span>{sr.registration_city}</span>}
                    <span>Condition: {sr.condition}</span>
                    <span className="font-medium text-primary">Rs. {Number(sr.expected_price).toLocaleString()}</span>
                    {sr.bike_images && sr.bike_images.length > 0 && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <FaImage size={10} /> {sr.bike_images.length} photo{sr.bike_images.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Seller info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted dark:text-dark-text-muted">
                    <span className="font-medium text-text-heading dark:text-dark-text-heading">{sr.seller_name}</span>
                    <span className="flex items-center gap-1"><FaPhone size={10} /> {sr.seller_phone}</span>
                    {sr.seller_email && <span className="flex items-center gap-1"><FaEnvelope size={10} /> {sr.seller_email}</span>}
                  </div>

                  {sr.description && (
                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-2 line-clamp-2">{sr.description}</p>
                  )}

                  {sr.admin_note && (
                    <p className="text-xs text-primary mt-2 italic">Note: {sr.admin_note}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {sr.status === "pending" && (
                    <>
                      <button
                        onClick={() => openAction(sr, "convert")}
                        className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-text-muted hover:text-green-600 transition-colors"
                        title="Accept & Add to Stock"
                      >
                        <FaExchangeAlt size={14} />
                      </button>
                      <button
                        onClick={() => openAction(sr, "reject")}
                        className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-text-muted hover:text-yellow-600 transition-colors"
                        title="Reject"
                      >
                        <FaTimesCircle size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setDetail(detail?.id === sr.id ? null : sr)}
                    className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    {detail?.id === sr.id ? "Close" : "View"}
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(sr.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {detail?.id === sr.id && (
                <div className="mt-4 pt-4 border-t border-border dark:border-dark-border animate-page-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Seller</span>
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{sr.seller_name}</p>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Phone</span>
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{sr.seller_phone}</p>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Email</span>
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{sr.seller_email || "—"}</p>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Year</span>
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{sr.model_year}</p>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Engine</span>
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{sr.engine_cc ? `${sr.engine_cc}cc` : "—"}</p>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Color</span>
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{sr.color || "—"}</p>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Registration</span>
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{sr.registration_city || "—"}</p>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-dark-text-muted">Expected Price</span>
                      <p className="font-medium text-primary">Rs. {Number(sr.expected_price).toLocaleString()}</p>
                    </div>
                  </div>
                  {sr.description && (
                    <div className="mt-3">
                      <span className="text-xs text-text-muted dark:text-dark-text-muted">Description</span>
                      <p className="text-sm text-text dark:text-dark-text mt-1">{sr.description}</p>
                    </div>
                  )}
                  {sr.bike_images && sr.bike_images.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-text-muted dark:text-dark-text-muted">Bike Photos ({sr.bike_images.length})</span>
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        {sr.bike_images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Bike photo ${i + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-border dark:border-dark-border shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-4">
              {actionType === "convert" ? "Accept & Add to Stock" : "Reject Sell Request"}
            </h3>

            <div className="bg-surface-alt dark:bg-dark-surface rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-text-heading dark:text-dark-text-heading">
                {actionModal.brand} {actionModal.model} ({actionModal.model_year})
              </p>
              <p className="text-text-muted dark:text-dark-text-muted text-xs mt-1">
                Seller: {actionModal.seller_name} | Expected: Rs. {Number(actionModal.expected_price).toLocaleString()}
              </p>
            </div>

            {actionType === "convert" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
                  Selling Price (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={convertPrice}
                  onChange={(e) => setConvertPrice(e.target.value)}
                  placeholder="Set the selling price"
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                  Leave empty to use the seller&apos;s expected price.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">
                Admin Note (optional)
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add any notes..."
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={actionType === "convert" ? handleConvert : handleReject}
                disabled={processing}
                className={`flex-1 py-2.5 rounded-lg font-medium text-white text-sm transition-colors disabled:opacity-50 ${
                  actionType === "convert"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {processing ? "Processing..." : actionType === "convert" ? "Accept & Add to Stock" : "Reject"}
              </button>
              <button
                onClick={() => setActionModal(null)}
                disabled={processing}
                className="px-4 py-2.5 rounded-lg border border-border dark:border-dark-border text-text dark:text-dark-text text-sm hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellRequests;
