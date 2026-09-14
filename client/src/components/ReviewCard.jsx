import StarRating from "./StarRating";

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
};

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-5">
      <div className="flex items-start justify-between mb-3">
        <StarRating rating={review.rating} />
        <span className="text-xs text-text-muted dark:text-dark-text-muted">
          {formatDate(review.created_at)}
        </span>
      </div>
      <p className="text-sm text-text dark:text-dark-text leading-relaxed mb-3">
        &ldquo;{review.review_text}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
          — {review.customer_name}
        </p>
        {review.brand && (
          <p className="text-xs text-text-muted dark:text-dark-text-muted">
            Purchased: {review.brand} {review.model} {review.model_year}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
