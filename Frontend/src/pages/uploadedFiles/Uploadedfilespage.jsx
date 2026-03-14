import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Uploadedfilespage.css";
import Sidebar from "../../components/sidebar/sidebar";

/* ── Demo uploaded files data ── */
const initialFiles = [
  {
    id: 1,
    name: "incentive_june_2025.xlsx",
    type: "xlsx",
    size: 248320,
    uploadedOn: "10 Jun 2025, 10:32 AM",
    uploadedBy: "Admin User",
    rows: 1240,
    branch: "All Branches",
    status: "uploaded",
  },
  {
    id: 2,
    name: "branch_data_q2.csv",
    type: "csv",
    size: 83456,
    uploadedOn: "09 Jun 2025, 04:15 PM",
    uploadedBy: "Admin User",
    rows: 530,
    branch: "Mumbai-North",
    status: "uploaded",
  },
  {
    id: 3,
    name: "exceptions_review.pdf",
    type: "pdf",
    size: 512000,
    uploadedOn: "08 Jun 2025, 09:50 AM",
    uploadedBy: "Admin User",
    rows: "—",
    branch: "Delhi-West",
    status: "uploaded",
  },
  {
    id: 4,
    name: "sales_may_2025.xlsx",
    type: "xlsx",
    size: 196608,
    uploadedOn: "01 Jun 2025, 11:00 AM",
    uploadedBy: "Admin User",
    rows: 980,
    branch: "Pune-Central",
    status: "uploaded",
  },
  {
    id: 5,
    name: "rules_draft_v3.docx",
    type: "doc",
    size: 45056,
    uploadedOn: "28 May 2025, 02:20 PM",
    uploadedBy: "Admin User",
    rows: "—",
    branch: "All Branches",
    status: "uploaded",
  },
  {
    id: 6,
    name: "processing_batch_june.csv",
    type: "csv",
    size: 64000,
    uploadedOn: "10 Jun 2025, 11:45 AM",
    uploadedBy: "Admin User",
    rows: 320,
    branch: "Bengaluru-South",
    status: "processing",
  },
];

/* ── Helpers ── */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getTypeClass(type) {
  const map = { xlsx: "badge-xlsx", csv: "badge-csv", pdf: "badge-pdf", doc: "badge-doc", txt: "badge-txt" };
  return map[type] || "badge-def";
}

function getStripClass(type) {
  const map = { xlsx: "strip-xlsx", csv: "strip-csv", pdf: "strip-pdf", doc: "strip-doc", txt: "strip-txt" };
  return map[type] || "strip-def";
}

function getTypeLabel(type) {
  return type.toUpperCase().slice(0, 4);
}

