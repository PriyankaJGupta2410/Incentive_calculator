import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/sidebar";
import "./Dashboard.css";

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

/* ─── Main Dashboard ───────────────────────────────────────── */
const Dashboard = () => {
  const [active, setActive]           = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    kpi: { batches: 0, employees: 0, total_payout: 0, avg_incentive: 0 },
    recent_batches: [],
    top_earners: [],
  });

  useEffect(() => {
    setData({
      kpi: {
        batches: 1,
        employees: 108,
        total_payout: 13154048,
        avg_incentive: 12180,
      },
      recent_batches: [
        {
          calculation_batch_id: "BATCH_001",
          calculation_period: "2025-09",
          employees: 108,
          total_payout: 13154048,
          status: "Completed",
        },
        {
          calculation_batch_id: "BATCH_002",
          calculation_period: "2025-08",
          employees: 97,
          total_payout: 11820000,
          status: "Completed",
        },
      ],
      top_earners: [
        { employee_id: "ASM1037", total: 85000, type: "Structured" },
        { employee_id: "ASM1092", total: 72000, type: "Ad-hoc"     },
        { employee_id: "ASM1101", total: 65000, type: "Structured" },
        { employee_id: "ASM1058", total: 58000, type: "Ad-hoc"     },
        { employee_id: "ASM1076", total: 51000, type: "Structured" },
      ],
    });
  }, []);

  const { kpi, recent_batches, top_earners } = data;
  const maxEarner = Math.max(...top_earners.map((e) => e.total), 1);

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
              <p className="dash-subtitle">Incentive calculations overview — September 2025</p>
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

          {/* ── KPI Grid ── */}
          <div className="kpi-grid">
            <KpiCard
              title="Total Batches"
              value={kpi.batches}
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
              value={kpi.employees}
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
              value={fmtCompact(kpi.total_payout)}
              sub={fmt(kpi.total_payout) + " exact"}
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
              value={fmtCompact(kpi.avg_incentive)}
              sub="Per employee"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              }
              accent="amber"
              delay={240}
            />
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
                {recent_batches.length === 0 ? (
                  <div className="dash-empty">
                    <span className="dash-empty-icon">📭</span>
                    <p>No batches yet</p>
                  </div>
                ) : (
                  <div className="batch-list">
                    {recent_batches.map((batch, i) => (
                      <div className="batch-row" key={i}>
                        <div className="batch-row__icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                        </div>
                        <div className="batch-row__info">
                          <span className="batch-row__id">{batch.calculation_batch_id}</span>
                          <span className="batch-row__period">📆 {batch.calculation_period}</span>
                        </div>
                        <div className="batch-row__meta">
                          <span className="batch-row__emp">{batch.employees} employees</span>
                          <span className="batch-status batch-status--done">{batch.status}</span>
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
                <span className="header-badge">🏆 Sep 2025</span>
              </div>

              <div className="dash-card__body">
                {top_earners.length === 0 ? (
                  <div className="dash-empty">
                    <span className="dash-empty-icon">📊</span>
                    <p>No earner data yet</p>
                  </div>
                ) : (
                  <div className="earner-list">
                    {top_earners.map((emp, i) => {
                      const pct = Math.round((emp.total / maxEarner) * 100);
                      return (
                        <div className="earner-row" key={i}>
                          <RankBadge rank={i + 1} />
                          <div className="earner-info">
                            <div className="earner-top">
                              <span className="earner-id">{emp.employee_id}</span>
                              <span className={`earner-type earner-type--${emp.type === "Structured" ? "str" : "adhoc"}`}>
                                {emp.type}
                              </span>
                            </div>
                            <div className="earner-bar-track">
                              <div
                                className="earner-bar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="earner-amount">{fmt(emp.total)}</span>
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