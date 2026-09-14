import { useState } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import api from "../../api/axios";

const MarkSoldModal = ({ bike, onClose, onSaleRecorded }) => {
  const [form, setForm] = useState({
    sale_price: bike.selling_price || "",
    purchase_price: "",
    customer_name: "",
    customer_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sale_price) {
      setError("Sale price is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/sales", {
        bike_id: bike.id,
        sale_price: Number(form.sale_price),
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        customer_name: form.customer_name || null,
        customer_phone: form.customer_phone || null,
      });
      onSaleRecorded(res.data.sale, res.data.bike);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-lg animate-page-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border">
          <div>
            <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading">
              Mark as Sold
            </h2>
            <p className="text-sm text-text-muted dark:text-dark-text-muted">
              {bike.brand} {bike.model} {bike.model_year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium text-text-heading dark:text-dark-text-heading mb-1">
              Sale Price (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="sale_price"
              value={form.sale_price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Purchase Price (internal) */}
          <div>
            <label className="block text-sm font-medium text-text-heading dark:text-dark-text-heading mb-1">
              Purchase Price (Rs.)
              <span className="text-xs text-text-muted dark:text-dark-text-muted ml-1">(internal)</span>
            </label>
            <input
              type="number"
              name="purchase_price"
              value={form.purchase_price}
              onChange={handleChange}
              placeholder="Cost price (not shown on receipt)"
              className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-text-heading dark:text-dark-text-heading mb-1">
              Customer Name
            </label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Buyer's name"
              className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-sm font-medium text-text-heading dark:text-dark-text-heading mb-1">
              Customer Phone
            </label>
            <input
              type="text"
              name="customer_phone"
              value={form.customer_phone}
              onChange={handleChange}
              placeholder="Buyer's phone number"
              className="w-full px-3 py-2.5 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Summary */}
          <div className="bg-surface-alt dark:bg-dark-surface-alt rounded-lg p-4 border border-border dark:border-dark-border">
            <p className="text-xs text-text-muted dark:text-dark-text-muted mb-2 uppercase tracking-wider font-medium">Sale Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-text dark:text-dark-text">Bike</span>
              <span className="font-medium text-text-heading dark:text-dark-text-heading">{bike.brand} {bike.model} {bike.model_year}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-text dark:text-dark-text">Sale Price</span>
              <span className="font-bold text-primary">Rs. {Number(form.sale_price || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
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
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><FaCheck size={14} /> Confirm Sale</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkSoldModal;
