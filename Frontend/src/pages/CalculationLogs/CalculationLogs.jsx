import { useEffect, useState, useMemo } from "react";
import { calculationlogs } from "../../services/calculationlogsService";
import "./CalculationLogs.css";
import Sidebar from "../../components/sidebar/sidebar";

/* ─── Helpers ──────────────────────────────────────────────── */
const fmt = (n) =>
  n === 0 || n === undefined
    ? "₹0"
    : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const SCHEME_META = {
  "Team Milestones":           { cls: "tag-team",        icon: "👥" },
  "Tier-Based Performance":    { cls: "tag-tier",        icon: "🏆" },
  "Consistency Reward":        { cls: "tag-consistency", icon: "📅" },
  "Vehicle Type Boosts":       { cls: "tag-vehicle",     icon: "🚗" },
  "Branch Target Achievement": { cls: "tag-branch",      icon: "🎯" },
  "Cross-Selling Bonus":       { cls: "tag-cross",       icon: "🔄" },
};

const VEHICLE_COLORS = {
  commercial:     { cls: "vt-commercial",  label: "Commercial"    },
  "compact sedan":{ cls: "vt-compact",     label: "Compact Sedan" },
  "mid-size sedan":{ cls: "vt-midsedan",   label: "Mid-Size Sedan"},
  suv:            { cls: "vt-suv",         label: "SUV"           },
};

function SchemeTag({ name }) {
  const m = SCHEME_META[name] || { cls: "tag-default", icon: "•" };
  return <span className={`scheme-tag ${m.cls}`}>{m.icon} {name}</span>;
}

function VehicleTypeBadge({ type }) {
  const v = VEHICLE_COLORS[(type || "").toLowerCase()] || { cls: "vt-default", label: type };
  return <span className={`vt-badge ${v.cls}`}>{v.label}</span>;
}

