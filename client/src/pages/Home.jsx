import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMotorcycle, FaShieldAlt, FaHandshake, FaStar } from "react-icons/fa";
import api from "../api/axios";
import BikeCard from "../components/BikeCard";

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get("/bikes")
      .then((res) => setFeatured(res.data.bikes?.slice(0, 6) || []))
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
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/icons.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Find Your Perfect{" "}
              <span className="text-primary">Ride</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              BinAthar Motors — your trusted motorcycle dealer. Browse our collection of quality bikes at the best prices.
            </p>
            <div className="flex flex-wrap gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-border dark:border-dark-border text-center"
              >
                <f.icon className="text-primary text-3xl mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-text-muted dark:text-dark-text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bikes */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
                Featured Bikes
              </h2>
              <p className="text-text-muted dark:text-dark-text-muted">
                Check out our latest inventory
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/bikes"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg no-underline transition-colors"
              >
                View All Bikes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
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
    </div>
  );
};

export default Home;
