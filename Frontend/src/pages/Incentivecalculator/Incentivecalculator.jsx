import React, { useState, useEffect } from "react";
import "./Incentivecalculator.css";
import Sidebar from "../../components/sidebar/sidebar";
import { useNavigate } from "react-router-dom";
import {salesDropdown} from "../../services/salesdropdownService"
import { incentiveDropdown } from "../../services/incentivedropdownService";
import { adhocDropdown } from "../../services/adhocdropdownService";

/* ── Calculation run steps shown in status panel ── */
const RUN_STEPS = [
  { key: "validate", label: "Validating selected files" },
  { key: "load",     label: "Loading data from database" },
  { key: "process",  label: "Processing incentive rules" },
  { key: "compute",  label: "Computing payouts" },
  { key: "save",     label: "Saving results" },
];

/* ── Spinner icon ── */
const SpinIcon = ({ size = 14 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

/* ── Normalise a file object from any of the three APIs ──
   Each API returns slightly different shapes; this flattens
   them into { id, file_name, upload_date, uploaded_by }     */
function normaliseFile(f) {
  return {
    id:          f.id          ?? f._id         ?? f.upload_id ?? f.value ?? f,
    file_name:   f.file_name   ?? f.name        ?? f.label     ?? String(f),
    upload_date: f.upload_date ?? f.created_at  ?? f.date      ?? "",
    uploaded_by: f.uploaded_by ?? f.uploaded_by ?? "—",
  };
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function IncentiveCalculator() {
  const navigate = useNavigate();
  const [active, setActive]           = useState("Incentive Rules");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* File lists from APIs */
  const [salesFiles,     setSalesFiles]     = useState([]);
  const [incentiveFiles, setIncentiveFiles] = useState([]);
  const [adhocFiles,     setAdhocFiles]     = useState([]);
  const [filesLoading,   setFilesLoading]   = useState(true);
  const [fetchError,     setFetchError]     = useState("");

  /* Selected IDs */
  const [selectedSales,     setSelectedSales]     = useState("");
  const [selectedIncentive, setSelectedIncentive] = useState("");
  const [selectedAdhoc,     setSelectedAdhoc]     = useState("");

  /* Calculation state */
  const [calcStatus,  setCalcStatus]  = useState("idle"); // idle | running | success | error
  const [runStepIdx,  setRunStepIdx]  = useState(-1);
  const [calcResult,  setCalcResult]  = useState(null);
  const [calcError,   setCalcError]   = useState("");
  const [validErrors, setValidErrors] = useState([]);

  /* ── Load all three dropdowns in parallel ── */
  useEffect(() => {
    const fetchAll = async () => {
      setFilesLoading(true);
      setFetchError("");
      try {
        const [salesRaw, incentiveRaw, adhocRaw] = await Promise.all([
          salesDropdown(),
          incentiveDropdown(),
          adhocDropdown(),
        ]);
        setSalesFiles(salesRaw.map(normaliseFile));
        setIncentiveFiles(incentiveRaw.map(normaliseFile));
        setAdhocFiles(adhocRaw.map(normaliseFile));
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
        setFetchError("Failed to load file lists. Please refresh and try again.");
      } finally {
        setFilesLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* helpers */
  function fileById(list, id) {
    return list.find(f => String(f.id) === String(id));
  }

  function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  /* ── Validate and Run ── */
  async function handleCalculate() {
    const errors = [];
    if (!selectedSales)     errors.push("Please select a Sales Data file.");
    if (!selectedIncentive) errors.push("Please select an Incentive Sales Data file.");
    if (errors.length) { setValidErrors(errors); return; }

    setValidErrors([]);
    setCalcStatus("running");
    setCalcResult(null);
    setCalcError("");
    setRunStepIdx(0);

    try {
      /* Step-by-step progress animation */
      for (let i = 0; i < RUN_STEPS.length; i++) {
        setRunStepIdx(i);
        await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
      }

      /* ── Real API call — uncomment and wire your endpoint ──────────
         import axios from "axios";
         import BASE_URL from "../../config/apiConfig";

         const payload = {
           period:               "",                         // add period field if needed
           sales_upload_id:      selectedSales,
           structured_upload_id: selectedIncentive,
           adhoc_upload_id:      selectedAdhoc || null,
         };

         const res = await axios.post(
           `${BASE_URL}/incentive/calculate`,
           payload,
           { headers: { "x-access-token": localStorage.getItem("token") } }
         );
         if (!res.data.status) throw new Error(res.data.message);
         const apiResult = res.data.res_data;
      ─────────────────────────────────────────────────────────────── */

      /* Mock result — remove once real API is wired */
      setCalcResult({
        total_incentive:   "₹14,82,500",
        records_processed: 108,
        exceptions:        6,
        duration_ms:       2340,
        sales_file:    fileById(salesFiles,     selectedSales)?.file_name,
        incentive_file: fileById(incentiveFiles, selectedIncentive)?.file_name,
        adhoc_file:    selectedAdhoc ? fileById(adhocFiles, selectedAdhoc)?.file_name : null,
      });
      setCalcStatus("success");
    } catch (err) {
      setCalcError(err.message || "Calculation failed. Please try again.");
      setCalcStatus("error");
    }
  }

  /* status dot / icon class helpers */
  function statusDotClass() {
    if (calcStatus === "running") return "dot-running";
    if (calcStatus === "success") return "dot-success";
    if (calcStatus === "error")   return "dot-error";
    return "dot-idle";
  }

  function statusIconClass() {
    if (calcStatus === "running") return "status-icon-running";
    if (calcStatus === "success") return "status-icon-success";
    if (calcStatus === "error")   return "status-icon-error";
    return "status-icon-idle";
  }

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="calc-page">

      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="calc-main">

        {/* Topbar */}
        <header className="calc-topbar">
          <div className="calc-topbar-left">
            <h1 className="calc-page-title">Incentive Calculator</h1>
            <span className="calc-breadcrumb">Dashboard · Calculator · Select Datasets</span>
          </div>
          <div className="calc-topbar-right">
            <button className="calc-upload-link" onClick={() => navigate("/upload")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              </svg>
              Upload More Files
            </button>
          </div>
        </header>

        {/* Global fetch error banner */}
        {fetchError && (
          <div className="calc-fetch-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {fetchError}
          </div>
        )}

        <div className="calc-body">

          {/* ══ LEFT: Selection Panel ══ */}
          <div className="calc-selection-panel">

            <div className="calc-panel-head">
              <div>
                <div className="calc-panel-title">Select Datasets</div>
                <div className="calc-panel-sub">Choose which uploaded files to use for this calculation run</div>
              </div>
              <span className="calc-panel-badge">Step 2 of 2</span>
            </div>

            <div className="calc-dropdowns">

              {/* ── Dropdown 1: Sales Data ── */}
              <div className="calc-dd-group" style={{ animationDelay: "0ms" }}>
                <div className="calc-dd-label-row">
                  <label className="calc-dd-label">
                    <div className="calc-dd-label-icon dd-icon-blue">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    Select Sales File
                  </label>
                  <span className="calc-dd-req-badge req-blue">Required</span>
                </div>

                <div className="calc-select-wrap">
                  {filesLoading ? (
                    <select className="calc-select" disabled>
                      <option>Loading files...</option>
                    </select>
                  ) : (
                    <select
                      className="calc-select"
                      value={selectedSales}
                      onChange={e => { setSelectedSales(e.target.value); setValidErrors([]); }}
                    >
                      <option value="">— Choose a sales file —</option>
                      {salesFiles.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.file_name}{f.upload_date ? ` · ${fmtDate(f.upload_date)}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedSales && (() => {
                  const f = fileById(salesFiles, selectedSales);
                  return f ? (
                    <div className="calc-selected-chip chip-blue">
                      <div className="calc-chip-icon chip-icon-blue">CSV</div>
                      <div className="calc-chip-info">
                        <div className="calc-chip-name chip-name-blue">{f.file_name}</div>
                        <div className="calc-chip-meta">
                          {f.upload_date ? `Uploaded ${fmtDate(f.upload_date)} · ` : ""}
                          {f.uploaded_by !== "—" ? `by ${f.uploaded_by}` : ""}
                        </div>
                      </div>
                      <div className="calc-chip-check">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  ) : null;
                })()}

                <p className="calc-dd-help">
                  {filesLoading
                    ? "Fetching sales files…"
                    : salesFiles.length > 0
                      ? `${salesFiles.length} sales file${salesFiles.length !== 1 ? "s" : ""} available`
                      : "No sales files uploaded yet"}
                </p>
              </div>

              {/* ── Dropdown 2: Incentive (Structured) Data ── */}
              <div className="calc-dd-group" style={{ animationDelay: "70ms" }}>
                <div className="calc-dd-label-row">
                  <label className="calc-dd-label">
                    <div className="calc-dd-label-icon dd-icon-indigo">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    Select Incentive File
                  </label>
                  <span className="calc-dd-req-badge req-indigo">Required</span>
                </div>

                <div className="calc-select-wrap">
                  {filesLoading ? (
                    <select className="calc-select" disabled>
                      <option>Loading files...</option>
                    </select>
                  ) : (
                    <select
                      className="calc-select indigo-focus"
                      value={selectedIncentive}
                      onChange={e => { setSelectedIncentive(e.target.value); setValidErrors([]); }}
                    >
                      <option value="">— Choose an incentive file —</option>
                      {incentiveFiles.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.file_name}{f.upload_date ? ` · ${fmtDate(f.upload_date)}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedIncentive && (() => {
                  const f = fileById(incentiveFiles, selectedIncentive);
                  return f ? (
                    <div className="calc-selected-chip chip-indigo">
                      <div className="calc-chip-icon chip-icon-indigo">CSV</div>
                      <div className="calc-chip-info">
                        <div className="calc-chip-name chip-name-indigo">{f.file_name}</div>
                        <div className="calc-chip-meta">
                          {f.upload_date ? `Uploaded ${fmtDate(f.upload_date)} · ` : ""}
                          {f.uploaded_by !== "—" ? `by ${f.uploaded_by}` : ""}
                        </div>
                      </div>
                      <div className="calc-chip-check">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  ) : null;
                })()}

                <p className="calc-dd-help">
                  {filesLoading
                    ? "Fetching incentive files…"
                    : incentiveFiles.length > 0
                      ? `${incentiveFiles.length} incentive file${incentiveFiles.length !== 1 ? "s" : ""} available`
                      : "No incentive files uploaded yet"}
                </p>
              </div>

              {/* ── Dropdown 3: Adhoc (Optional) ── */}
              <div className="calc-dd-group" style={{ animationDelay: "140ms" }}>
                <div className="calc-dd-label-row">
                  <label className="calc-dd-label">
                    <div className="calc-dd-label-icon dd-icon-teal">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"/>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                      </svg>
                    </div>
                    Select Adhoc File
                  </label>
                  <span className="calc-dd-req-badge req-opt">Optional</span>
                </div>

                <div className="calc-select-wrap">
                  {filesLoading ? (
                    <select className="calc-select" disabled>
                      <option>Loading files...</option>
                    </select>
                  ) : (
                    <select
                      className="calc-select teal-focus"
                      value={selectedAdhoc}
                      onChange={e => setSelectedAdhoc(e.target.value)}
                    >
                      <option value="">— None (optional) —</option>
                      {adhocFiles.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.file_name}{f.upload_date ? ` · ${fmtDate(f.upload_date)}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedAdhoc && (() => {
                  const f = fileById(adhocFiles, selectedAdhoc);
                  return f ? (
                    <div className="calc-selected-chip chip-teal">
                      <div className="calc-chip-icon chip-icon-teal">CSV</div>
                      <div className="calc-chip-info">
                        <div className="calc-chip-name chip-name-teal">{f.file_name}</div>
                        <div className="calc-chip-meta">
                          {f.upload_date ? `Uploaded ${fmtDate(f.upload_date)} · ` : ""}
                          {f.uploaded_by !== "—" ? `by ${f.uploaded_by}` : ""}
                        </div>
                      </div>
                      <div className="calc-chip-check">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  ) : null;
                })()}

                <p className="calc-dd-help">
                  {filesLoading
                    ? "Fetching adhoc files…"
                    : "Skip to run without adhoc override data"}
                </p>
              </div>

            </div>{/* /calc-dropdowns */}

            {/* Run button */}
            <div className="calc-run-section">
              <div className="calc-run-divider" />

              {validErrors.length > 0 && (
                <div className="calc-validation-errors">
                  {validErrors.map((e, i) => (
                    <div key={i} className="calc-val-error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {e}
                    </div>
                  ))}
                </div>
              )}

              <button
                className="calc-run-btn"
                onClick={handleCalculate}
                disabled={calcStatus === "running" || filesLoading}
              >
                {calcStatus === "running" ? (
                  <><SpinIcon size={16} /> Running Calculation...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Run Incentive Calculation
                  </>
                )}
              </button>
            </div>

          </div>{/* /calc-selection-panel */}

          {/* ══ RIGHT PANEL ══ */}
          <div className="calc-right">

            {/* Status Card */}
            <div className="calc-status-card">
              <div className="calc-status-head">
                <div className={`calc-status-head-icon ${statusIconClass()}`}>
                  {calcStatus === "idle" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  )}
                  {calcStatus === "running" && <SpinIcon size={16} />}
                  {calcStatus === "success" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {calcStatus === "error" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  )}
                </div>
                <div className="calc-status-head-text">
                  <div className="calc-status-head-title">
                    {calcStatus === "idle"    && "Awaiting calculation"}
                    {calcStatus === "running" && "Running..."}
                    {calcStatus === "success" && "Calculation complete"}
                    {calcStatus === "error"   && "Calculation failed"}
                  </div>
                  <div className="calc-status-head-sub">
                    {calcStatus === "idle"    && "Select files and click Run"}
                    {calcStatus === "running" && `Step ${Math.min(runStepIdx + 1, RUN_STEPS.length)} of ${RUN_STEPS.length}`}
                    {calcStatus === "success" && "Results are ready below"}
                    {calcStatus === "error"   && "Check the error below"}
                  </div>
                </div>
                <div className={`calc-status-dot ${statusDotClass()}`} />
              </div>

              <div className="calc-status-body">

                {calcStatus === "idle" && (
                  <div className="calc-status-idle">
                    <div className="calc-status-idle-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    </div>
                    <div className="calc-status-idle-title">Ready to calculate</div>
                    <div className="calc-status-idle-sub">Select your datasets and click Run</div>
                  </div>
                )}

                {calcStatus === "running" && (
                  <div className="calc-status-running">
                    {RUN_STEPS.map((step, i) => {
                      const isDone   = i < runStepIdx;
                      const isActive = i === runStepIdx;
                      return (
                        <div
                          key={step.key}
                          className={`calc-run-step${isDone ? " step-done" : isActive ? " step-active" : ""}`}
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <div className={`calc-run-step-icon ${isDone ? "step-icon-done" : isActive ? "step-icon-active" : "step-icon-wait"}`}>
                            {isDone ? (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            ) : isActive ? (
                              <SpinIcon size={10} />
                            ) : (
                              <span style={{ fontSize: 9, fontWeight: 800 }}>{i + 1}</span>
                            )}
                          </div>
                          {step.label}
                        </div>
                      );
                    })}
                  </div>
                )}

                {calcStatus === "success" && calcResult && (
                  <div className="calc-result">
                    <div className="calc-result-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Calculation Successful
                    </div>
                    <div className="calc-result-row"><span>Total Incentive</span><strong>{calcResult.total_incentive}</strong></div>
                    <div className="calc-result-row"><span>Records Processed</span><strong>{calcResult.records_processed}</strong></div>
                    <div className="calc-result-row"><span>Exceptions Found</span><strong>{calcResult.exceptions}</strong></div>
                    <div className="calc-result-row"><span>Duration</span><strong>{calcResult.duration_ms} ms</strong></div>
                    <div className="calc-result-row"><span>Sales File</span><strong style={{ fontSize: 11 }}>{calcResult.sales_file}</strong></div>
                    <div className="calc-result-row"><span>Incentive File</span><strong style={{ fontSize: 11 }}>{calcResult.incentive_file}</strong></div>
                    {calcResult.adhoc_file && (
                      <div className="calc-result-row"><span>Adhoc File</span><strong style={{ fontSize: 11 }}>{calcResult.adhoc_file}</strong></div>
                    )}
                  </div>
                )}

                {calcStatus === "error" && (
                  <div className="calc-result-error">
                    ⚠ {calcError || "An unexpected error occurred."}
                  </div>
                )}

              </div>
            </div>{/* /calc-status-card */}

            {/* How It Works Card */}
            <div className="calc-how-card">
              <div className="calc-how-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                How the calculation works
              </div>

              <div className="calc-how-step">
                <div className="calc-how-num how-num-blue">1</div>
                <div className="calc-how-text"><strong>Sales file</strong> is loaded — units, targets, and branch data per salesperson.</div>
              </div>
              <div className="calc-how-step">
                <div className="calc-how-num how-num-indigo">2</div>
                <div className="calc-how-text"><strong>Incentive file</strong> defines slab percentages, thresholds, and role conditions.</div>
              </div>
              <div className="calc-how-step">
                <div className="calc-how-num how-num-teal">3</div>
                <div className="calc-how-text"><strong>Adhoc file</strong> (optional) applies one-off overrides or exception rules.</div>
              </div>
              <div className="calc-how-step">
                <div className="calc-how-num how-num-green">4</div>
                <div className="calc-how-text">Engine <strong>computes payout</strong> per employee and flags exceptions for review.</div>
              </div>
            </div>

          </div>{/* /calc-right */}

        </div>{/* /calc-body */}

      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}