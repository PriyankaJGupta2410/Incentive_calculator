import { useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/sidebar";

const cards = [
  {
    label: "Total Incentives",
    value: "₹12,45,000",
    change: "+8.2% this month",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: "card-blue",
  },
  {
    label: "Salespeople",
    value: "108",
    change: "+4 new this week",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "card-sky",
  },
  {
    label: "Branches",
    value: "7",
    change: "Across 4 states",
    positive: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: "card-indigo",
  },
  {
    label: "Exceptions",
    value: "6",
    change: "Needs review",
    positive: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    color: "card-amber",
  },
];

const tableData = [
  { id: "ASM1002", branch: "Mumbai-North",       role: "ASM", units: 45, incentive: "₹61,300", status: "Success"   },
  { id: "RM1015",  branch: "Delhi-West",          role: "RM",  units: 32, incentive: "₹41,200", status: "Success"   },
  { id: "ASM1045", branch: "Pune-Central",        role: "ASM", units: 38, incentive: "₹52,700", status: "Success"   },
  { id: "RM1008",  branch: "Chennai-East",        role: "RM",  units: 19, incentive: "₹22,500", status: "Pending"   },
  { id: "SM1031",  branch: "Bengaluru-South",     role: "SM",  units: 27, incentive: "₹35,100", status: "Success"   },
  { id: "ASM1060", branch: "Hyderabad-Central",   role: "ASM", units: 11, incentive: "₹14,800", status: "Exception" },
];

/* Total uploaded files count — keep in sync with your global files state / context */
const UPLOADED_FILES_COUNT = 6;

export default function Dashboard() {
  const [active, setActive]             = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  function handleLogout() {
    setShowLogoutModal(false);
    navigate("/login");
  }

  return (
    <div className="db-root">

      {/* ── Sidebar ── */}
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        uploadedFilesCount={UPLOADED_FILES_COUNT}
      />

      {/* ── Main ── */}
      <main className="db-main">

        {/* Top Bar */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-page-title">Incentive Dashboard</h1>
            <span className="db-breadcrumb">Overview · June 2025</span>
          </div>

          <div className="db-topbar-right">

            {/* Export */}
            <button className="db-export-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>

            {/* Notification */}
            <div className="db-notif">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="db-notif-dot" />
            </div>

            {/* Logout */}
            <button className="db-logout-btn" onClick={() => setShowLogoutModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>

          </div>
        </header>

        {/* ── Cards ── */}
        <section className="db-cards">
          {cards.map((card, i) => (
            <div
              className={`db-card ${card.color}`}
              key={card.label}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="db-card-top">
                <div className="db-card-icon">{card.icon}</div>
                <span className={`db-card-change ${card.positive === true ? "pos" : card.positive === false ? "neg" : "neu"}`}>
                  {card.positive === true && "▲ "}{card.positive === false && "▼ "}{card.change}
                </span>
              </div>
              <div className="db-card-value">{card.value}</div>
              <div className="db-card-label">{card.label}</div>
            </div>
          ))}
        </section>

        {/* ── Table ── */}
        <section className="db-table-section">
          <div className="db-table-header">
            <div>
              <h2 className="db-table-title">Salesperson Incentives</h2>
              <p className="db-table-sub">Showing {tableData.length} records for this cycle</p>
            </div>
            <div className="db-table-actions">
              <div className="db-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input placeholder="Search employee..." className="db-search-input" />
              </div>
              <button className="db-filter-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Branch</th>
                  <th>Role</th>
                  <th>Total Units</th>
                  <th>Incentive</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={row.id} style={{ animationDelay: `${i * 60 + 200}ms` }}>
                    <td><span className="db-emp-id">{row.id}</span></td>
                    <td>{row.branch}</td>
                    <td><span className="db-role-badge">{row.role}</span></td>
                    <td>
                      <div className="db-units-wrap">
                        <span>{row.units}</span>
                        <div className="db-units-bar">
                          <div className="db-units-fill" style={{ width: `${Math.min(row.units / 50 * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="db-incentive-val">{row.incentive}</td>
                    <td>
                      <span className={`db-status db-status-${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <button className="db-row-action">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="db-table-footer">
            <span>Showing 1–{tableData.length} of {tableData.length} results</span>
            <div className="db-pagination">
              <button className="db-page-btn" disabled>‹</button>
              <button className="db-page-btn db-page-active">1</button>
              <button className="db-page-btn">2</button>
              <button className="db-page-btn">›</button>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════
          LOGOUT CONFIRMATION MODAL
      ══════════════════════════════════════ */}
      {showLogoutModal && (
        <div className="db-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="db-logout-modal" onClick={e => e.stopPropagation()}>
            <div className="db-logout-modal-head">
              <div className="db-logout-modal-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div className="db-logout-modal-title">Logging out?</div>
              <div className="db-logout-modal-desc">
                You'll be signed out of your account. Any unsaved changes will be lost.
              </div>
            </div>
            <div className="db-logout-modal-actions">
              <button className="db-logout-modal-cancel" onClick={() => setShowLogoutModal(false)}>
                Stay logged in
              </button>
              <button className="db-logout-modal-confirm" onClick={handleLogout}>
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}