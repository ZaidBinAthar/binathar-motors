import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from "react-icons/fa";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-heading dark:text-dark-text-heading mb-4">
          About BinAthar Motors
        </h1>
        <p className="text-text-muted dark:text-dark-text-muted max-w-2xl mx-auto leading-relaxed">
          BinAthar Motors is your trusted motorcycle dealer in Faisalabad. We offer a wide range
          of quality bikes at the best prices. Whether you're looking for a brand-new ride or a
          well-maintained used bike, we've got you covered.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-2">
            Our Mission
          </h3>
          <p className="text-sm text-text dark:text-dark-text leading-relaxed">
            To spread awareness and promote our business by providing quality motorcycles
            and exceptional customer service.
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-2">
            Quality Bikes
          </h3>
          <p className="text-sm text-text dark:text-dark-text leading-relaxed">
            Every bike in our inventory is carefully selected and inspected. We ensure
            you get the best value for your money.
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-2">
            Customer First
          </h3>
          <p className="text-sm text-text dark:text-dark-text leading-relaxed">
            Your satisfaction is our priority. We believe in honest deals, transparent
            pricing, and building long-term relationships.
          </p>
        </div>
      </div>

      {/* Contact + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-8">
          <h2 className="text-xl font-bold text-text-heading dark:text-dark-text-heading mb-6">
            Get in Touch
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mb-0.5">Location</p>
                <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                  Narwala Rd, Jinnah Colony, Faisalabad
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaPhone className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mb-0.5">Phone</p>
                <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                  0324-7614071 / 0325-6232379
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaWhatsapp className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mb-0.5">WhatsApp</p>
                <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                  0324-7614071 / 0325-6232379
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaEnvelope className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mb-0.5">Email</p>
                <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                  zaid.athar.2009@gmail.com
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaClock className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mb-0.5">Working Hours</p>
                <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">
                  Sat - Thu: 12:00 PM - 10:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.476!2d73.08!3d31.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJinnah+Colony%2C+Faisalabad!5e0!3m2!1sen!2spk!4v1"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "350px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="BinAthar Motors Location"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
