import { useState, useEffect } from "react";
import "./Landing.css";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "⚡", title: "Lightning Fast", desc: "Calculate incentives for entire teams in seconds. No lag, no waiting — results instantly at your fingertips." },
  { icon: "🎯", title: "100% Accurate", desc: "Performance-based logic engine ensures every calculation is precise and consistent, every single time." },
  { icon: "📊", title: "Visual Reports", desc: "Beautiful dashboards and charts help managers visualize team performance and reward distribution." },
  { icon: "🔒", title: "Secure & Private", desc: "Bank-grade encryption keeps your employee data and payroll figures completely safe and confidential." },
  { icon: "🔗", title: "Integrates Easily", desc: "Plug into your existing HR or payroll tools. Supports CSV export and major HRMS platforms." },
  { icon: "🛠️", title: "Fully Customizable", desc: "Define your own formulas, tiers, KPIs, and caps. Works for any industry or incentive structure." },
];

const steps = [
  { num: "01", title: "Add Employees", desc: "Import your team roster or add employees individually with role and salary data." },
  { num: "02", title: "Set KPIs", desc: "Define performance metrics, targets, and incentive tiers for each role." },
  { num: "03", title: "Enter Results", desc: "Input actual performance numbers for the period you want to calculate." },
  { num: "04", title: "Get Payouts", desc: "Receive a complete breakdown of every employee's earned incentive, ready to approve." },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    features: ["Up to 10 employees", "3 KPI metrics", "Monthly calculations", "CSV export", "Email support"],
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    features: ["Up to 200 employees", "Unlimited KPIs", "Real-time calculations", "Advanced analytics", "Priority support", "API access"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    features: ["Unlimited employees", "Custom formulas", "SSO & compliance", "Dedicated manager", "SLA guarantee", "White-label"],
    featured: false,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const els = document.querySelectorAll(".fade-up");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">💰</div>
          IncentiveCalc
        </a>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="nav-actions">
          <button className="btn-ghost">Log In</button>
          <button className="btn-primary" onClick={()=>navigate("/register")}>Register →</button>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span style={{ transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "" }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "" }} />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <ul>
          {["Features", "How It Works", "Pricing", "Contact"].map((l) => (
            <li key={l}>
              <a href="#" onClick={() => setMenuOpen(false)}>{l}</a>
            </li>
          ))}
        </ul>
        <div className="mobile-menu-btns">
          <button className="btn-ghost">Log In</button>
          <button className="btn-primary" onClick={()=>navigate("/register")}>Register →</button>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge fade-up visible">
              <div className="hero-badge-dot" />
              Trusted by 2,000+ companies worldwide
            </div>
            <h1 className="hero-title fade-up visible">
              Calculate Employee <span className="accent">Incentives</span> in Seconds
            </h1>
            <p className="hero-desc fade-up visible">
              The smartest way to compute performance-based bonuses for your team.
              Fair, transparent, and ridiculously easy to use.
            </p>
            <div className="hero-cta-row fade-up visible">
              <button className="btn-hero">Get Started Free <span>→</span></button>
              <button className="btn-outline-hero">▶ Watch Demo</button>
            </div>
            <div className="hero-stats fade-up visible">
              <div className="hero-stat">
                <span className="hero-stat-num">50K+</span>
                <span className="hero-stat-label">Employees tracked</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">99.9%</span>
                <span className="hero-stat-label">Calculation accuracy</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">4.9★</span>
                <span className="hero-stat-label">Customer rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual fade-up visible">
            <div className="calculator-card">
              <div className="calc-header">
                <span className="calc-title">Q1 Incentive Report</span>
                <span className="calc-badge">✓ Calculated</span>
              </div>
              <div className="calc-field">
                <span className="calc-label">Base Salary</span>
                <div className="calc-input-row">
                  <span className="calc-input-icon">💵</span>
                  <span className="calc-input-val">$72,000 / year</span>
                </div>
              </div>
              <div className="calc-field">
                <span className="calc-label">Performance Score</span>
                <div className="calc-input-row">
                  <span className="calc-input-icon">📈</span>
                  <span className="calc-input-val">94% — Exceeds Target</span>
                </div>
              </div>
              <div className="calc-field">
                <span className="calc-label">Incentive Tier</span>
                <div className="calc-input-row">
                  <span className="calc-input-icon">🏆</span>
                  <span className="calc-input-val">Gold (15% bonus)</span>
                </div>
              </div>
              <div className="calc-divider" />
              <div className="calc-result-label">Earned Incentive</div>
              <div className="calc-result-value">$10,800</div>
              <div className="calc-bar-bg">
                <div className="calc-bar-fill" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-center">
          <span className="section-tag fade-up">✦ Features</span>
          <h2 className="section-title fade-up">Everything you need to reward performance</h2>
          <p className="section-subtitle fade-up">
            Built for HR teams, finance managers, and leadership — no spreadsheet expertise required.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className={`feature-card fade-up delay-${(i % 3) + 1}`} key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-h">{f.title}</h3>
              <p className="feature-p">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="section-center">
          <span className="section-tag fade-up">✦ Process</span>
          <h2 className="section-title fade-up">Up and running in 4 simple steps</h2>
          <p className="section-subtitle fade-up">
            No complex setup. No training needed. Your first incentive report in under 10 minutes.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className={`step-item fade-up delay-${i + 1}`} key={i}>
              <div className="step-num">{s.num}</div>
              <h3 className="step-h">{s.title}</h3>
              <p className="step-p">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="section-center">
          <span className="section-tag fade-up">✦ Pricing</span>
          <h2 className="section-title fade-up">Simple, transparent pricing</h2>
          <p className="section-subtitle fade-up">No hidden fees. No surprise charges. Scale up or down anytime.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((p, i) => (
            <div className={`pricing-card${p.featured ? " featured" : ""} fade-up delay-${i + 1}`} key={i}>
              {p.featured && <div className="featured-badge">⭐ Most Popular</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">{p.price}</div>
              <div className="plan-period">{p.period}</div>
              <ul className="plan-features">
                {p.features.map((f, j) => (
                  <li key={j}><span>✓</span>{f}</li>
                ))}
              </ul>
              <button className={`btn-plan${p.featured ? " featured-btn" : ""}`}>
                {p.price === "Free" ? "Get Started Free" : "Start 14-Day Trial"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner fade-up">
        <h2>Ready to simplify your incentive program?</h2>
        <p>Join thousands of HR teams who save hours every quarter with IncentiveCalc.</p>
        <div className="cta-banner-btns">
          <button className="btn-white">Start for Free →</button>
          <button className="btn-transparent">Schedule a Demo</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo" style={{ color: "white", WebkitTextFillColor: "white" }}>
                <div className="nav-logo-icon">💰</div>
                IncentiveCalc
              </div>
              <p>The modern incentive management platform for growing companies. Fast, accurate, and fully customizable.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Changelog</a></li>
                <li><a href="#">Roadmap</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">GDPR</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 IncentiveCalc. All rights reserved.</span>
          <span>Made with ❤️ for HR teams everywhere</span>
        </div>
      </footer>
    </>
  );
}