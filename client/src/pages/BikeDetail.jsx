import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaGasPump, FaMapMarkerAlt, FaCalendarAlt, FaPalette, FaInfoCircle } from "react-icons/fa";
import api from "../api/axios";

const BikeDetail = () => {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [inquiry, setInquiry] = useState({ name: "", phone: "", message: "" });
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/bikes/${id}`)
      .then((res) => {
        setBike(res.data.bike);
        setImages(res.data.images || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setInquiryError("");
    setInquiryLoading(true);

    try {
      await api.post("/inquiries", {
        bike_id: parseInt(id),
        customer_name: inquiry.name,
        customer_phone: inquiry.phone,
        message: inquiry.message,
      });
      setInquirySent(true);
      setInquiry({ name: "", phone: "", message: "" });
    } catch (err) {
      setInquiryError(err.response?.data?.message || "Failed to send inquiry");
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-text-muted dark:text-dark-text-muted text-lg mb-4">Bike not found</p>
        <Link to="/bikes" className="text-primary hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  const allImages = images.length > 0 ? images : bike.cover_image ? [{ image_url: bike.cover_image }] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/bikes"
        className="inline-flex items-center gap-2 text-sm text-text-muted dark:text-dark-text-muted hover:text-primary no-underline mb-6"
      >
        <FaArrowLeft /> Back to catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border overflow-hidden h-80 md:h-96">
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImg]?.image_url}
                alt={`${bike.brand} ${bike.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-text-muted dark:text-dark-text-muted">
                {bike.brand?.[0]}
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    activeImg === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading">
                {bike.brand} {bike.model}
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  bike.status === "available"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : bike.status === "sold"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                }`}
              >
                {bike.status}
              </span>
            </div>
            <p className="text-3xl font-bold text-primary">
              Rs. {Number(bike.selling_price).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { icon: FaCalendarAlt, label: "Year", value: bike.model_year },
              { icon: FaGasPump, label: "Engine", value: bike.engine_cc ? `${bike.engine_cc}cc` : "N/A" },
              { icon: FaMapMarkerAlt, label: "Registered in", value: bike.registration_city || "N/A" },
              { icon: FaPalette, label: "Color", value: bike.color || "N/A" },
              { icon: FaInfoCircle, label: "Condition", value: bike.condition },
            ].map((spec, i) => (
              <div
                key={i}
                className="bg-surface-alt dark:bg-dark-surface rounded-lg p-3 border border-border dark:border-dark-border"
              >
                <div className="flex items-center gap-2 text-xs text-text-muted dark:text-dark-text-muted mb-1">
                  <spec.icon size={12} />
                  {spec.label}
                </div>
                <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading capitalize">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>

          {bike.description && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-2 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-sm text-text dark:text-dark-text leading-relaxed">
                {bike.description}
              </p>
            </div>
          )}

          {/* Inquiry form */}
          <div className="bg-surface-alt dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-4">
              Interested? Send an Inquiry
            </h3>
            {inquirySent ? (
              <div className="text-center py-6">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  Thank you! We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-3">
                {inquiryError && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{inquiryError}</p>
                )}
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={inquiry.name}
                  onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  required
                  value={inquiry.phone}
                  onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <textarea
                  placeholder="Message (optional)"
                  rows={3}
                  value={inquiry.message}
                  onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {inquiryLoading ? "Sending..." : "Send Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeDetail;
