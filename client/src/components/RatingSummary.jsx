import StarRating from "./StarRating";

const RatingSummary = ({ summary }) => {
  const { total_reviews, avg_rating, distribution } = summary;
  const maxCount = Math.max(...Object.values(distribution), 1);

  if (total_reviews === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {/* Average */}
      <div className="text-center sm:text-left shrink-0">
        <p className="text-4xl font-bold text-text-heading dark:text-dark-text-heading">
          {avg_rating}
        </p>
        <StarRating rating={avg_rating} size={20} />
        <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
          Based on {total_reviews} review{total_reviews !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Distribution */}
      <div className="flex-1 w-full space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-text-muted dark:text-dark-text-muted w-3 text-right">{star}</span>
            <span className="text-yellow-400 text-xs">★</span>
            <div className="flex-1 h-2.5 bg-surface-alt dark:bg-dark-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${(distribution[star] / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-muted dark:text-dark-text-muted w-6 text-right">
              {distribution[star]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingSummary;
