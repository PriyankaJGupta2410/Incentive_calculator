import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Retail",
  "Manufacturing", "Hospitality", "Consulting", "Real Estate", "Other"
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Other"];

// ── helpers ──────────────────────────────────────────────────────────────────
function getPwdStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const pwdLabels = ["", "Weak", "Fair", "Good", "Strong"];
const pwdBarClass = ["", "weak", "fair", "good", "strong"];

function PasswordStrength({ password }) {
  const strength = getPwdStrength(password);
  if (!password) return null;
  return (
    <div className="pwd-strength">
      <div className="pwd-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`pwd-bar ${i <= strength ? pwdBarClass[strength] : ""}`} />
        ))}
      </div>
      <span className="pwd-strength-text">{pwdLabels[strength]}</span>
    </div>
  );
}

// ── Step 1 — Organization Info ────────────────────────────────────────────────
function StepOrganization({ data, onChange, errors }) {
  return (
    <div className="reg-form">
      <p className="form-section-title">Organization Details</p>

      <div className="form-grid single">
        <div className="form-field">
          <label className="field-label">Organization Name <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">🏢</span>
            <input
              className={`form-input ${errors.name ? "error" : data.name ? "valid" : ""}`}
              placeholder="Acme Corp"
              value={data.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>
          {errors.name && <span className="field-error">⚠ {errors.name}</span>}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="field-label">Work Email <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">📧</span>
            <input
              className={`form-input ${errors.email ? "error" : data.email ? "valid" : ""}`}
              placeholder="org@company.com"
              type="email"
              value={data.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </div>
          {errors.email && <span className="field-error">⚠ {errors.email}</span>}
        </div>

        <div className="form-field">
          <label className="field-label">Phone <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">📱</span>
            <input
              className={`form-input ${errors.phone ? "error" : data.phone ? "valid" : ""}`}
              placeholder="+91 98765 43210"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </div>
          {errors.phone && <span className="field-error">⚠ {errors.phone}</span>}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="field-label">Industry <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">🏭</span>
            <select
              className={`form-select ${errors.industry ? "error" : data.industry ? "valid" : ""}`}
              value={data.industry}
              onChange={(e) => onChange("industry", e.target.value)}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          {errors.industry && <span className="field-error">⚠ {errors.industry}</span>}
        </div>

        <div className="form-field">
          <label className="field-label">Company Size <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">👥</span>
            <select
              className={`form-select ${errors.company_size ? "error" : data.company_size ? "valid" : ""}`}
              value={data.company_size}
              onChange={(e) => onChange("company_size", e.target.value)}
            >
              <option value="">Select size</option>
              {COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          {errors.company_size && <span className="field-error">⚠ {errors.company_size}</span>}
        </div>
      </div>

      <p className="form-section-title" style={{ marginTop: "8px" }}>Location</p>

      <div className="form-grid triple">
        <div className="form-field">
          <label className="field-label">City <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">🏙️</span>
            <input
              className={`form-input ${errors.city ? "error" : data.city ? "valid" : ""}`}
              placeholder="Mumbai"
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
            />
          </div>
          {errors.city && <span className="field-error">⚠ {errors.city}</span>}
        </div>

        <div className="form-field">
          <label className="field-label">State <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">📍</span>
            <input
              className={`form-input ${errors.state ? "error" : data.state ? "valid" : ""}`}
              placeholder="Maharashtra"
              value={data.state}
              onChange={(e) => onChange("state", e.target.value)}
            />
          </div>
          {errors.state && <span className="field-error">⚠ {errors.state}</span>}
        </div>

        <div className="form-field">
          <label className="field-label">Country <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">🌐</span>
            <select
              className={`form-select ${errors.country ? "error" : data.country ? "valid" : ""}`}
              value={data.country}
              onChange={(e) => onChange("country", e.target.value)}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          {errors.country && <span className="field-error">⚠ {errors.country}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Step 2 — Admin Account ────────────────────────────────────────────────────
function StepAdmin({ data, onChange, errors }) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="reg-form">
      <p className="form-section-title">Admin Account Setup</p>

      <div className="form-grid single">
        <div className="form-field">
          <label className="field-label">Full Name <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">👤</span>
            <input
              className={`form-input ${errors.admin_name ? "error" : data.admin_name ? "valid" : ""}`}
              placeholder="John Doe"
              value={data.admin_name}
              onChange={(e) => onChange("admin_name", e.target.value)}
            />
          </div>
          {errors.admin_name && <span className="field-error">⚠ {errors.admin_name}</span>}
        </div>
      </div>

      <div className="form-grid single">
        <div className="form-field">
          <label className="field-label">Admin Email <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">📧</span>
            <input
              className={`form-input ${errors.admin_email ? "error" : data.admin_email ? "valid" : ""}`}
              placeholder="admin@company.com"
              type="email"
              value={data.admin_email}
              onChange={(e) => onChange("admin_email", e.target.value)}
            />
          </div>
          {errors.admin_email && <span className="field-error">⚠ {errors.admin_email}</span>}
        </div>
      </div>

      <div className="form-grid single">
        <div className="form-field">
          <label className="field-label">Password <span className="req">*</span></label>
          <div className="field-wrap">
            <span className="field-icon">🔒</span>
            <input
              className={`form-input ${errors.admin_password ? "error" : data.admin_password ? "valid" : ""}`}
              placeholder="Min 8 characters"
              type={showPwd ? "text" : "password"}
              value={data.admin_password}
              onChange={(e) => onChange("admin_password", e.target.value)}
            />
            <button
              className="pwd-toggle"
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              tabIndex={-1}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
          <PasswordStrength password={data.admin_password} />
          {errors.admin_password && <span className="field-error">⚠ {errors.admin_password}</span>}
        </div>
      </div>

      {/* Summary card */}
      <div style={{
        marginTop: "24px",
        background: "var(--blue-pale)",
        border: "1px solid var(--blue-light)",
        borderRadius: "12px",
        padding: "16px 20px"
      }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
          Organization Summary
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
          {[
            ["Organization", data.org?.name],
            ["Industry", data.org?.industry],
            ["Company Size", data.org?.company_size],
            ["Location", data.org?.city ? `${data.org.city}, ${data.org.state}` : "—"],
          ].map(([label, val]) => (
            <div key={label} style={{ fontSize: "0.82rem" }}>
              <span style={{ color: "var(--gray-600)" }}>{label}: </span>
              <span style={{ fontWeight: 600, color: "var(--blue-deep)" }}>{val || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const [orgData, setOrgData] = useState({
    name: "", email: "", phone: "",
    industry: "", company_size: "",
    city: "", state: "", country: ""
  });

  const [adminData, setAdminData] = useState({
    admin_name: "", admin_email: "", admin_password: ""
  });

  const handleOrgChange = (key, val) => {
    setOrgData((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleAdminChange = (key, val) => {
    setAdminData((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  // Validate step 1
  const validateStep1 = () => {
    const e = {};
    if (!orgData.name.trim()) e.name = "Organization name is required";
    if (!orgData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgData.email)) e.email = "Enter a valid email";
    if (!orgData.phone.trim()) e.phone = "Phone is required";
    if (!orgData.industry) e.industry = "Select an industry";
    if (!orgData.company_size) e.company_size = "Select company size";
    if (!orgData.city.trim()) e.city = "City is required";
    if (!orgData.state.trim()) e.state = "State is required";
    if (!orgData.country) e.country = "Select a country";
    return e;
  };

  // Validate step 2
  const validateStep2 = () => {
    const e = {};
    if (!adminData.admin_name.trim()) e.admin_name = "Name is required";
    if (!adminData.admin_email.trim()) e.admin_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.admin_email)) e.admin_email = "Enter a valid email";
    if (!adminData.admin_password) e.admin_password = "Password is required";
    else if (adminData.admin_password.length < 8) e.admin_password = "Minimum 8 characters";
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleBack = () => { setErrors({}); setStep(1); };

  const handleSubmit = async () => {
    const e = validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setApiError("");

    const payload = { ...orgData, ...adminData };

    try {
      const res = await fetch("/api/organization/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.code === 200) {
        setSuccess(json.res_data);
      } else {
        setApiError(json.message || "Registration failed. Please try again.");
      }
    } catch {
      setApiError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = step === 1 ? 50 : 100;

  const leftSteps = [
    { num: 1, label: "Organization Info", desc: "Company details & location" },
    { num: 2, label: "Admin Account", desc: "Set up your admin credentials" },
  ];

  return (
    <div className="register-page">
      {/* ── LEFT PANEL ── */}
      <div className="register-left">
        <div className="left-deco left-deco-1" />
        <div className="left-deco left-deco-2" />
        <div className="left-deco left-deco-3" />

        <div className="left-top">
          <a href="/" className="left-logo" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
            <div className="left-logo-icon">💰</div>
            IncentiveCalc
          </a>

          <h2 className="left-heading">
            Set up your <span>organization</span> account
          </h2>
          <p className="left-sub">
            Get started in minutes. Register your company and configure your first incentive program today.
          </p>

          <div className="left-steps">
            {leftSteps.map((s) => (
              <div className="left-step" key={s.num}>
                <div className={`step-dot ${step > s.num ? "done" : step === s.num ? "active" : ""}`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <div className="step-info">
                  <div className="step-label">{s.label}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="left-bottom">
          <p className="left-login-text">
            Already have an account? <a href="/login">Sign in →</a>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="register-right">
        <div className="register-form-wrap">

          {success ? (
            /* Success State */
            <div className="success-wrap">
              <div className="success-icon">🎉</div>
              <h2 className="success-title">You're all set!</h2>
              <p className="success-msg">
                Your organization has been registered successfully. You can now log in with your admin credentials.
              </p>
              <div className="success-ids">
                <div className="success-id-row">
                  <span className="success-id-label">Organization ID</span>
                  <span className="success-id-val">#{success.organization_id}</span>
                </div>
                <div className="success-id-row">
                  <span className="success-id-label">Admin ID</span>
                  <span className="success-id-val">#{success.admin_id}</span>
                </div>
              </div>
              <button className="btn-login" onClick={() => navigate("/login")}>
                Go to Login →
              </button>
            </div>
          ) : (
            <>
              {/* Step header */}
              <div className="form-step-header">
                <div className="step-indicator">
                  <div className="step-pill">
                    <div className="step-pill-dot" />
                    Step {step} of 2
                  </div>
                </div>
                <h1 className="form-title">
                  {step === 1 ? "Organization Information" : "Admin Account Setup"}
                </h1>
                <p className="form-subtitle">
                  {step === 1
                    ? "Tell us about your company so we can get you started."
                    : "Create the admin account that will manage your organization."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>

              {/* API error */}
              {apiError && (
                <div className="api-error">
                  ⚠️ {apiError}
                </div>
              )}

              {/* Form steps */}
              {step === 1 ? (
                <StepOrganization data={orgData} onChange={handleOrgChange} errors={errors} />
              ) : (
                <StepAdmin
                  data={{ ...adminData, org: orgData }}
                  onChange={handleAdminChange}
                  errors={errors}
                />
              )}

              {/* Actions */}
              <div className="form-actions">
                {step === 2 && (
                  <button className="btn-back" onClick={handleBack}>
                    ← Back
                  </button>
                )}

                {step === 1 ? (
                  <button className="btn-next" onClick={handleNext}>
                    Continue →
                  </button>
                ) : (
                  <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <><div className="spinner" /> Registering...</>
                    ) : (
                      <>Register Organization ✓</>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}