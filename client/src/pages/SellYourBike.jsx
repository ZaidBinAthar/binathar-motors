import { useState, useRef } from "react";
import { FaMotorcycle, FaCheckCircle, FaPhone, FaEnvelope, FaUser, FaImage, FaTimes } from "react-icons/fa";
import api from "../api/axios";

const SellYourBike = () => {
  const [form, setForm] = useState({
    seller_name: "",
    seller_phone: "",
    seller_email: "",
    brand: "",
    model: "",
    model_year: "",
    expected_price: "",
    color: "",
    engine_cc: "",
    registration_city: "",
    condition: "Good",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) {
      setError("You can upload a maximum of 5 images.");
      return;
    }
    const newFiles = [...files, ...selected].slice(0, 5);
    setFiles(newFiles);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
    setError("");
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    URL.revokeObjectURL(previews[index]);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("seller_name", form.seller_name);
      formData.append("seller_phone", form.seller_phone);
      if (form.seller_email) formData.append("seller_email", form.seller_email);
      formData.append("brand", form.brand);
      formData.append("model", form.model);
      formData.append("model_year", Number(form.model_year));
      formData.append("expected_price", Number(form.expected_price));
      if (form.color) formData.append("color", form.color);
      if (form.engine_cc) formData.append("engine_cc", Number(form.engine_cc));
      if (form.registration_city) formData.append("registration_city", form.registration_city);
      formData.append("condition", form.condition);
      if (form.description) formData.append("description", form.description);

      for (const file of files) {
        formData.append("images", file);
      }

      await api.post("/sell-requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border p-10">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
            Request Submitted!
          </h1>
          <p className="text-text-muted dark:text-dark-text-muted mb-6">
            Thank you for wanting to sell your bike to us. Our team will review your submission and contact you shortly.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFiles([]);
              setPreviews([]);
              setForm({
                seller_name: "",
                seller_phone: "",
                seller_email: "",
                brand: "",
                model: "",
                model_year: "",
                expected_price: "",
                color: "",
                engine_cc: "",
                registration_city: "",
                condition: "Good",
                description: "",
              });
            }}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaMotorcycle className="text-primary text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
          Sell Your Bike to Us
        </h1>
        <p className="text-text-muted dark:text-dark-text-muted max-w-lg mx-auto">
          Want to sell your motorcycle? Fill out the form below and we&apos;ll get back to you with an offer. It&apos;s quick and hassle-free.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Seller Info */}
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h2 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-4 flex items-center gap-2">
            <FaUser size={14} className="text-primary" /> Your Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Full Name *</label>
              <input
                name="seller_name"
                value={form.seller_name}
                onChange={handleChange}
                required
                placeholder="e.g. Ahmed Khan"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1 flex items-center gap-1">
                <FaPhone size={10} /> Phone Number *
              </label>
              <input
                name="seller_phone"
                value={form.seller_phone}
                onChange={handleChange}
                required
                placeholder="e.g. 03001234567"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1 flex items-center gap-1">
              <FaEnvelope size={10} /> Email (optional)
            </label>
            <input
              name="seller_email"
              type="email"
              value={form.seller_email}
              onChange={handleChange}
              placeholder="e.g. ahmed@example.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Bike Info */}
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h2 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-4 flex items-center gap-2">
            <FaMotorcycle size={14} className="text-primary" /> Bike Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Brand *</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="e.g. Honda"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Model *</label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                placeholder="e.g. CB 150"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Year *</label>
              <input
                name="model_year"
                type="number"
                min="1900"
                max="2030"
                value={form.model_year}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Expected Price (Rs.) *</label>
              <input
                name="expected_price"
                type="number"
                min="0"
                value={form.expected_price}
                onChange={handleChange}
                required
                placeholder="Your asking price"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Color</label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="e.g. Red"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Engine (cc)</label>
              <input
                name="engine_cc"
                type="number"
                min="0"
                value={form.engine_cc}
                onChange={handleChange}
                placeholder="e.g. 150"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Registration City</label>
              <input
                name="registration_city"
                value={form.registration_city}
                onChange={handleChange}
                placeholder="e.g. Lahore"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Condition *</label>
              <select name="condition" value={form.condition} onChange={handleChange} required className={inputClass}>
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Tell us about your bike — mileage, any new parts, special features, etc."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Bike Photos */}
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h2 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-4 flex items-center gap-2">
            <FaImage size={14} className="text-primary" /> Bike Photos
          </h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mb-4">
            Upload up to 5 photos of your bike. Clear photos help us evaluate your bike faster.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFiles}
            className="hidden"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-border dark:border-dark-border" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes size={10} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border dark:border-dark-border rounded-lg py-6 text-text-muted dark:text-dark-text-muted hover:border-primary hover:text-primary transition-colors text-sm flex flex-col items-center gap-2"
            >
              <FaImage size={20} />
              <span>Click to upload photos ({files.length}/5)</span>
              <span className="text-xs text-text-muted dark:text-dark-text-muted">JPEG, PNG, or WebP — Max 5MB each</span>
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm"
        >
          {saving ? "Submitting..." : "Submit Sell Request"}
        </button>

        <p className="text-xs text-center text-text-muted dark:text-dark-text-muted">
          By submitting, you agree that our team may contact you regarding your bike.
        </p>
      </form>
    </div>
  );
};

export default SellYourBike;
