import { useEffect, useState, useMemo } from "react";
import { calculationlogs } from "../../services/calculationlogsService"; // adjust path as needed
import "./CalculationLogs.css";
import Sidebar from "../../components/sidebar/sidebar";

/* ─── helpers ─────────────────────────────────────────────────────── */
const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const SCHEME_META = {
  "Team Milestones":          { cls: "tag-team",        icon: "👥" },
  "Tier-Based Performance":   { cls: "tag-tier",        icon: "🏆" },
  "Consistency Reward":       { cls: "tag-consistency", icon: "📅" },
  "Vehicle Type Boosts":      { cls: "tag-vehicle",     icon: "🚗" },
  "Branch Target Achievement":{ cls: "tag-branch",      icon: "🎯" },
  "Cross-Selling Bonus":      { cls: "tag-cross",       icon: "🔄" },
};

function SchemeTag({ name }) {
  const meta = SCHEME_META[name] || { cls: "tag-default", icon: "•" };
  return (
    <span className={`scheme-tag ${meta.cls}`}>
      {meta.icon} {name}
    </span>
  );
}

/* ─── Detail Modal ─────────────────────────────────────────────────── */
function DetailModal({ batch, onClose }) {
  if (!batch) return null;
  const employees  = batch.employees || [];
  const [activeEmp, setActiveEmp] = useState(employees[0] || null);

  const validAdhoc = (emp) =>
    (emp?.details?.ad_hoc || []).filter((a) => a.amount >= 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Modal Header ── */}
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-eyebrow">Batch Details</span>
            <h2 className="modal-title">{batch.batch_name}</h2>
            <div className="modal-chips">
              <span className="modal-chip">📆 {batch.calculation_period}</span>
              <span className="modal-chip">{employees.length} Employees</span>
              <span className="modal-chip">
                {new Date(batch.created_date).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* ── Employee Sidebar ── */}
          <aside className="emp-sidebar">
            <p className="emp-sidebar-label">Employees</p>
            {employees.map((emp) => (
              <button
                key={emp._id}
                className={`emp-sidebar-item ${activeEmp?._id === emp._id ? "active" : ""}`}
                onClick={() => setActiveEmp(emp)}
              >
                <span className="emp-id-text">{emp.employee_id}</span>
                <span className={`emp-inc-badge ${emp.structured_incentive > 0 ? "badge-green" : "badge-gray"}`}>
                  {fmt(emp.total_incentive)}
                </span>
              </button>
            ))}
          </aside>

          {/* ── Employee Detail ── */}
          {activeEmp && (
            <div className="emp-detail">

              {/* Summary cards */}
              <div className="summary-grid">
                {[
                  { label: "Total Incentive", val: fmt(activeEmp.total_incentive),      cls: "card-indigo"  },
                  { label: "Ad-hoc",          val: fmt(activeEmp.ad_hoc_incentive),     cls: "card-amber"   },
                  { label: "Structured",      val: fmt(activeEmp.structured_incentive), cls: "card-emerald" },
                ].map((c) => (
                  <div key={c.label} className={`summary-card ${c.cls}`}>
                    <div className="summary-val">{c.val}</div>
                    <div className="summary-label">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Ad-hoc list */}
              {validAdhoc(activeEmp).length > 0 && (
                <div className="breakdown-section">
                  <div className="breakdown-heading">
                    <span className="breakdown-dot dot-amber" />
                    Ad-hoc Incentives
                    <span className="breakdown-count">{validAdhoc(activeEmp).length} items</span>
                  </div>
                  {validAdhoc(activeEmp).map((item, i) => (
                    <div key={i} className="breakdown-row">
                      <div className="breakdown-left">
                        <SchemeTag name={item.scheme_name} />
                        <p className="breakdown-condition">{item.condition}</p>
                      </div>
                      <div className="breakdown-amount">{fmt(item.amount)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Structured list */}
              {(activeEmp.details?.structured || []).length > 0 && (
                <div className="breakdown-section">
                  <div className="breakdown-heading">
                    <span className="breakdown-dot dot-emerald" />
                    Structured Incentives
                  </div>
                  {activeEmp.details.structured.map((s, i) => (
                    <div key={i} className="breakdown-row structured-row">
                      <div className="breakdown-left">
                        <span className="structured-model">{s.vehicle_model}</span>
                        <div className="structured-chips">
                          <span className="structured-chip">{s.vehicle_type.toUpperCase()}</span>
                          <span className="structured-chip">{s.rule_applied}</span>
                          <span className="structured-chip">Qty: {s.quantity}</span>
                        </div>
                      </div>
                      <div className="breakdown-amount green">{fmt(s.amount)}</div>
                    </div>
                  ))}
                </div>
              )}

              {validAdhoc(activeEmp).length === 0 &&
                (activeEmp.details?.structured || []).length === 0 && (
                  <div className="empty-detail">No breakdown details available for this employee.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function CalculationLogs() {
  const [batches,  setBatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [sortDir,  setSortDir]  = useState("desc");
  const [selected, setSelected] = useState(null);

  const [active, setActive]           = useState("Calculation logs");
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await calculationlogs();
      setBatches(data);
    } catch {
      setError("Failed to load calculation logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...batches]
      .filter((b) =>
        (b.batch_name || "").toLowerCase().includes(q) ||
        (b.calculation_period || "").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const diff = new Date(b.created_date) - new Date(a.created_date);
        return sortDir === "desc" ? diff : -diff;
      });
  }, [batches, search, sortDir]);

  const totalEmployees = batches.reduce((s, b) => s + (b.employees?.length || 0), 0);
  const totalPayout    = batches.reduce(
    (s, b) => s + (b.employees || []).reduce((ss, e) => ss + e.total_incentive, 0), 0
  );

  return (
    <div className="db-root">
         <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

    {/* ── Main Content ── */}
      <main className="db-main">

    <div className="cl-root">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {/* ── Page Header ── */}
      <div className="cl-header">
        <div className="cl-header-text">
          <h1 className="cl-title">Calculation Logs</h1>
          <p className="cl-subtitle">View all batches and per-employee incentive breakdowns</p>
        </div>
        {!loading && !error && (
          <div className="cl-header-stats">
            <div className="header-stat">
              <span className="header-stat-val">{batches.length}</span>
              <span className="header-stat-label">Batches</span>
            </div>
            <div className="header-stat-div" />
            <div className="header-stat">
              <span className="header-stat-val">{totalEmployees}</span>
              <span className="header-stat-label">Employees</span>
            </div>
            <div className="header-stat-div" />
            <div className="header-stat">
              <span className="header-stat-val">{fmt(totalPayout)}</span>
              <span className="header-stat-label">Total Payout</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      {!loading && !error && (
        <div className="cl-toolbar">
          <div className="cl-search-wrap">
            <span className="cl-search-icon">⌕</span>
            <input
              className="cl-search"
              placeholder="Search batch, period or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="cl-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <button
            className="cl-sort-btn"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          >
            {sortDir === "desc" ? "↓ Newest first" : "↑ Oldest first"}
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="cl-state">
          <div className="cl-spinner" />
          <p className="cl-state-text">Loading calculation logs…</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="cl-state">
          <span className="cl-state-icon">⚠</span>
          <p className="cl-state-text">{error}</p>
          <button className="cl-retry-btn" onClick={fetchData}>↺ Retry</button>
        </div>
      )}

      {/* ── Empty search result ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="cl-state">
          <span className="cl-state-icon">🔍</span>
          <p className="cl-state-text">No batches match "{search}"</p>
        </div>
      )}

      {/* ── Batch Cards ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="cl-list">
          {filtered.map((batch, idx) => {
            const emps        = batch.employees || [];
            const batchTotal  = emps.reduce((s, e) => s + e.total_incentive, 0);
            const withStr     = emps.filter((e) => e.structured_incentive > 0).length;
            const maxInc      = Math.max(...emps.map((e) => e.total_incentive), 1);
            const topEarner   = emps.find((e) => e.total_incentive === maxInc);

            return (
              <div
                className="cl-card"
                key={batch.calculation_batch_id}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Card header row */}
                <div className="cl-card-head">
                  <div className="cl-card-head-left">
                    <span className="cl-batch-badge">{batch.batch_name}</span>
                    <div className="cl-card-meta">
                      <span className="cl-meta-chip">📆 {batch.calculation_period}</span>
                      <span className="cl-meta-chip">
                        {new Date(batch.created_date).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="cl-card-head-right">
                    <div className="cl-payout-block">
                      <span className="cl-payout-val">{fmt(batchTotal)}</span>
                      <span className="cl-payout-label">Total Payout</span>
                    </div>
                    <button className="cl-view-btn" onClick={() => setSelected(batch)}>
                      View Details →
                    </button>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="cl-stats-strip">
                  <div className="cl-stat">
                    <span className="cl-stat-val">{emps.length}</span>
                    <span className="cl-stat-lbl">Employees</span>
                  </div>
                  <div className="cl-stat-sep" />
                  <div className="cl-stat">
                    <span className="cl-stat-val">{emps.length - withStr}</span>
                    <span className="cl-stat-lbl">Ad-hoc Only</span>
                  </div>
                  <div className="cl-stat-sep" />
                  <div className="cl-stat">
                    <span className="cl-stat-val">{withStr}</span>
                    <span className="cl-stat-lbl">With Structured</span>
                  </div>
                  {topEarner && (
                    <>
                      <div className="cl-stat-sep" />
                      <div className="cl-stat">
                        <span className="cl-stat-val cl-top-earner">{topEarner.employee_id}</span>
                        <span className="cl-stat-lbl">🏆 Top Earner</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Mini bar chart */}
                <div className="cl-mini-bars">
                  {emps.slice(0, 12).map((emp) => (
                    <div
                      key={emp._id}
                      className={`cl-bar ${emp.structured_incentive > 0 ? "bar-green" : "bar-indigo"}`}
                      style={{ height: `${Math.round((emp.total_incentive / maxInc) * 36) + 4}px` }}
                      title={`${emp.employee_id}: ${fmt(emp.total_incentive)}`}
                    />
                  ))}
                  {emps.length > 12 && (
                    <span className="cl-bars-more">+{emps.length - 12}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {!loading && !error && batches.length > 0 && (
        <p className="cl-footer">
          Showing {filtered.length} of {batches.length} batch{batches.length !== 1 ? "es" : ""}
        </p>
      )}

      {/* Detail modal */}
      {selected && <DetailModal batch={selected} onClose={() => setSelected(null)} />}
    </div>
        </main>
    </div>
  );
}