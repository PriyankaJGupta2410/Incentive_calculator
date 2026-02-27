import { useNavigate } from "react-router-dom";
import "./Landing.css";

const features = [
  {
    icon: "🎯",
    title: "Smart Calculations",
    desc: "Automatically compute incentives based on targets and achievements in real time.",
  },
  {
    icon: "📊",
    title: "Visual Reports",
    desc: "Get clear dashboards showing performance and payout summaries instantly.",
  },
  {
    icon: "⚙️",
    title: "Custom Slab Setup",
    desc: "Define your own incentive slabs and commission tiers with flexible configuration.",
  },
  {
    icon: "👥",
    title: "Team Management",
    desc: "Manage incentives across individuals, teams, and departments effortlessly.",
  },
  {
    icon: "🔒",
    title: "Secure & Reliable",
    desc: "Role-based access control ensures data is safe and visible only to the right people.",
  },
  {
    icon: "📁",
    title: "Export & Reports",
    desc: "Export incentive reports to PDF or Excel for payroll and finance teams.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-logo">💰 IncentCalc</div>
        <div className="navbar-actions">
          <button className="btn-outline" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-primary" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-badge">✦ Incentive Management Platform</p>
          <h1 className="hero-title">Calculate Incentives.<br />Eliminate Disputes.</h1>
          <p className="hero-subtitle">
            The simplest way to calculate, track, and manage employee incentives —
            accurate, transparent, and effortless.
          </p>
          <div className="hero-buttons">
            <button className="btn-white" onClick={() => navigate("/register")}>Get Started Free</button>
            <button className="btn-ghost" onClick={() => navigate("/login")}>Login to Account →</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">500+</span>
              <span className="stat-label">Employees Tracked</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">98.6%</span>
              <span className="stat-label">Calculation Accuracy</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">0</span>
              <span className="stat-label">Manual Errors</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="features-inner">
          <p className="section-eyebrow">Features</p>
          <h2 className="features-heading">Why Choose IncentCalc?</h2>
          <p className="features-sub">Everything you need to manage incentives — all in one place.</p>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to simplify your incentive process?</h2>
          <p className="cta-sub">Join hundreds of companies managing payouts without spreadsheets.</p>
          <button className="btn-white" onClick={() => navigate("/register")}>Create Your Account</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">💰 IncentCalc</span>
          <span className="footer-copy">© 2025 IncentCalc · All rights reserved.</span>
          <div className="footer-links">
            <span onClick={() => navigate("/login")}>Login</span>
            <span onClick={() => navigate("/register")}>Register</span>
          </div>
        </div>
      </footer>

    </div>
  );
}