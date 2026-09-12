import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiSun, HiMoon, HiUser } from "react-icons/hi";
import { FaUsers, FaComments } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, isAdmin, isOwner } = useAuth();
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
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl font-bold text-primary">BinAthar</span>
            <span className="text-xl font-semibold text-text-heading dark:text-dark-text-heading">Motors</span>
          </Link>

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
                    className={`text-sm font-medium no-underline transition-colors ${
                      isActive("/admin") ? "text-primary" : "text-text-muted hover:text-text-heading dark:hover:text-dark-text-heading"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/inquiries"
                    className={`flex items-center gap-1 text-sm font-medium no-underline transition-colors ${
                      isActive("/admin/inquiries") ? "text-primary" : "text-text-muted hover:text-text-heading dark:hover:text-dark-text-heading"
                    }`}
                  >
                    <FaComments size={13} /> Inquiries
                  </Link>
                )}
                {isOwner && (
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-1 text-sm font-medium no-underline transition-colors ${
                      isActive("/admin/users") ? "text-primary" : "text-text-muted hover:text-text-heading dark:hover:text-dark-text-heading"
                    }`}
                  >
                    <FaUsers size={13} /> Users
                  </Link>
                )}
                <div className="flex items-center gap-2.5 pl-3 border-l border-border dark:border-dark-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading leading-tight">{user.name}</p>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted leading-tight">@{user.username}</p>
                  </div>
                </div>
                <button onClick={logout} className="text-sm text-text-muted hover:text-primary transition-colors">
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

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt text-text dark:text-dark-text"
          >
            {open ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

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
                  <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-text dark:text-dark-text no-underline px-3">
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin/inquiries" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-text dark:text-dark-text no-underline px-3">
                    <FaComments size={13} /> Inquiries
                  </Link>
                )}
                {isOwner && (
                  <Link to="/admin/users" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-text dark:text-dark-text no-underline px-3">
                    <FaUsers size={13} /> Users
                  </Link>
                )}
                <button onClick={() => { logout(); setOpen(false); }} className="block w-full text-left py-2 text-sm text-primary px-3">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-primary no-underline px-3">
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