/* ─── Per-Employee Breakdown Modal ─────────────────────────── */
function BreakdownModal({ emp, onClose }) {
  if (!emp) return null;

  /* Use amount >= 0 so we show all valid items */
  const adhoc      = (emp.details?.ad_hoc     || []).filter((a) => a.amount > 0);
  const structured = (emp.details?.structured || []);

  const adhocTotal      = adhoc.reduce((s, a) => s + (a.amount || 0), 0);
  const structuredTotal = structured.reduce((s, s2) => s + (s2.total || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">Incentive Breakdown</span>
            <h2 className="modal-title">{emp.employee_id}</h2>
            <div className="modal-chips">
              <span className="modal-chip">📆 {emp.calculation_period}</span>
              <span className="modal-chip modal-chip-mono">#{emp._id?.slice(0, 8)}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="modal-summary">
          {[
            { label: "Total Incentive", val: fmt(emp.total_incentive),      cls: "ms-indigo"  },
            { label: "Ad-hoc Total",    val: fmt(emp.ad_hoc_incentive),     cls: "ms-amber"   },
            { label: "Structured Total",val: fmt(emp.structured_incentive), cls: "ms-emerald" },
          ].map((c) => (
            <div key={c.label} className={`modal-summary-card ${c.cls}`}>
              <div className="ms-val">{c.val}</div>
              <div className="ms-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-scroll-body">
          {adhoc.length === 0 && structured.length === 0 && (
            <div className="modal-empty">No incentive breakdown available for this employee.</div>
          )}

          {/* ══ AD-HOC TABLE ══ */}
          {adhoc.length > 0 && (
            <div className="bk-section">
              <div className="bk-heading">
                <span className="bk-dot dot-amber" />
                Ad-hoc Incentives
                <span className="bk-count">{adhoc.length} scheme{adhoc.length !== 1 ? "s" : ""}</span>
                <span className="bk-section-total amber-total">{fmt(adhocTotal)}</span>
              </div>

              <div className="bk-table-wrap">
                <table className="bk-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Scheme</th>
                      <th>Condition / Rule</th>
                      <th className="col-amount">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adhoc.map((item, i) => (
                      <tr key={item.scheme_id ?? i}>
                        <td className="col-idx">{i + 1}</td>
                        <td>
                          <SchemeTag name={item.scheme_name} />
                        </td>
                        <td className="col-condition">{item.condition}</td>
                        <td className="col-amount">
                          <span className="amt-pill amt-amber">{fmt(item.amount)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bk-tfoot">
                      <td colSpan={3} className="tfoot-label">Ad-hoc Total</td>
                      <td className="col-amount tfoot-val">{fmt(adhocTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ══ STRUCTURED TABLE ══ */}
          {structured.length > 0 && (
            <div className="bk-section">
              <div className="bk-heading">
                <span className="bk-dot dot-emerald" />
                Structured Incentives
                <span className="bk-count">{structured.length} vehicle type{structured.length !== 1 ? "s" : ""}</span>
                <span className="bk-section-total emerald-total">{fmt(structuredTotal)}</span>
              </div>

              <div className="bk-table-wrap">
                <table className="bk-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vehicle Type</th>
                      <th>Rule</th>
                      <th className="col-center">Qty</th>
                      <th className="col-amount">Base</th>
                      <th className="col-center">Bonus Units</th>
                      <th className="col-amount">Bonus/Unit</th>
                      <th className="col-amount">Bonus Amt</th>
                      <th className="col-amount">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structured.map((s, i) => (
                      <tr key={i}>
                        <td className="col-idx">{i + 1}</td>
                        <td>
                          <VehicleTypeBadge type={s.vehicle_type} />
                        </td>
                        <td>
                          <span className="rule-chip">{s.rule_applied}</span>
                        </td>
                        <td className="col-center">
                          <span className="qty-chip">{s.quantity}</span>
                        </td>
                        <td className="col-amount">
                          <span className="amt-neutral">{fmt(s.base_amount)}</span>
                        </td>
                        <td className="col-center">
                          {s.bonus_units > 0 ? (
                            <span className="bonus-units-chip">{s.bonus_units}</span>
                          ) : (
                            <span className="col-dash">—</span>
                          )}
                        </td>
                        <td className="col-amount">
                          {s.bonus_per_unit > 0 ? (
                            <span className="amt-neutral">{fmt(s.bonus_per_unit)}</span>
                          ) : (
                            <span className="col-dash">—</span>
                          )}
                        </td>
                        <td className="col-amount">
                          {s.bonus_amount > 0 ? (
                            <span className="amt-emerald">{fmt(s.bonus_amount)}</span>
                          ) : (
                            <span className="col-dash">—</span>
                          )}
                        </td>
                        <td className="col-amount">
                          <span className="amt-pill amt-emerald-pill">{fmt(s.total)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bk-tfoot">
                      <td colSpan={8} className="tfoot-label">Structured Total</td>
                      <td className="col-amount tfoot-val emerald-total">{fmt(structuredTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Batch Section (card + inline employee table) ─────────── */
function BatchSection({ batch }) {
  const [expanded,   setExpanded]   = useState(false);
  const [empModal,   setEmpModal]   = useState(null);
  const [empSearch,  setEmpSearch]  = useState("");
  const [empSortDir, setEmpSortDir] = useState("asc");

  const employees = batch.employees || [];
  const batchTotal  = employees.reduce((s, e) => s + e.total_incentive, 0);
  const withStr     = employees.filter((e) => e.structured_incentive > 0).length;
  const maxInc      = Math.max(...employees.map((e) => e.total_incentive), 1);
  const topEarner   = employees.reduce(
    (best, e) => (e.total_incentive > (best?.total_incentive ?? -1) ? e : best),
    null
  );

  const filteredEmps = useMemo(() => {
    const q = empSearch.toLowerCase();
    return [...employees]
      .filter((e) => e.employee_id.toLowerCase().includes(q))
      .sort((a, b) =>
        empSortDir === "asc"
          ? a.employee_id.localeCompare(b.employee_id)
          : b.employee_id.localeCompare(a.employee_id)
      );
  }, [employees, empSearch, empSortDir]);

  return (
    <div className={`batch-card ${expanded ? "expanded" : ""}`}>

      {/* ── Batch Card Header ── */}
      <div className="batch-card-head">
        <div className="batch-head-left">
          <span className="batch-badge">{batch.batch_name}</span>
          <div className="batch-meta">
            <span className="batch-chip">📆 {batch.calculation_period}</span>
            <span className="batch-chip">
              {new Date(batch.created_date).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>
            <span className="batch-chip batch-id-chip" title={batch.calculation_batch_id}>
              #{batch.calculation_batch_id?.slice(0, 8)}
            </span>
          </div>
        </div>
        <div className="batch-head-right">
          <div className="batch-payout">
            <span className="batch-payout-val">{fmt(batchTotal)}</span>
            <span className="batch-payout-lbl">Total Payout</span>
          </div>
          <button
            className={`batch-expand-btn ${expanded ? "active" : ""}`}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide Employees ↑" : "View Employees ↓"}
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="batch-stats">
        {[
          { val: employees.length,          lbl: "Employees"      },
          { val: employees.length - withStr, lbl: "Ad-hoc Only"    },
          { val: withStr,                    lbl: "With Structured" },
          { val: topEarner?.employee_id ?? "—", lbl: "🏆 Top Earner", special: true },
        ].map((s, i, arr) => (
          <>
            <div key={s.lbl} className="batch-stat">
              <span className={`batch-stat-val ${s.special ? "top-earner-val" : ""}`}>{s.val}</span>
              <span className="batch-stat-lbl">{s.lbl}</span>
            </div>
            {i < arr.length - 1 && <div className="batch-stat-sep" />}
          </>
        ))}
      </div>

      {/* ── Mini Bar Preview ── */}
      {!expanded && (
        <div className="mini-bars">
          {employees.slice(0, 16).map((emp) => (
            <div
              key={emp._id}
              className={`mini-bar ${emp.structured_incentive > 0 ? "mbar-green" : "mbar-indigo"}`}
              style={{ height: `${Math.round((emp.total_incentive / maxInc) * 34) + 4}px` }}
              title={`${emp.employee_id}: ${fmt(emp.total_incentive)}`}
            />
          ))}
          {employees.length > 16 && (
            <span className="mini-bars-more">+{employees.length - 16}</span>
          )}
        </div>
      )}

      {/* ── Inline Employee Table ── */}
      {expanded && (
        <div className="emp-table-wrap">
          <div className="emp-table-toolbar">
            <div className="emp-search-wrap">
              <span className="emp-search-icon">⌕</span>
              <input
                className="emp-search"
                placeholder="Search employee ID…"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
              />
              {empSearch && (
                <button className="emp-search-clear" onClick={() => setEmpSearch("")}>✕</button>
              )}
            </div>
            <span className="emp-table-count">
              {filteredEmps.length} of {employees.length} employees
            </span>
          </div>

          <div className="emp-table-scroll">
            <table className="emp-table">
              <thead>
                <tr>
                  <th
                    className="sortable"
                    onClick={() => setEmpSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  >
                    Employee ID{" "}
                    <span className="sort-icon">{empSortDir === "asc" ? "↑" : "↓"}</span>
                  </th>
                  <th>Period</th>
                  <th>Ad-hoc</th>
                  <th>Structured</th>
                  <th>Total Incentive</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmps.length === 0 && (
                  <tr>
                    <td colSpan={7} className="emp-table-empty">
                      No employees match "{empSearch}"
                    </td>
                  </tr>
                )}
                {filteredEmps.map((emp) => {
                  const pct    = Math.round((emp.total_incentive / maxInc) * 100);
                  const hasStr = emp.structured_incentive > 0;
                  const isZero = emp.total_incentive === 0;
                  return (
                    <tr key={emp._id} className={isZero ? "row-zero" : ""}>
                      <td>
                        <span className="emp-id-cell">{emp.employee_id}</span>
                      </td>
                      <td className="cell-muted">{emp.calculation_period}</td>
                      <td>
                        <span className={`cell-amount ${isZero ? "zero" : ""}`}>
                          {fmt(emp.ad_hoc_incentive)}
                        </span>
                      </td>
                      <td>
                        {hasStr ? (
                          <span className="cell-amount green">{fmt(emp.structured_incentive)}</span>
                        ) : (
                          <span className="cell-dash">—</span>
                        )}
                      </td>
                      <td>
                        <div className="cell-total-wrap">
                          <span className={`cell-total ${isZero ? "zero" : ""}`}>
                            {fmt(emp.total_incentive)}
                          </span>
                          {!isZero && (
                            <div className="cell-bar-track">
                              <div
                                className={`cell-bar-fill ${hasStr ? "fill-green" : "fill-indigo"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {isZero ? (
                          <span className="type-badge badge-zero">No Incentive</span>
                        ) : hasStr ? (
                          <span className="type-badge badge-str">Structured</span>
                        ) : (
                          <span className="type-badge badge-adhoc">Ad-hoc</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="view-breakdown-btn"
                          onClick={() => setEmpModal(emp)}
                          disabled={isZero}
                          title={isZero ? "No breakdown available" : "View breakdown"}
                        >
                          {isZero ? "—" : "Breakdown →"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {empModal && <BreakdownModal emp={empModal} onClose={() => setEmpModal(null)} />}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function CalculationLogs() {
  const [batches,  setBatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [sortDir,  setSortDir]  = useState("desc");

  const [active,      setActive]      = useState("Calculation logs");
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
      .filter(
        (b) =>
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
    (s, b) => s + (b.employees || []).reduce((ss, e) => ss + e.total_incentive, 0),
    0
  );

  return (
    <div className="db-root">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="db-main">
        <div className="cl-root">

          <div className="cl-header">
            <div>
              <h1 className="cl-title">Calculation Logs</h1>
              <p className="cl-subtitle">All calculation batches with per-employee incentive details</p>
            </div>
            {!loading && !error && (
              <div className="cl-header-stats">
                {[
                  { val: batches.length,   lbl: "Batches"       },
                  { val: totalEmployees,   lbl: "Employees"     },
                  { val: fmt(totalPayout), lbl: "Total Payout"  },
                ].map((s, i, arr) => (
                  <>
                    <div key={s.lbl} className="hs-item">
                      <span className="hs-val">{s.val}</span>
                      <span className="hs-lbl">{s.lbl}</span>
                    </div>
                    {i < arr.length - 1 && <div className="hs-div" />}
                  </>
                ))}
              </div>
            )}
          </div>

          {!loading && !error && (
            <div className="cl-toolbar">
              <div className="cl-search-wrap">
                <span className="cl-search-icon">⌕</span>
                <input
                  className="cl-search"
                  placeholder="Search batch name or period…"
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
                {sortDir === "desc" ? "↓ Newest" : "↑ Oldest"}
              </button>
            </div>
          )}

          {loading && (
            <div className="cl-state">
              <div className="cl-spinner" />
              <p className="cl-state-text">Loading calculation logs…</p>
            </div>
          )}
          {error && !loading && (
            <div className="cl-state">
              <span className="cl-state-icon">⚠</span>
              <p className="cl-state-text">{error}</p>
              <button className="cl-retry-btn" onClick={fetchData}>↺ Retry</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="cl-state">
              <span className="cl-state-icon">🔍</span>
              <p className="cl-state-text">No batches match "{search}"</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="cl-list">
              {filtered.map((batch, idx) => (
                <BatchSection
                  key={batch.calculation_batch_id}
                  batch={batch}
                  idx={idx}
                />
              ))}
            </div>
          )}

          {!loading && !error && batches.length > 0 && (
            <p className="cl-footer">
              Showing {filtered.length} of {batches.length} batch{batches.length !== 1 ? "es" : ""}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}