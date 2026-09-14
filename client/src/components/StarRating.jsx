import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating, size = 16, showValue = false }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} size={size} className="text-yellow-400" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<FaStarHalfAlt key={i} size={size} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} size={size} className="text-yellow-400" />);
    }
  }
  return (
    <span className="inline-flex items-center gap-0.5">
      {stars}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-text dark:text-dark-text">{rating}</span>
      )}
    </span>
  );
};

export default StarRating;
