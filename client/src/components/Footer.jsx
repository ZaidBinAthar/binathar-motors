import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import Logo from "./Logo";
import { CONTACT } from "../config/contact";

const Footer = () => {
  return (
    <footer className="bg-surface-alt dark:bg-dark-surface-alt border-t border-border dark:border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Logo size={22} />
              <span className="text-primary">BinAthar</span>{" "}
              <span className="text-text-heading dark:text-dark-text-heading">Motors</span>
            </h3>
            <p className="text-sm text-text-muted dark:text-dark-text-muted">
              Your trusted motorcycle dealer in Faisalabad. Quality bikes at the best prices.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-3 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 list-none p-0 m-0">
              {[
                { to: "/", label: "Home" },
                { to: "/bikes", label: "Browse Bikes" },
                { to: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-muted dark:text-dark-text-muted hover:text-primary no-underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text-heading dark:text-dark-text-heading mb-3 uppercase tracking-wider">
              Connect With Us
            </h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://facebook.com/Zaidiprox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-border dark:bg-dark-border flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://instagram.com/Zaidiprox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-border dark:bg-dark-border flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-border dark:bg-dark-border flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">
              BinAthar Motors, Narwala Rd, Jinnah Colony, Faisalabad
            </p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">
              Plus Code: C3C9+VW
            </p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
              0324-7614071 / 0325-6232379
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border dark:border-dark-border text-center text-xs text-text-muted dark:text-dark-text-muted">
          &copy; {new Date().getFullYear()} BinAthar Motors. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
