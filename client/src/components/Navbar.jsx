import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiSun, HiMoon, HiUser } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/bikes", label: "Bikes" },
    { to: "/about", label: "About" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-border dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl font-bold text-primary">
              BinAthar
            </span>
            <span className="text-xl font-semibold text-text-heading dark:text-dark-text-heading">
              Motors
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium no-underline transition-colors ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-text-muted hover:text-text-heading dark:hover:text-dark-text-heading"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors text-text-muted dark:text-dark-text-muted"
              aria-label="Toggle theme"
            >
              {dark ? <HiSun size={20} /> : <HiMoon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-text-muted hover:text-text-heading dark:hover:text-dark-text-heading no-underline"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-text dark:text-dark-text">
                  <HiUser size={16} />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-text-muted hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg no-underline transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt text-text dark:text-dark-text"
          >
            {open ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border dark:border-dark-border bg-white dark:bg-dark-surface">
          <div className="px-4 py-3 space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block py-2 text-sm font-medium no-underline rounded-lg px-3 ${
                  isActive(link.to)
                    ? "text-primary bg-primary/10"
                    : "text-text dark:text-dark-text hover:bg-surface-alt dark:hover:bg-dark-surface-alt"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border dark:border-dark-border" />
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm font-medium text-text dark:text-dark-text no-underline px-3"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm text-primary px-3"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-primary no-underline px-3"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
