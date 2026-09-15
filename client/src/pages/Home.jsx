import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMotorcycle, FaShieldAlt, FaHandshake, FaStar, FaPen, FaSearch, FaTag } from "react-icons/fa";
import api from "../api/axios";
import BikeCard from "../components/BikeCard";
import Logo from "../components/Logo";
import ScrollReveal from "../components/ScrollReveal";
import { BikeCardSkeleton } from "../components/Skeleton";
import ReviewCard from "../components/ReviewCard";
import RatingSummary from "../components/RatingSummary";
import WriteReview from "../components/WriteReview";
import FindMyBike from "../components/FindMyBike";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    api
      .get("/bikes")
      .then((res) => setFeatured(res.data.bikes?.slice(0, 6) || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    api
      .get("/reviews/public", { params: { limit: 6 } })
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => {});

    api
      .get("/reviews/summary")
      .then((res) => setReviewSummary(res.data.summary))
      .catch(() => {});
  }, []);

  const features = [
    { icon: FaMotorcycle, title: "Quality Bikes", desc: "Carefully inspected motorcycles in top condition" },
    { icon: FaShieldAlt, title: "Trusted Dealer", desc: "Transparent deals with complete documentation" },
    { icon: FaHandshake, title: "Best Prices", desc: "Fair market prices with no hidden charges" },
    { icon: FaStar, title: "After-Sales Support", desc: "We stand behind every bike we sell" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=80"
            alt="Motorcycle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-page-in">
              Find Your Perfect{" "}
              <span className="text-primary">Ride</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 flex items-center gap-2 animate-page-in" style={{ animationDelay: "100ms" }}>
              <Logo size={28} /> BinAthar Motors — your trusted motorcycle dealer. Browse our collection of quality bikes at the best prices.
            </p>
            <div className="flex flex-wrap gap-4 animate-page-in" style={{ animationDelay: "200ms" }}>
              <Link
                to="/bikes"
                className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg no-underline transition-colors"
              >
                Browse Bikes
              </Link>
              <Link
                to="/about"
                className="border border-white/30 hover:border-white/60 text-white font-medium px-6 py-3 rounded-lg no-underline transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-surface-alt dark:bg-dark-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading text-center mb-10">
              Why Choose Us
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border text-center h-full">
                  <f.icon className="text-primary text-3xl mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted">
                    {f.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Find My Bike */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12 text-center">
              <FaSearch className="text-primary text-4xl mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
                🔎 Find Your Perfect Bike
              </h2>
              <p className="text-text-muted dark:text-dark-text-muted mb-6 max-w-lg mx-auto">
                Not sure which bike to choose? Let BinAthar Motors help you find the one that fits your budget and needs.
              </p>
              <Link
                to="/find-my-bike"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg no-underline transition-colors"
              >
                Start Finding My Bike →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sell Your Bike */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-green-500/5 to-green-500/10 dark:from-green-500/10 dark:to-green-500/5 rounded-2xl border border-green-500/20 p-8 md:p-12 text-center">
              <FaTag className="text-green-500 text-4xl mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
                Want to Sell Your Bike?
              </h2>
              <p className="text-text-muted dark:text-dark-text-muted mb-6 max-w-lg mx-auto">
                Have a motorcycle you want to sell? Sell it to BinAthar Motors hassle-free. Get a fair price and instant payment.
              </p>
              <Link
                to="/sell-your-bike"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg no-underline transition-colors"
              >
                Sell Your Bike →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Bikes */}
      {(loading || featured.length > 0) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
                  Featured Bikes
                </h2>
                <p className="text-text-muted dark:text-dark-text-muted">
                  Check out our latest inventory
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? [...Array(6)].map((_, i) => <BikeCardSkeleton key={i} />)
                : featured.map((bike, i) => (
                    <ScrollReveal key={bike.id} delay={i * 80}>
                      <BikeCard bike={bike} />
                    </ScrollReveal>
                  ))}
            </div>
            <ScrollReveal>
              <div className="text-center mt-8">
                <Link
                  to="/bikes"
                  className="inline-block bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg no-underline transition-colors"
                >
                  View All Bikes
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <section className="py-16 bg-surface-alt dark:bg-dark-surface-alt">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-1">
                    What Our Customers Say
                  </h2>
                  {reviewSummary && reviewSummary.total_reviews > 0 && (
                    <p className="text-sm text-text-muted dark:text-dark-text-muted">
                      <span className="text-yellow-500 font-bold">{reviewSummary.avg_rating}</span>
                      {" / 5 — Based on "}{reviewSummary.total_reviews}{" review"}{reviewSummary.total_reviews !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                >
                  <FaPen size={12} /> Write a Review
                </button>
              </div>
            </ScrollReveal>

            {/* Rating summary */}
            {reviewSummary && reviewSummary.total_reviews > 0 && (
              <ScrollReveal>
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6 mb-8">
                  <RatingSummary summary={reviewSummary} />
                </div>
              </ScrollReveal>
            )}

            {/* Reviews grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, i) => (
                <ScrollReveal key={review.id} delay={i * 80}>
                  <ReviewCard review={review} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No reviews yet — still show CTA to write one */}
      {reviews.length === 0 && (
        <section className="py-16 bg-surface-alt dark:bg-dark-surface-alt">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal>
              <FaStar className="text-4xl text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
                What Our Customers Say
              </h2>
              <p className="text-text-muted dark:text-dark-text-muted mb-6">
                Be the first to share your experience with BinAthar Motors!
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors mx-auto"
              >
                <FaPen size={12} /> Write a Review
              </button>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* CTA */}
      <ScrollReveal>
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Ride?
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Visit us or browse our collection online. Your next motorcycle is just a click away.
            </p>
            <Link
              to="/bikes"
              className="inline-block bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg no-underline transition-colors"
            >
              Explore Now
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* Write Review Modal */}
      {showReviewForm && (
        <WriteReview
          onClose={() => setShowReviewForm(false)}
          onSubmitted={() => {
            api.get("/reviews/public", { params: { limit: 6 } }).then((res) => setReviews(res.data.reviews || []));
            api.get("/reviews/summary").then((res) => setReviewSummary(res.data.summary));
          }}
        />
      )}
    </div>
  );
};

export default Home;
