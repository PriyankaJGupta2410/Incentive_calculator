import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Uploadedfilespage.css";
import Sidebar from "../../components/sidebar/sidebar";
import { fetchUploadedFiles } from "../../services/fetchUploadfileService";

/* ══════════════════════════════════════
   HELPERS  — unchanged
══════════════════════════════════════ */

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getTypeClass(type) {
  const map = {
    csv:  "badge-csv",
    txt:  "badge-txt",
  };
  return map[type] || "badge-def";
}

function getStripClass(type) {
  const map = {
    csv:  "strip-csv",
    txt:  "strip-txt",
  };
  return map[type] || "strip-def";
}

function getTypeLabel(type) {
  return type.toUpperCase().slice(0, 4);
}

/* ══════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════ */
function SkeletonGrid() {
  return (
    <div className="uf-skeleton-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="uf-skeleton-card" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="uf-skeleton-strip" />
          <div className="uf-skeleton-body">
            <div className="uf-skeleton-line" style={{ width: "44px", height: "44px", borderRadius: "12px" }} />
            <div className="uf-skeleton-line" style={{ width: "70%", height: "14px" }} />
            <div className="uf-skeleton-line" style={{ width: "50%", height: "11px" }} />
            <div className="uf-skeleton-line" style={{ width: "100%", height: "64px", borderRadius: "10px" }} />
            <div style={{ display: "flex", gap: "7px" }}>
              <div className="uf-skeleton-line" style={{ flex: 1, height: "34px", borderRadius: "9px" }} />
              <div className="uf-skeleton-line" style={{ flex: 1, height: "34px", borderRadius: "9px" }} />
              <div className="uf-skeleton-line" style={{ flex: 1, height: "34px", borderRadius: "9px" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function UploadedFilesPage() {
  const [active, setActive]           = useState("Uploaded Files");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch]           = useState("");
  const [filterTab, setFilterTab]     = useState("All");
  const [files, setFiles]             = useState([]);
  const [loading, setLoading]         = useState(true);

  const navigate = useNavigate();

  /* ── Fetch Files from API — logic unchanged ── */
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetchUploadedFiles();

      const apiFiles = res?.res_data?.files?.res_data?.files || [];

      const formatted = apiFiles.map((file) => ({
        id:         file._id,
        name:       file.file_name,
        type:       file.file_name.split(".").pop(),
        size:       0,
        uploadedOn: new Date(file.created_date).toLocaleString(),
        uploadedBy: "Admin",
        rows:       file.total_records,
        branch:     "All Branches",
        status:     "uploaded",
      }));

      setFiles(formatted);
    } catch (error) {
      console.error("Error loading uploaded files:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Filter logic — unchanged ── */
  const filterMap = { All: null, CSV: "csv", TXT: "txt" };

  const visible = files.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.branch.toLowerCase().includes(search.toLowerCase());
    const matchTab = filterMap[filterTab] ? f.type === filterMap[filterTab] : true;
    return matchSearch && matchTab;
  });

  const totalSize = files.reduce((a, f) => a + (f.size || 0), 0);
  const uploaded  = files.filter((f) => f.status === "uploaded").length;

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
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

        {/* Topbar */}
        <header className="uf-topbar">
          <div className="uf-topbar-left">
            <h1 className="uf-page-title">Uploaded Files</h1>
            <span className="uf-breadcrumb">Files · View All</span>
          </div>

          <div className="uf-topbar-right">
            {/* Notification bell */}
            <div className="uf-notif">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="uf-notif-dot" />
            </div>

            {/* Logout */}
            <button className="uf-logout-btn" onClick={() => navigate("/login")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="uf-summary-info">
              <div className="uf-summary-value">{loading ? "—" : files.length}</div>
              <div className="uf-summary-label">Total Files</div>
            </div>
          </div>


          {/* Successfully Uploaded */}
          <div className="uf-summary-card" style={{ animationDelay: "160ms" }}>
            <div className="uf-summary-icon green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="uf-summary-info">
              <div className="uf-summary-value">{loading ? "—" : uploaded}</div>
              <div className="uf-summary-label">Successfully Uploaded</div>
            </div>
          </div>

        </section>

        {/* ── Toolbar ── */}
        <div className="uf-toolbar">
          <div className="uf-toolbar-left">
            {/* Search */}
            <div className="uf-search">
              <span className="uf-search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                className="uf-search-input"
                placeholder="Search by file name or branch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Type filter tabs */}
            <div className="uf-filter-tabs">
              {["All", "CSV", "TXT"].map((tab) => (
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

          {/* Results count */}
          {!loading && (
            <span className="uf-results-count">
              Showing <strong>{visible.length}</strong> of {files.length} files
            </span>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <SkeletonGrid />
        ) : visible.length === 0 ? (
          <div className="uf-grid">
            <div className="uf-empty">
              <div className="uf-empty-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              </div>
              <div className="uf-empty-title">No files found</div>
              <div className="uf-empty-sub">Try adjusting your search or filter</div>
            </div>
          </div>
        ) : (
          /* ── File Grid ── */
          <div className="uf-grid">
            {visible.map((file, i) => (
              <div
                className="uf-file-card"
                key={file.id}
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {/* Colour strip */}
                <div className={`uf-file-card-strip ${getStripClass(file.type)}`} />

                <div className="uf-file-card-body">

                  {/* Type badge + status */}
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

                  {/* Meta row */}
                  <div className="uf-file-meta">
                    <span className="uf-meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      {formatBytes(file.size)}
                    </span>
                    <span className="uf-meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
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
                      <span className="uf-detail-val">
                        {typeof file.rows === "number" ? file.rows.toLocaleString() : file.rows ?? "—"}
                      </span>
                    </div>
                    <div className="uf-detail-row">
                      <span className="uf-detail-key">File Type</span>
                      <span className="uf-detail-val">{file.type.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="uf-file-card-actions">
                    <button className="uf-action-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview
                    </button>
                    <button className="uf-action-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}