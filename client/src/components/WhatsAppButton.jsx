import { useState } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";
import { useWhatsApp } from "../context/WhatsAppContext";

const WHATSAPP_NUMBER = "923247614071";

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);
  const { bike } = useWhatsApp();

  const getMessage = () => {
    if (bike) {
      return encodeURIComponent(
        `Hi BinAthar Motors! I'm interested in the ${bike.brand} ${bike.model} (${bike.model_year}) listed for Rs. ${Number(bike.selling_price).toLocaleString()}. Is it still available?`
      );
    }
    return encodeURIComponent("Hi BinAthar Motors! I'd like to inquire about your motorcycles.");
  };

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${getMessage()}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-border dark:border-dark-border p-4 w-72 animate-page-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <FaWhatsapp size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-heading dark:text-dark-text-heading">BinAthar Motors</p>
                <p className="text-xs text-green-500">Usually replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text"
            >
              <FaTimes size={14} />
            </button>
          </div>
          <div className="bg-surface-alt dark:bg-dark-surface rounded-lg p-3 mb-3">
            <p className="text-xs text-text dark:text-dark-text">
              {bike
                ? `Hi! I'm interested in the ${bike.brand} ${bike.model}. Is it available?`
                : "Hi! I'd like to know about your motorcycles."}
            </p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg text-center no-underline transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          open ? "rotate-90" : ""
        }`}
      >
        {open ? <FaTimes size={22} /> : <FaWhatsapp size={26} />}
      </button>
    </div>
  );
};

export default WhatsAppButton;
