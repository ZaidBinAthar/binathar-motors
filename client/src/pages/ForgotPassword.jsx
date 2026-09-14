import { useState } from "react";
import { Link } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import api from "../api/axios";
import Logo from "../components/Logo";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { username });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border p-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Logo size={32} />
          <span className="text-xl font-bold text-primary">BinAthar</span>
          <span className="text-xl font-semibold text-text-heading dark:text-dark-text-heading">Motors</span>
        </div>

        <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading mb-2 text-center">
          Forgot Password?
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mb-8 text-center">
          Enter your username or email and we'll generate a temporary password for you.
        </p>

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">
                Password reset for {result.user.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 mb-3">
                Your temporary password is:
              </p>
              <div className="bg-white dark:bg-dark-surface border border-green-300 dark:border-green-700 rounded-lg px-4 py-3 flex items-center justify-between">
                <code className="text-lg font-bold text-text-heading dark:text-dark-text-heading select-all">
                  {result.tempPassword}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(result.tempPassword)}
                  className="text-xs text-primary hover:text-primary-dark ml-3 whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Login with this temporary password, then go to your profile to set a new password. Anyone with this password can access the account, so change it immediately.
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors text-center no-underline"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your username or email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaKey size={14} />
                {loading ? "Please wait..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary-hover transition-colors no-underline"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
