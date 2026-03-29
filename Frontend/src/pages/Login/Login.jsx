import React, { useState } from "react";
import "./Login.css";
import { loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");

  if (email === "" || password === "") {
    setErrorMsg("Please fill all fields");
    return;
  }

  setLoading(true);
  try {
    const payload = { email, password };
    const response = await loginUser(payload);
    console.log("response:", response);
    if (response?.status === "success" && response?.res_data?.token) {
      localStorage.setItem("token", response.res_data.token);
      localStorage.setItem("organization_name",response.res_data.organization_name)
    }

    toast.success("Login Successful");
    navigate("/dashboard");

  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Login failed. Please try again.";
    setErrorMsg(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="16" fill="url(#logoGrad)" />
              <path d="M14 24.5L21 31.5L34 16" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          {/* Email */}
          <div className={`field-group ${focused === "email" ? "field-active" : ""}`}>
            <label htmlFor="email" className="field-label">Email address</label>
            <div className="field-wrapper">
              <span className="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              />
            </div>
          </div>

          {/* Password */}
          <div className={`field-group ${focused === "password" ? "field-active" : ""}`}>
            <div className="field-label-row">
              <label htmlFor="password" className="field-label">Password</label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            <div className="field-wrapper">
              <span className="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="field-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="remember-row">
            <label className="remember-label">
              <input type="checkbox" className="remember-check" />
              <span className="checkmark" />
              Remember me
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="error-msg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className={`login-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign in"}
          </button>
          
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <a href="/register" className="signup-link">Create one free</a>
        </p>
      </div>
    </div>
  );
}

export default Login;