export default function UploadedFilesPage({ uploadedFilesCount = 6 }) {
  const [active, setActive]           = useState("Uploaded Files");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch]           = useState("");
  const [filterTab, setFilterTab]     = useState("All");
  const [files, setFiles]             = useState(initialFiles);
  const navigate = useNavigate();

  /* Filter logic */
  const filterMap = { All: null, XLSX: "xlsx", CSV: "csv", PDF: "pdf", DOC: "doc" };

  const visible = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                        f.branch.toLowerCase().includes(search.toLowerCase());
    const matchTab = filterMap[filterTab] ? f.type === filterMap[filterTab] : true;
    return matchSearch && matchTab;
  });

  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const uploaded  = files.filter(f => f.status === "uploaded").length;

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div className="db-root">

      {/* ── Sidebar ── */}
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        uploadedFilesCount={files.length}
      />

      {/* ── Main ── */}
      <main className="db-main">

        {/* Top Bar */}
        <header className="uf-topbar">
          <div className="uf-topbar-left">
            <h1 className="uf-page-title">Uploaded Files</h1>
            <span className="uf-breadcrumb">Files · View All</span>
          </div>
          <div className="uf-topbar-right">
            {/* Notification */}
            <div className="db-notif" style={{ position: "relative", width: 38, height: 38, background: "white", border: "1.5px solid var(--blue-100)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)", cursor: "pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="db-notif-dot" />
            </div>
            {/* Logout */}
            <button className="db-logout-btn" onClick={() => navigate("/login")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* ── Summary Cards ── */}
        <section className="uf-summary">
          {/* Total Files */}
          <div className="uf-summary-card" style={{ animationDelay: "0ms" }}>
            <div className="uf-summary-icon blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="uf-summary-info">
              <div className="uf-summary-value">{files.length}</div>
              <div className="uf-summary-label">Total Files</div>
            </div>
          </div>

          {/* Total Size */}
          <div className="uf-summary-card" style={{ animationDelay: "80ms" }}>
            <div className="uf-summary-icon indigo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div className="uf-summary-info">
              <div className="uf-summary-value">{formatBytes(totalSize)}</div>
              <div className="uf-summary-label">Total Size</div>
            </div>
          </div>

          {/* Successfully Uploaded */}
          <div className="uf-summary-card" style={{ animationDelay: "160ms" }}>
            <div className="uf-summary-icon green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="uf-summary-info">
              <div className="uf-summary-value">{uploaded}</div>
              <div className="uf-summary-label">Successfully Uploaded</div>
            </div>
          </div>
        </section>

        {/* ── Toolbar ── */}
        <div className="uf-toolbar">
          <div className="uf-toolbar-left">
            {/* Search */}
            <div className="uf-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="uf-search-input"
                placeholder="Search by file name or branch..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Type filter tabs */}
            <div className="uf-filter-tabs">
              {["All", "XLSX", "CSV", "PDF", "DOC"].map(tab => (
                <button
                  key={tab}
                  className={`uf-tab ${filterTab === tab ? "active" : ""}`}
                  onClick={() => setFilterTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <button className="uf-sort-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="11" y2="18"/>
              <polyline points="4 9 1 6 4 3"/><polyline points="4 21 1 18 4 15"/>
            </svg>
            Newest First
          </button>
        </div>

        {/* ── File Grid ── */}
        <div className="uf-grid">
          {visible.length === 0 ? (
            <div className="uf-empty">
              <div className="uf-empty-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <div className="uf-empty-title">No files found</div>
              <div className="uf-empty-sub">Try adjusting your search or filter</div>
            </div>
          ) : (
            visible.map((file, i) => (
              <div
                className="uf-file-card"
                key={file.id}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Colour strip */}
                <div className={`uf-file-card-strip ${getStripClass(file.type)}`} />

                <div className="uf-file-card-body">
                  {/* Top row: type badge + status */}
                  <div className="uf-file-card-top">
                    <div className={`uf-file-type-badge ${getTypeClass(file.type)}`}>
                      {getTypeLabel(file.type)}
                    </div>
                    <span className={`uf-file-status ${file.status}`}>
                      {file.status === "uploaded"   && "Uploaded"}
                      {file.status === "processing" && "Processing"}
                      {file.status === "error"      && "Error"}
                    </span>
                  </div>

                  {/* File name */}
                  <div className="uf-file-name">{file.name}</div>

                  {/* Meta chips */}
                  <div className="uf-file-meta">
                    <span className="uf-meta-chip">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      {formatBytes(file.size)}
                    </span>
                    <span className="uf-meta-chip">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {file.uploadedOn}
                    </span>
                  </div>

                  {/* Details table */}
                  <div className="uf-file-details">
                    <div className="uf-detail-row">
                      <span className="uf-detail-key">Uploaded By</span>
                      <span className="uf-detail-val">{file.uploadedBy}</span>
                    </div>
                    <div className="uf-detail-row">
                      <span className="uf-detail-key">Branch</span>
                      <span className="uf-detail-val">{file.branch}</span>
                    </div>
                    <div className="uf-detail-row">
                      <span className="uf-detail-key">Records / Rows</span>
                      <span className="uf-detail-val">{typeof file.rows === "number" ? file.rows.toLocaleString() : file.rows}</span>
                    </div>
                    <div className="uf-detail-row">
                      <span className="uf-detail-key">File Type</span>
                      <span className="uf-detail-val">{file.type.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Action buttons — view only, no upload */}
                  <div className="uf-file-card-actions">
                    <button className="uf-action-btn">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview
                    </button>
                    <button className="uf-action-btn">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </button>
                    <button className="uf-action-btn danger" onClick={() => removeFile(file.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}