import React, { useState, useRef } from "react";
import "./Upload_data.css";
import Sidebar from "../../components/sidebar/sidebar";
import { uploadSales } from "../../services/uploadsalesService";

/* ── helper: extension from filename ── */
function getExt(name = "") {
  return name.split(".").pop().toLowerCase();
}

function getChipClass(name) {
  const e = getExt(name);
  const map = { xlsx: "chip-xlsx", csv: "chip-csv", txt: "chip-txt", xls: "chip-xls" };
  return map[e] || "chip-txt";
}

function getExtLabel(name) {
  return getExt(name).toUpperCase().slice(0, 4);
}

/* ── reusable DropZone ── */
function DropZone({ file, onFileChange, accept, iconClass, dragHint, stepKey }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  }

  return (
    <div
      className={`upload-card-dropzone${dragOver ? " drag-over" : ""}${file ? " has-file" : ""}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={e => { if (e.target.files[0]) onFileChange(e.target.files[0]); e.target.value = ""; }}
      />

      {file ? (
        <>
          {/* Done icon */}
          <div className="upload-dz-icon dz-icon-done">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="upload-dz-text" style={{ color: "#15803d" }}>File ready to upload</p>

          {/* File chip */}
          <div className="upload-file-chip" onClick={e => e.stopPropagation()}>
            <div className={`upload-file-chip-icon ${getChipClass(file.name)}`}>
              {getExtLabel(file.name)}
            </div>
            <span className="upload-file-chip-name" title={file.name}>{file.name}</span>
            <button
              className="upload-file-chip-remove"
              onClick={e => { e.stopPropagation(); onFileChange(null); }}
              title="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`upload-dz-icon ${iconClass}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            </svg>
          </div>
          <p className="upload-dz-text">{dragHint}</p>
          <p className="upload-dz-sub">or click to browse</p>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
function Upload_data() {
  const [active, setActive]         = useState("Upload Data");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── Step 1: Sales Data ── */
  const [salesFile, setSalesFile]     = useState(null);
  const [salesMsg, setSalesMsg]       = useState("");
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesStatus, setSalesStatus] = useState(""); // "success" | "error"

  /* ── Step 2: Incentive Rules CSV ── */
  const [rulesFile, setRulesFile]     = useState(null);
  const [rulesMsg, setRulesMsg]       = useState("");
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesStatus, setRulesStatus] = useState("");

  /* ── Step 3: Mock Adhoc Rule TXT ── */
  const [adhocFile, setAdhocFile]     = useState(null);
  const [adhocMsg, setAdhocMsg]       = useState("");
  const [adhocLoading, setAdhocLoading] = useState(false);
  const [adhocStatus, setAdhocStatus] = useState("");

  /* ─────────────────────────────────── */

  function validateFile(file, allowed, label) {
    if (!file) return `Please select a ${label} file first.`;
    const ext = getExt(file.name);
    if (!allowed.includes(ext)) {
      return `Invalid file type. Accepted: ${allowed.map(e => "." + e).join(", ")}`;
    }
    return null;
  }

  /* ── Upload Sales Data (existing service) ── */
  async function handleUploadSales() {
    const err = validateFile(salesFile, ["csv"], "sales data");
    if (err) { setSalesMsg(err); setSalesStatus("error"); return; }

    const formData = new FormData();
    formData.append("file", salesFile);

    try {
      setSalesLoading(true);
      setSalesMsg("");
      const response = await uploadSales(formData);
      if (response.status === "success") {
        setSalesMsg(response.message);
        setSalesStatus("success");
      } else {
        setSalesMsg(response.message || "Upload failed");
        setSalesStatus("error");
      }
    } catch (error) {
      setSalesMsg(error.message);
      setSalesStatus("error");
    } finally {
      setSalesLoading(false);
    }
  }

  /* ── Upload Incentive Rules CSV ── */
  async function handleUploadRules() {
    const err = validateFile(rulesFile, ["csv"], "incentive rules");
    if (err) { setRulesMsg(err); setRulesStatus("error"); return; }

    const formData = new FormData();
    formData.append("file", rulesFile);

    try {
      setRulesLoading(true);
      setRulesMsg("");
      /* TODO: replace with actual rules upload service call */
      await new Promise(r => setTimeout(r, 1200)); // simulated delay
      setRulesMsg("Incentive rules uploaded successfully.");
      setRulesStatus("success");
    } catch (error) {
      setRulesMsg(error.message);
      setRulesStatus("error");
    } finally {
      setRulesLoading(false);
    }
  }

  /* ── Upload Adhoc Rule TXT ── */
  async function handleUploadAdhoc() {
    const err = validateFile(adhocFile, ["txt"], "adhoc rule");
    if (err) { setAdhocMsg(err); setAdhocStatus("error"); return; }

    const formData = new FormData();
    formData.append("file", adhocFile);

    try {
      setAdhocLoading(true);
      setAdhocMsg("");
      /* TODO: replace with actual adhoc upload service call */
      await new Promise(r => setTimeout(r, 1000)); // simulated delay
      setAdhocMsg("Mock adhoc rule uploaded successfully.");
      setAdhocStatus("success");
    } catch (error) {
      setAdhocMsg(error.message);
      setAdhocStatus("error");
    } finally {
      setAdhocLoading(false);
    }
  }

  /* ── Pipeline status pills ── */
  const step1Done = salesStatus === "success";
  const step2Done = rulesStatus === "success";
  const step3Done = adhocStatus === "success";

  const allDone = step1Done && step2Done && step3Done;

  return (
    <div className="upload-data-page">

      {/* Sidebar */}
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="upload-main">

        {/* Topbar */}
        <header className="upload-topbar">
          <div>
            <h1 className="upload-page-title">Upload Data</h1>
            <span className="upload-breadcrumb">Dashboard · Upload Data</span>
          </div>
        </header>

        {/* Pipeline Banner */}
        <div className="upload-pipeline-banner">
          <div className="upload-pipeline-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="upload-pipeline-text">
            <h3>Incentive Calculation Pipeline</h3>
            <p>Complete all 3 steps below to run the incentive calculation engine. Steps 1 &amp; 2 are required; Step 3 is optional for adhoc overrides.</p>
          </div>
          <div className="upload-pipeline-steps">
            <div className={`upload-pipeline-step-pill ${step1Done ? "done" : !step1Done ? "active" : ""}`}>
              {step1Done ? "✓" : "1"} Sales Data
            </div>
            <div className="upload-pipeline-arrow" />
            <div className={`upload-pipeline-step-pill ${step2Done ? "done" : step1Done ? "active" : ""}`}>
              {step2Done ? "✓" : "2"} Rules CSV
            </div>
            <div className="upload-pipeline-arrow" />
            <div className={`upload-pipeline-step-pill ${step3Done ? "done" : step2Done ? "active" : ""}`}>
              {step3Done ? "✓" : "3"} Adhoc Rule
            </div>
          </div>
        </div>

        {/* Three Step Cards */}
        <div className="upload-steps-grid">

          {/* ── STEP 1: Sales Data ── */}
          <div className="upload-step-card" style={{ animationDelay: "0ms" }}>
            <div className="upload-step-strip strip-sales" />

            <div className="upload-step-head">
              <div className="upload-step-head-left">
                <div className="upload-step-num num-sales">1</div>
                <div className="upload-step-icon icon-sales">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
              </div>
              <span className="upload-step-badge badge-required">Required</span>
            </div>

            <div className="upload-step-title-block">
              <div className="upload-step-title">Sales Data</div>
              <div className="upload-step-desc">
                Upload the monthly salesperson performance data. This is the primary input for incentive calculation.
              </div>
            </div>

            <div className="upload-step-formats">
              <span className="upload-fmt-chip fmt-csv">CSV</span>
              <span className="upload-fmt-label">· Max 10 MB</span>
            </div>

            <DropZone
              file={salesFile}
              onFileChange={f => { setSalesFile(f); if (f) setSalesMsg(""); }}
              accept=".xlsx,.csv,.xls"
              iconClass="dz-icon-sales"
              dragHint="Drag & drop sales file here"
              stepKey="sales"
            />

            <div className="upload-step-divider" />

            <div className="upload-step-foot">
              <label className="upload-step-browse">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
                Browse File
                <input type="file" accept=".xlsx,.csv,.xls" hidden onChange={e => { if (e.target.files[0]) { setSalesFile(e.target.files[0]); setSalesMsg(""); } e.target.value=""; }} />
              </label>

              <button
                className="upload-step-btn btn-sales"
                onClick={handleUploadSales}
                disabled={salesLoading || !salesFile}
              >
                {salesLoading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    </svg>
                    Upload Sales Data
                  </>
                )}
              </button>

              {salesMsg && (
                <p className={`upload-step-message ${salesStatus}`}>{salesMsg}</p>
              )}
            </div>
          </div>

          {/* ── STEP 2: Incentive Rules CSV ── */}
          <div className="upload-step-card" style={{ animationDelay: "90ms" }}>
            <div className="upload-step-strip strip-rules" />

            <div className="upload-step-head">
              <div className="upload-step-head-left">
                <div className="upload-step-num num-rules">2</div>
                <div className="upload-step-icon icon-rules">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
              </div>
              <span className="upload-step-badge badge-required">Required</span>
            </div>

            <div className="upload-step-title-block">
              <div className="upload-step-title">Incentive Rules</div>
              <div className="upload-step-desc">
                Upload the incentive rules configuration file. Defines slabs, conditions, and payout percentages for each role.
              </div>
            </div>

            <div className="upload-step-formats">
              <span className="upload-fmt-chip fmt-csv">CSV</span>
              <span className="upload-fmt-label">· Max 5 MB</span>
            </div>

            <DropZone
              file={rulesFile}
              onFileChange={f => { setRulesFile(f); if (f) setRulesMsg(""); }}
              accept=".csv"
              iconClass="dz-icon-rules"
              dragHint="Drag & drop rules CSV here"
              stepKey="rules"
            />

            <div className="upload-step-divider" />

            <div className="upload-step-foot">
              <label className="upload-step-browse">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
                Browse File
                <input type="file" accept=".csv" hidden onChange={e => { if (e.target.files[0]) { setRulesFile(e.target.files[0]); setRulesMsg(""); } e.target.value=""; }} />
              </label>

              <button
                className="upload-step-btn btn-rules"
                onClick={handleUploadRules}
                disabled={rulesLoading || !rulesFile}
              >
                {rulesLoading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    </svg>
                    Upload Rules File
                  </>
                )}
              </button>

              {rulesMsg && (
                <p className={`upload-step-message ${rulesStatus}`}>{rulesMsg}</p>
              )}
            </div>
          </div>

          {/* ── STEP 3: Mock Adhoc Rule TXT ── */}
          <div className="upload-step-card" style={{ animationDelay: "180ms" }}>
            <div className="upload-step-strip strip-adhoc" />

            <div className="upload-step-head">
              <div className="upload-step-head-left">
                <div className="upload-step-num num-adhoc">3</div>
                <div className="upload-step-icon icon-adhoc">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
              </div>
              <span className="upload-step-badge badge-optional">Optional</span>
            </div>

            <div className="upload-step-title-block">
              <div className="upload-step-title">Mock Adhoc Rule</div>
              <div className="upload-step-desc">
                Upload a plain-text adhoc override rule file. Used to apply one-time adjustments or exceptions outside the standard incentive rules.
              </div>
            </div>

            <div className="upload-step-formats">
              <span className="upload-fmt-chip fmt-txt">TXT</span>
              <span className="upload-fmt-label">· Max 2 MB</span>
            </div>

            <DropZone
              file={adhocFile}
              onFileChange={f => { setAdhocFile(f); if (f) setAdhocMsg(""); }}
              accept=".txt"
              iconClass="dz-icon-adhoc"
              dragHint="Drag & drop .txt rule file here"
              stepKey="adhoc"
            />

            <div className="upload-step-divider" />

            <div className="upload-step-foot">
              <label className="upload-step-browse">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
                Browse File
                <input type="file" accept=".txt" hidden onChange={e => { if (e.target.files[0]) { setAdhocFile(e.target.files[0]); setAdhocMsg(""); } e.target.value=""; }} />
              </label>

              <button
                className="upload-step-btn btn-adhoc"
                onClick={handleUploadAdhoc}
                disabled={adhocLoading || !adhocFile}
              >
                {adhocLoading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    </svg>
                    Upload Adhoc Rule
                  </>
                )}
              </button>

              {adhocMsg && (
                <p className={`upload-step-message ${adhocStatus}`}>{adhocMsg}</p>
              )}
            </div>
          </div>

        </div>

        {/* Run Calculation CTA */}
        <div className="upload-run-section">
          <span className="upload-run-hint">
            {allDone
              ? "All files uploaded — ready to calculate!"
              : <>Complete <span>Steps 1 &amp; 2</span> to run calculation</>
            }
          </span>
          <button
            className="upload-run-btn"
            disabled={!(step1Done && step2Done)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Run Incentive Calculation
          </button>
        </div>

      </main>

      {/* Spinner keyframe injected inline for portability */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

    </div>
  );
}

export default Upload_data;