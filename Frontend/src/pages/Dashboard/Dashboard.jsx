import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/sidebar";
import "./Dashboard.css";
import BASE_URL from "../../config/apiConfig";

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = (num) =>
  "₹" + Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const fmtCompact = (num) => {
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(1) + "Cr";
  if (num >= 100000)   return "₹" + (num / 100000).toFixed(1) + "L";
  if (num >= 1000)     return "₹" + (num / 1000).toFixed(1) + "K";
  return "₹" + num;
};

/* ─── KPI Card ─────────────────────────────────────────────── */
const KpiCard = ({ title, value, sub, icon, accent, delay = 0 }) => (
  <div className="kpi-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="kpi-card__top">
      <div className={`kpi-icon kpi-icon--${accent}`}>{icon}</div>
      <span className="kpi-label">{title}</span>
    </div>
    <div className="kpi-value">{value}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
    <div className={`kpi-accent-bar kpi-accent-bar--${accent}`} />
  </div>
);

/* ─── Rank Badge ───────────────────────────────────────────── */
const RankBadge = ({ rank }) => {
  const map = { 1: "🥇", 2: "🥈", 3: "🥉" };
  return (
    <span className={`rank-badge rank-badge--${rank}`}>
      {map[rank] || `#${rank}`}
    </span>
  );
};

/* ─── Skeleton Loader ──────────────────────────────────────── */
const Skeleton = ({ width = "100%", height = "16px", radius = "6px", style = {} }) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius: radius, ...style }}
  />
);

