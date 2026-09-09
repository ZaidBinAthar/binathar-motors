import { Link } from "react-router-dom";
import { FaGasPump, FaMapMarkerAlt } from "react-icons/fa";

const BikeCard = ({ bike }) => {
  return (
    <Link
      to={`/bikes/${bike.id}`}
      className="group block bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border overflow-hidden hover:shadow-lg transition-all duration-300 no-underline"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-surface-alt dark:bg-dark-surface-alt">
        {bike.cover_image ? (
          <img
            src={bike.cover_image}
            alt={`${bike.brand} ${bike.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted dark:text-dark-text-muted text-4xl font-bold">
            {bike.brand?.[0]}
          </div>
        )}
        <span
          className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full ${
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

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-text-heading dark:text-dark-text-heading mb-1 group-hover:text-primary transition-colors">
          {bike.brand} {bike.model}
        </h3>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mb-3">
          {bike.model_year}
        </p>

        <div className="flex items-center gap-4 text-xs text-text-muted dark:text-dark-text-muted mb-3">
          {bike.engine_cc && (
            <span className="flex items-center gap-1">
              <FaGasPump size={12} />
              {bike.engine_cc}cc
            </span>
          )}
          {bike.registration_city && (
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt size={12} />
              {bike.registration_city}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            Rs. {Number(bike.selling_price).toLocaleString()}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-surface-alt dark:bg-dark-surface text-text-muted dark:text-dark-text-muted capitalize">
            {bike.condition}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BikeCard;
