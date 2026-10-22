import React, { useState } from "react";
import { supabase } from "./supabase";
import "./AuthForm.css";

function AuthForm({ onClose, onLoginSuccess, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (authError) throw authError;

        setMessage("Login successful!");

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }

        if (onClose) onClose();
      } else {
        const { data, error: authError } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

        if (authError) throw authError;

        if (data.session) {
          setMessage("Account created successfully!");

          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }

          if (onClose) onClose();
        } else {
          setMessage(
            "Registration successful! Please check your email to confirm your account before signing in."
          );
        }
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Close authentication form"
        >
          ×
        </button>

        <div className="auth-brand">SUDBURY</div>

        <p className="auth-eyebrow">A MORE PERSONAL EXPERIENCE</p>

        <h2 className="auth-title">
          {isLogin ? "Welcome back." : "Create your account."}
        </h2>

        <p className="auth-description">
          {isLogin
            ? "Sign in to continue your shopping experience."
            : "Join SUDBURY and discover a better way to shop."}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="auth-full-name">Full name</label>

              <input
                id="auth-full-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email address</label>

            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>

            <div className="auth-password-wrap">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  isLogin ? "current-password" : "new-password"
                }
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-message auth-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-message auth-success" role="status">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "New to SUDBURY?" : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin((previous) => !previous);
              setMessage("");
              setError("");
            }}
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </p>

        <p className="auth-legal">
          By continuing, you agree to shop responsibly and keep your
          account credentials private.
        </p>
      </div>
    </div>
  );
}

export default AuthForm;