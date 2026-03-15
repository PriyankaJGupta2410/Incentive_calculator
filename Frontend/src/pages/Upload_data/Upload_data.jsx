import React, { useState, useRef } from "react";
import "./Upload_data.css";
import Sidebar from "../../components/sidebar/sidebar";
import { uploadSales } from "../../services/uploadsalesService";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */

/* Required columns for Sales CSV */
const SALES_REQUIRED_COLUMNS = [
  "Employee_ID",
  "Branch",
  "Role",
  "Vehicle_Model",
  "Quantity",
  "Sale_Date",
  "Vehicle_Type",
];

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function fmtBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getExt(name = "") {
  return name.split(".").pop().toLowerCase();
}

function validateExt(file, allowed) {
  if (!file) return "Please select a file first.";
  if (!allowed.includes(getExt(file.name)))
    return `Invalid type. Accepted: ${allowed.map(e => "." + e).join(", ")}`;
  return null;
}

/**
 * Reads the first line of a CSV / text file and returns the header columns.
 * Works for comma, semicolon, and tab-separated files.
 */
function parseCSVHeaders(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const firstLine = text.split(/\r?\n/)[0];
      // detect delimiter
      const delimiter = firstLine.includes("\t") ? "\t"
        : firstLine.includes(";") ? ";"
        : ",";
      const headers = firstLine
        .split(delimiter)
        .map(h => h.trim().replace(/^"|"$/g, "")); // strip surrounding quotes
      resolve(headers);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    // read only first 2KB — enough for headers
    reader.readAsText(file.slice(0, 2048));
  });
}

/**
 * Checks which required columns are missing from the actual headers.
 * Case-insensitive comparison.
 */
function findMissingColumns(actualHeaders, required) {
  const normalised = actualHeaders.map(h => h.toLowerCase());
  return required.filter(col => !normalised.includes(col.toLowerCase()));
}

/* ══════════════════════════════════════
   SHARED ICONS
══════════════════════════════════════ */
const SpinIcon = () => (
  <svg
    width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const UploadArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </svg>
);

const FileIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

