import { useState, useRef } from "react";
import { FaImage, FaTrash, FaStar } from "react-icons/fa";
import api from "../../api/axios";

const BikeForm = ({ bike, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    brand: bike?.brand || "",
    model: bike?.model || "",
    model_year: bike?.model_year || "",
    selling_price: bike?.selling_price || "",
    color: bike?.color || "",
    engine_cc: bike?.engine_cc || "",
    registration_city: bike?.registration_city || "",
    condition: bike?.condition || "Good",
    status: bike?.status || "available",
    description: bike?.description || "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(bike?.images || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (bikeId) => {
    if (files.length === 0) return;
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    await api.post(`/bikes/${bikeId}/images`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const deleteExistingImage = async (imageId) => {
    try {
      await api.delete(`/bikes/${bike.id}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError("Failed to delete image");
    }
  };

  const setCover = async (imageId) => {
    try {
      await api.put(`/bikes/${bike.id}/images/${imageId}/cover`);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_cover: img.id === imageId }))
      );
    } catch {
      setError("Failed to set cover");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        model_year: Number(form.model_year),
        selling_price: Number(form.selling_price),
        engine_cc: form.engine_cc ? Number(form.engine_cc) : undefined,
      };

      let bikeId;
      if (bike) {
        const res = await api.put(`/bikes/${bike.id}`, payload);
        bikeId = bike.id;
      } else {
        const res = await api.post("/bikes", payload);
        bikeId = res.data.bike.id;
      }

      await uploadImages(bikeId);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save bike");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-text-heading dark:text-dark-text-heading">
        {bike ? "Edit Bike" : "Add New Bike"}
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Brand *</label>
          <input name="brand" value={form.brand} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Model *</label>
          <input name="model" value={form.model} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Year *</label>
          <input name="model_year" type="number" min="1900" max="2030" value={form.model_year} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Price (Rs.) *</label>
          <input name="selling_price" type="number" min="0" value={form.selling_price} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Color</label>
          <input name="color" value={form.color} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Engine (cc)</label>
          <input name="engine_cc" type="number" min="0" value={form.engine_cc} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Registration City</label>
        <input name="registration_city" value={form.registration_city} onChange={handleChange} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Condition *</label>
          <select name="condition" value={form.condition} onChange={handleChange} required className={inputClass}>
            <option value="New">New</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Description</label>
        <textarea name="description" rows={3} value={form.description} onChange={handleChange} className={`${inputClass} resize-none`} />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-2">Photos</label>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border dark:border-dark-border">
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {!img.is_cover && (
                    <button type="button" onClick={() => setCover(img.id)} className="p-1 rounded bg-white/20 hover:bg-white/40 text-white" title="Set as cover">
                      <FaStar size={10} />
                    </button>
                  )}
                  <button type="button" onClick={() => deleteExistingImage(img.id)} className="p-1 rounded bg-red-500/60 hover:bg-red-500 text-white" title="Delete">
                    <FaTrash size={10} />
                  </button>
                </div>
                {img.is_cover && (
                  <span className="absolute top-0.5 left-0.5 text-[9px] bg-primary text-white px-1 rounded">Cover</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border dark:border-dark-border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-0.5 right-0.5 p-1 rounded bg-red-500/60 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:border-primary hover:text-primary transition-colors text-sm"
        >
          <FaImage /> Add Photos
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">JPG, PNG or WebP. Max 5MB each, up to 10 photos.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
          {saving ? "Saving..." : bike ? "Update Bike" : "Add Bike"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-border dark:border-dark-border text-text dark:text-dark-text text-sm hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BikeForm;
