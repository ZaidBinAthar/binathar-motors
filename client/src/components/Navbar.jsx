import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiMenu,
  HiX,
  HiSun,
  HiMoon,
  HiHome,
  HiCollection,
  HiInformationCircle,
  HiCog,
  HiUsers,
  HiChatAlt2,
  HiLogout,
  HiKey,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout, isAdmin, isOwner } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: "/", icon: HiHome, label: "Home" },
    { to: "/bikes", icon: HiCollection, label: "Bikes" },
    { to: "/about", icon: HiInformationCircle, label: "About" },
  ];

  const adminItems = [
    { to: "/admin", icon: HiCog, label: "Dashboard" },
    { to: "/admin/inquiries", icon: HiChatAlt2, label: "Inquiries" },
    ...(isOwner ? [{ to: "/admin/users", icon: HiUsers, label: "Users" }] : []),
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

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`p-2 rounded-lg no-underline transition-colors ${
                  isActive(item.to)
                    ? "text-primary bg-primary/10"
                    : "text-text-muted hover:text-text-heading hover:bg-surface-alt dark:text-dark-text-muted dark:hover:text-dark-text-heading dark:hover:bg-dark-surface-alt"
                }`}
              >
                <item.icon size={20} />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user && isAdmin && (
              <>
                {adminItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={`p-2 rounded-lg no-underline transition-colors ${
                      isActive(item.to)
                        ? "text-primary bg-primary/10"
                        : "text-text-muted hover:text-text-heading hover:bg-surface-alt dark:text-dark-text-muted dark:hover:text-dark-text-heading dark:hover:bg-dark-surface-alt"
                    }`}
                  >
                    <item.icon size={20} />
                  </Link>
                ))}
                <div className="w-px h-6 bg-border dark:bg-dark-border mx-1" />
              </>
            )}

            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors text-text-muted dark:text-dark-text-muted"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <HiSun size={20} /> : <HiMoon size={20} />}
            </button>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-border dark:border-dark-border">
                      <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">{user.name}</p>
                      <p className="text-xs text-text-muted dark:text-dark-text-muted">@{user.username}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text dark:text-dark-text hover:bg-surface-alt dark:hover:bg-dark-surface-alt no-underline transition-colors"
                      >
                        <HiCog size={16} /> Dashboard
                      </Link>
                    )}
                    <Link
                      to="/login"
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 no-underline transition-colors"
                    >
                      <HiLogout size={16} /> Logout
                    </Link>
                  </div>
                )}
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
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 py-2.5 text-sm font-medium no-underline rounded-lg px-3 ${
                  isActive(item.to)
                    ? "text-primary bg-primary/10"
                    : "text-text dark:text-dark-text hover:bg-surface-alt dark:hover:bg-dark-surface-alt"
                }`}
              >
                <item.icon size={18} /> {item.label}
              </Link>
            ))}

            {user && isAdmin && (
              <>
                <hr className="border-border dark:border-dark-border" />
                {adminItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 py-2.5 text-sm font-medium no-underline rounded-lg px-3 ${
                      isActive(item.to)
                        ? "text-primary bg-primary/10"
                        : "text-text dark:text-dark-text hover:bg-surface-alt dark:hover:bg-dark-surface-alt"
                    }`}
                  >
                    <item.icon size={18} /> {item.label}
                  </Link>
                ))}
              </>
            )}

            <hr className="border-border dark:border-dark-border" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-heading dark:text-dark-text-heading">{user.name}</p>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="flex items-center gap-3 w-full text-left py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg px-3 transition-colors"
                >
                  <HiLogout size={18} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium text-primary no-underline px-3">
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