/* ══════════════════════════════════════
   REUSABLE DROPZONE
══════════════════════════════════════ */
function DropZone({ file, onFile, accept, dzBase, iconClass, label, overClass }) {
  const [over, setOver] = useState(false);
  const ref = useRef(null);

  function pick(f) { if (f) onFile(f); }

  return (
    <div
      className={[
        "usc-dropzone",
        dzBase,
        over ? overClass : "",
        file ? "usc-dz-has-file" : "",
      ].filter(Boolean).join(" ")}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
      onClick={() => !file && ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={e => { pick(e.target.files[0]); e.target.value = ""; }}
      />

      {file ? (
        <>
          {/* Done icon */}
          <div className="usc-dz-icon usc-dz-icon-done">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="usc-dz-label" style={{ color: "#15803d" }}>File ready to upload</p>

          {/* File chip */}
          <div className="usc-file-chip" onClick={e => e.stopPropagation()}>
            <div className="usc-chip-ext">{getExt(file.name).toUpperCase()}</div>
            <span className="usc-chip-name" title={file.name}>{file.name}</span>
            <span className="usc-chip-size">{fmtBytes(file.size)}</span>
            <button
              className="usc-chip-remove"
              title="Remove"
              onClick={e => { e.stopPropagation(); onFile(null); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`usc-dz-icon ${iconClass}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            </svg>
          </div>
          <p className="usc-dz-label">{label}</p>
          <p className="usc-dz-sub">or click to browse</p>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   COLUMN VALIDATION RESULT UI
══════════════════════════════════════ */
function ColumnValidation({ missingCols }) {
  if (missingCols === null) return null; // not validated yet

  const isValid = missingCols.length === 0;

  return (
    <div className={`usc-col-validation ${isValid ? "valid" : "invalid"}`}>
      <div className={`usc-col-val-title ${isValid ? "valid" : "invalid"}`}>
        {isValid ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            All required columns found
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Missing {missingCols.length} required column{missingCols.length > 1 ? "s" : ""}
          </>
        )}
      </div>
      {!isValid && (
        <div className="usc-col-val-missing">
          {missingCols.map(col => (
            <span key={col} className="usc-missing-tag">{col}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function Upload_data() {
  const navigate = useNavigate();
  const [active, setActive]           = useState("Upload Data");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── Card 1: Sales Data (CSV / XLSX / XLS) ── */
  const [salesFile, setSalesFile]         = useState(null);
  const [salesMsg, setSalesMsg]           = useState("");
  const [salesStatus, setSalesStatus]     = useState(""); // "success" | "error"
  const [salesLoading, setSalesLoading]   = useState(false);
  const [salesMissing, setSalesMissing]   = useState(null); // null = not checked yet

  /* ── Card 2: Incentive Sales Data (CSV / XLSX / XLS) ── */
  const [incentiveFile, setIncentiveFile]       = useState(null);
  const [incentiveMsg, setIncentiveMsg]         = useState("");
  const [incentiveStatus, setIncentiveStatus]   = useState("");
  const [incentiveLoading, setIncentiveLoading] = useState(false);

  /* ── Card 3: Unstructured Data (TXT only) ── */
  const [unstructFile, setUnstructFile]       = useState(null);
  const [unstructMsg, setUnstructMsg]         = useState("");
  const [unstructStatus, setUnstructStatus]   = useState("");
  const [unstructLoading, setUnstructLoading] = useState(false);

  /* DB file count */
  const [uploadedCount, setUploadedCount] = useState(3);

  /* ────────────────────────────────────────
     When user picks a Sales file → auto-validate columns
  ──────────────────────────────────────── */
  async function handleSalesFileSelect(f) {
    setSalesFile(f);
    setSalesMsg("");
    setSalesStatus("");
    setSalesMissing(null);

    if (!f) return;

    const ext = getExt(f.name);
    if (ext === "csv") {
      try {
        const headers = await parseCSVHeaders(f);
        const missing = findMissingColumns(headers, SALES_REQUIRED_COLUMNS);
        setSalesMissing(missing);
      } catch {
        setSalesMissing([]); // can't read headers, allow upload
      }
    } else {
      // XLSX / XLS — can't parse client-side without a library; skip validation
      setSalesMissing(null);
    }
  }

  /* ────────────────────────────────────────
     Upload Handlers
  ──────────────────────────────────────── */
  async function handleUploadSales() {
    const extErr = validateExt(salesFile, ["csv", "xlsx", "xls"]);
    if (extErr) { setSalesMsg(extErr); setSalesStatus("error"); return; }

    // Block upload if columns are missing
    if (salesMissing && salesMissing.length > 0) {
      setSalesMsg(`Fix missing columns before uploading: ${salesMissing.join(", ")}`);
      setSalesStatus("error");
      return;
    }

    const fd = new FormData();
    fd.append("file", salesFile);

    try {
      setSalesLoading(true);
      setSalesMsg("");
      const res = await uploadSales(fd);
      if (res.status === "success") {
        setSalesMsg(res.message || "Sales data uploaded successfully.");
        setSalesStatus("success");
        setUploadedCount(c => c + 1);
      } else {
        setSalesMsg(res.message || "Upload failed.");
        setSalesStatus("error");
      }
    } catch (e) {
      setSalesMsg(e.message);
      setSalesStatus("error");
    } finally {
      setSalesLoading(false);
    }
  }

  async function handleUploadIncentive() {
    const extErr = validateExt(incentiveFile, ["csv", "xlsx", "xls"]);
    if (extErr) { setIncentiveMsg(extErr); setIncentiveStatus("error"); return; }

    const fd = new FormData();
    fd.append("file", incentiveFile);

    try {
      setIncentiveLoading(true);
      setIncentiveMsg("");
      /* TODO: replace with actual incentive upload service call */
      await new Promise(r => setTimeout(r, 1200));
      setIncentiveMsg("Incentive sales data uploaded successfully.");
      setIncentiveStatus("success");
      setUploadedCount(c => c + 1);
    } catch (e) {
      setIncentiveMsg(e.message);
      setIncentiveStatus("error");
    } finally {
      setIncentiveLoading(false);
    }
  }

  async function handleUploadUnstruct() {
    const extErr = validateExt(unstructFile, ["txt"]);
    if (extErr) { setUnstructMsg(extErr); setUnstructStatus("error"); return; }

    const fd = new FormData();
    fd.append("file", unstructFile);

    try {
      setUnstructLoading(true);
      setUnstructMsg("");
      /* TODO: replace with actual unstructured upload service call */
      await new Promise(r => setTimeout(r, 1000));
      setUnstructMsg("Unstructured data uploaded and stored successfully.");
      setUnstructStatus("success");
      setUploadedCount(c => c + 1);
    } catch (e) {
      setUnstructMsg(e.message);
      setUnstructStatus("error");
    } finally {
      setUnstructLoading(false);
    }
  }

  /* ────────────────────────────────────────
     Determine if Sales upload should be blocked
  ──────────────────────────────────────── */
  const salesBlocked = salesLoading || !salesFile || (salesMissing && salesMissing.length > 0);

  return (
    <div className="upload-data-page">

      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        uploadedFilesCount={uploadedCount}
      />

      <main className="upload-main">

        {/* ── Topbar ── */}
        <header className="upload-topbar">
          <div className="upload-topbar-left">
            <h1 className="upload-page-title">Upload Data</h1>
            <span className="upload-breadcrumb">Dashboard · Upload Data</span>
          </div>
          <div className="upload-topbar-right">
            <button className="upload-calc-link" onClick={() => navigate("/calculator")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Go to Calculator
            </button>
          </div>
        </header>

        {/* ── Info Banner ── */}
        <div className="upload-info-banner">
          <div className="upload-info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="upload-info-body">
            <h4>How it works</h4>
            <p>
              Upload each data file separately — they're stored in the database by type.
              Once uploaded, go to the <strong>Incentive Calculator</strong> to select files and run the calculation.
              <strong> Sales Data</strong> and <strong>Incentive Data</strong> are required; Unstructured Data is optional.
            </p>
          </div>
        </div>

        {/* ══ Three Upload Cards ══ */}
        <div className="upload-sections-grid">

          {/* ─────────────────────────────
              CARD 1 — Sales Data
          ───────────────────────────── */}
          <div className="usc" style={{ animationDelay: "0ms" }}>
            <div className="usc-strip usc-strip-blue" />

            <div className="usc-head">
              <div className="usc-head-left">
                <div className="usc-icon usc-icon-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <span className="usc-badge usc-badge-req">Required</span>
            </div>

            <div className="usc-title-block">
              <div className="usc-title">Sales Data</div>
              <div className="usc-desc">
                Monthly salesperson performance data — primary input for incentive calculation.
              </div>
            </div>

            {/* Required columns display */}
            <div className="usc-columns-block">
              <div className="usc-columns-title">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Required Columns
              </div>
              <div className="usc-columns-grid">
                {SALES_REQUIRED_COLUMNS.map(col => (
                  <span
                    key={col}
                    className="usc-col-tag"
                    style={
                      salesMissing && salesMissing.includes(col)
                        ? { background: "#fee2e2", borderColor: "#fecaca", color: "#b91c1c" }
                        : salesMissing && !salesMissing.includes(col)
                        ? { background: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
                        : {}
                    }
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="usc-formats">
              <span className="usc-fmt-pill usc-fmt-csv">CSV</span>
              <span className="usc-fmt-pill usc-fmt-xlsx">XLSX</span>
              <span className="usc-fmt-pill usc-fmt-xls">XLS</span>
              <span className="usc-fmt-note">· Max 10 MB</span>
            </div>

            <DropZone
              file={salesFile}
              onFile={handleSalesFileSelect}
              accept=".csv,.xlsx,.xls"
              dzBase="usc-dz-blue"
              iconClass="usc-dz-icon-blue"
              label="Drag & drop sales file here"
              overClass="usc-dz-over"
            />

            {/* Column validation result */}
            <ColumnValidation missingCols={salesMissing} />

            <div className="usc-divider" />

            <div className="usc-foot">
              <label className="usc-browse-label usc-browse-blue">
                <FileIcon />
                Browse File
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  hidden
                  onChange={e => { if (e.target.files[0]) handleSalesFileSelect(e.target.files[0]); e.target.value = ""; }}
                />
              </label>

              <button
                className="usc-upload-btn usc-btn-blue"
                onClick={handleUploadSales}
                disabled={salesBlocked}
              >
                {salesLoading
                  ? <><SpinIcon /> Uploading...</>
                  : <><UploadArrow /> Upload Sales Data</>
                }
              </button>

              {salesMsg && (
                <p className={`usc-message ${salesStatus}`}>{salesMsg}</p>
              )}
            </div>
          </div>

          {/* ─────────────────────────────
              CARD 2 — Incentive Sales Data
          ───────────────────────────── */}
          <div className="usc" style={{ animationDelay: "90ms" }}>
            <div className="usc-strip usc-strip-indigo" />

            <div className="usc-head">
              <div className="usc-head-left">
                <div className="usc-icon usc-icon-indigo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </div>
              <span className="usc-badge usc-badge-req">Required</span>
            </div>

            <div className="usc-title-block">
              <div className="usc-title">Incentive Sales Data</div>
              <div className="usc-desc">
                Incentive rules and slab configuration. Defines payout percentages, thresholds, and role-specific conditions.
              </div>
            </div>

            <div className="usc-formats">
              <span className="usc-fmt-pill usc-fmt-csv">CSV</span>
              <span className="usc-fmt-pill usc-fmt-xlsx">XLSX</span>
              <span className="usc-fmt-pill usc-fmt-xls">XLS</span>
              <span className="usc-fmt-note">· Max 5 MB</span>
            </div>

            <DropZone
              file={incentiveFile}
              onFile={f => { setIncentiveFile(f); if (f) setIncentiveMsg(""); }}
              accept=".csv,.xlsx,.xls"
              dzBase="usc-dz-indigo"
              iconClass="usc-dz-icon-indigo"
              label="Drag & drop incentive file here"
              overClass="usc-dz-over-indigo"
            />

            <div className="usc-divider" />

            <div className="usc-foot">
              <label className="usc-browse-label usc-browse-indigo">
                <FileIcon />
                Browse File
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  hidden
                  onChange={e => { if (e.target.files[0]) { setIncentiveFile(e.target.files[0]); setIncentiveMsg(""); } e.target.value = ""; }}
                />
              </label>

              <button
                className="usc-upload-btn usc-btn-indigo"
                onClick={handleUploadIncentive}
                disabled={incentiveLoading || !incentiveFile}
              >
                {incentiveLoading
                  ? <><SpinIcon /> Uploading...</>
                  : <><UploadArrow /> Upload Incentive Data</>
                }
              </button>

              {incentiveMsg && (
                <p className={`usc-message ${incentiveStatus}`}>{incentiveMsg}</p>
              )}
            </div>
          </div>

          {/* ─────────────────────────────
              CARD 3 — Unstructured Data (TXT)
          ───────────────────────────── */}
          <div className="usc" style={{ animationDelay: "180ms" }}>
            <div className="usc-strip usc-strip-amber" />

            <div className="usc-head">
              <div className="usc-head-left">
                <div className="usc-icon usc-icon-amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
              </div>
              <span className="usc-badge usc-badge-opt">Optional</span>
            </div>

            <div className="usc-title-block">
              <div className="usc-title">Unstructured Data</div>
              <div className="usc-desc">
                Plain-text adhoc override file. Used for one-time adjustments, exception rules, or supplementary context outside standard incentive rules.
              </div>
            </div>

            <div className="usc-formats">
              <span className="usc-fmt-pill usc-fmt-txt">TXT</span>
              <span className="usc-fmt-note">· Max 2 MB · Plain text only</span>
            </div>

            <DropZone
              file={unstructFile}
              onFile={f => { setUnstructFile(f); if (f) setUnstructMsg(""); }}
              accept=".txt"
              dzBase="usc-dz-amber"
              iconClass="usc-dz-icon-amber"
              label="Drag & drop .txt file here"
              overClass="usc-dz-over-amber"
            />

            <div className="usc-divider" />

            <div className="usc-foot">
              <label className="usc-browse-label usc-browse-amber">
                <FileIcon />
                Browse File
                <input
                  type="file"
                  accept=".txt"
                  hidden
                  onChange={e => { if (e.target.files[0]) { setUnstructFile(e.target.files[0]); setUnstructMsg(""); } e.target.value = ""; }}
                />
              </label>

              <button
                className="usc-upload-btn usc-btn-amber"
                onClick={handleUploadUnstruct}
                disabled={unstructLoading || !unstructFile}
              >
                {unstructLoading
                  ? <><SpinIcon /> Uploading...</>
                  : <><UploadArrow /> Upload Unstructured Data</>
                }
              </button>

              {unstructMsg && (
                <p className={`usc-message ${unstructStatus}`}>{unstructMsg}</p>
              )}
            </div>
          </div>

        </div>{/* /upload-sections-grid */}

        {/* ── Library Summary Bar ── */}
        <div className="upload-library-bar">
          <div className="upload-lib-left">
            <div className="upload-lib-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="upload-lib-stat">
              <strong>{uploadedCount}</strong>
              <span>files stored in database</span>
            </div>
            <div className="upload-lib-sep" />
            <div className="upload-lib-pills">
              <div className="upload-lib-pill lib-pill-blue">
                <div className="lib-pill-dot dot-blue" /> Sales Files
              </div>
              <div className="upload-lib-pill lib-pill-indigo">
                <div className="lib-pill-dot dot-indigo" /> Incentive Files
              </div>
              <div className="upload-lib-pill lib-pill-amber">
                <div className="lib-pill-dot dot-amber" /> Unstructured Files
              </div>
            </div>
          </div>

          <button className="upload-lib-go-btn" onClick={() => navigate("/calculator")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Go to Calculator →
          </button>
        </div>

      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}