/* ─── Main Dashboard ───────────────────────────────────────── */
const Dashboard = () => {
  const [active, setActive]               = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/dashboard/metrics`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token") || "",
          },
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || `Server error: ${res.status}`);
        }

        if (json.code !== 200 || json.status !== "success") {
          throw new Error(json.message || "Unexpected response from server");
        }

        setData(json.res_data);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  /* ── Derived values ── */
  const metrics       = data?.metrics       || {};
  const recentBatches = data?.recent_batches || [];
  const topEarners    = data?.top_earners    || [];
  const maxEarner     = Math.max(...topEarners.map((e) => e.total_incentive), 1);

  /* ── Latest period label for badge ── */
  const latestPeriod = recentBatches[0]?.calculation_period ?? "";

  return (
    <div className="db-root">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');`}</style>

      {/* Mobile overlay */}
      {mobileSidebar && (
        <div className="mobile-overlay" onClick={() => setMobileSidebar(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${mobileSidebar ? "sidebar-wrapper--open" : ""}`}>
        <Sidebar
          active={active}
          setActive={setActive}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Main */}
      <main className="db-main">

        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="mobile-topbar-title">Dashboard</span>
        </div>

        <div className="dash-root">

          {/* ── Page Header ── */}
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Dashboard</h1>
              <p className="dash-subtitle">
                Incentive calculations overview
                {latestPeriod && ` — ${latestPeriod}`}
              </p>
            </div>
            <div className="dash-header-actions">
              <button className="hdr-btn hdr-btn--ghost" onClick={() => navigate("/calculation-logs")}>
                View Logs →
              </button>
              <button className="hdr-btn hdr-btn--primary" onClick={() => navigate("/upload")}>
                + Upload Data
              </button>
            </div>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="error-banner">
              <span className="error-banner__icon">⚠️</span>
              <span>{error}</span>
              <button
                className="error-banner__retry"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── KPI Grid ── */}
          <div className="kpi-grid">
            {loading ? (
              <>
                {[0, 80, 160, 240].map((d) => (
                  <div className="kpi-card kpi-card--skeleton" key={d} style={{ animationDelay: `${d}ms` }}>
                    <div className="kpi-card__top">
                      <Skeleton width="34px" height="34px" radius="8px" />
                      <Skeleton width="80px" height="12px" />
                    </div>
                    <Skeleton width="60%" height="28px" style={{ marginBottom: 6 }} />
                    <Skeleton width="45%" height="11px" />
                    <div className="kpi-accent-bar kpi-accent-bar--indigo" style={{ opacity: 0.15 }} />
                  </div>
                ))}
              </>
            ) : (
              <>
                <KpiCard
                  title="Total Batches"
                  value={metrics.total_calculation_batches ?? 0}
                  sub="All time"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  }
                  accent="indigo"
                  delay={0}
                />
                <KpiCard
                  title="Employees"
                  value={metrics.total_employees_calculated ?? 0}
                  sub="In latest batch"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  }
                  accent="blue"
                  delay={80}
                />
                <KpiCard
                  title="Total Payout"
                  value={fmtCompact(metrics.total_payout ?? 0)}
                  sub={fmt(metrics.total_payout ?? 0) + " exact"}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  }
                  accent="emerald"
                  delay={160}
                />
                <KpiCard
                  title="Avg Incentive"
                  value={fmtCompact(Math.round(metrics.average_incentive ?? 0))}
                  sub="Per employee"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  }
                  accent="amber"
                  delay={240}
                />
              </>
            )}
          </div>

          {/* ── Main Grid ── */}
          <div className="dash-grid">

            {/* Recent Batches */}
            <div className="dash-card">
              <div className="dash-card__header">
                <div>
                  <h3 className="dash-card__title">Recent Batches</h3>
                  <p className="dash-card__sub">Latest calculation runs</p>
                </div>
                <button
                  className="card-link-btn"
                  onClick={() => navigate("/calculation-logs")}
                >
                  See all →
                </button>
              </div>

              <div className="dash-card__body">
                {loading ? (
                  <div className="batch-list">
                    {[0, 1].map((i) => (
                      <div className="batch-row" key={i}>
                        <Skeleton width="32px" height="32px" radius="8px" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <Skeleton width="120px" height="13px" />
                          <Skeleton width="80px" height="11px" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <Skeleton width="80px" height="11px" />
                          <Skeleton width="60px" height="20px" radius="20px" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <Skeleton width="70px" height="15px" />
                          <Skeleton width="90px" height="10px" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentBatches.length === 0 ? (
                  <div className="dash-empty">
                    <span className="dash-empty-icon">📭</span>
                    <p>No batches yet</p>
                  </div>
                ) : (
                  <div className="batch-list">
                    {recentBatches.map((batch, i) => (
                      <div className="batch-row" key={batch.calculation_batch_id ?? i}>
                        <div className="batch-row__icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                        </div>
                        <div className="batch-row__info">
                          <span className="batch-row__id" title={batch.calculation_batch_id}>
                            {batch.calculation_batch_id.length > 12
                              ? batch.calculation_batch_id.slice(0, 8) + "…"
                              : batch.calculation_batch_id}
                          </span>
                          <span className="batch-row__period">📆 {batch.calculation_period}</span>
                        </div>
                        <div className="batch-row__meta">
                          <span className="batch-row__emp">{batch.total_employees} employees</span>
                          <span className="batch-status batch-status--done">Completed</span>
                        </div>
                        <div className="batch-row__amount">
                          <span className="batch-row__payout">{fmtCompact(batch.total_payout)}</span>
                          <span className="batch-row__exact">{fmt(batch.total_payout)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Earners */}
            <div className="dash-card">
              <div className="dash-card__header">
                <div>
                  <h3 className="dash-card__title">Top Earners</h3>
                  <p className="dash-card__sub">Highest incentives this period</p>
                </div>
                {latestPeriod && (
                  <span className="header-badge">🏆 {latestPeriod}</span>
                )}
              </div>

              <div className="dash-card__body">
                {loading ? (
                  <div className="earner-list">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div className="earner-row" key={i}>
                        <Skeleton width="28px" height="22px" radius="4px" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <Skeleton width="70px" height="13px" />
                          </div>
                          <Skeleton width="100%" height="4px" radius="2px" />
                        </div>
                        <Skeleton width="65px" height="13px" style={{ flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                ) : topEarners.length === 0 ? (
                  <div className="dash-empty">
                    <span className="dash-empty-icon">📊</span>
                    <p>No earner data yet</p>
                  </div>
                ) : (
                  <div className="earner-list">
                    {topEarners.map((emp, i) => {
                      const pct = Math.round((emp.total_incentive / maxEarner) * 100);
                      return (
                        <div className="earner-row" key={emp.employee_id ?? i}>
                          <RankBadge rank={i + 1} />
                          <div className="earner-info">
                            <div className="earner-top">
                              <span className="earner-id">{emp.employee_id}</span>
                            </div>
                            <div className="earner-bar-track">
                              <div
                                className="earner-bar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="earner-amount">{fmt(emp.total_incentive)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="quick-actions">
            <div className="quick-actions__label">Quick Actions</div>
            <div className="quick-actions__row">
              {[
                {
                  label: "Upload Data",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  ),
                  path: "/upload",
                  primary: true,
                },
                {
                  label: "Run Calculation",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  ),
                  path: "/calculator",
                  primary: false,
                },
                {
                  label: "View Logs",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  ),
                  path: "/calculation-logs",
                  primary: false,
                },
                {
                  label: "Uploaded Files",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  ),
                  path: "/uploaded-files",
                  primary: false,
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`qa-btn ${action.primary ? "qa-btn--primary" : ""}`}
                  onClick={() => navigate(action.path)}
                >
                  <span className="qa-btn__icon">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;