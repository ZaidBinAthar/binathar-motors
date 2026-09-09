import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            navigate("/");
          } catch (err) {
            alert(err.response?.data?.message || "Login failed");
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: 300, text: "signin_with" }
      );
    }
  }, [loginWithGoogle, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border p-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mb-8">
          Sign in with your Google account to continue
        </p>

        <div className="flex justify-center mb-6">
          <div id="google-btn" />
        </div>

        {!window.google && (
          <p className="text-xs text-text-muted dark:text-dark-text-muted">
            Loading Google Sign-In...
          </p>
        )}

        <p className="text-xs text-text-muted dark:text-dark-text-muted mt-6">
          New staff accounts require owner approval before access is granted.
        </p>
      </div>
    </div>
  );
};

export default Login;
