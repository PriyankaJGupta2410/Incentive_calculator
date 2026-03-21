import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Uploadedfilespage.css";
import Sidebar from "../../components/sidebar/sidebar";
import { fetchUploadedFiles } from "../../services/fetchUploadfileService";
import { fetchPreviewFile } from "../../services/previewfileService";
import { downloadFile } from "../../services/downloadFileService";

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getTypeClass(type) {
  const map = { csv: "badge-csv", txt: "badge-txt" };
  return map[type] || "badge-def";
}

function getStripClass(type) {
  const map = { csv: "strip-csv", txt: "strip-txt" };
  return map[type] || "strip-def";
}

function getTypeLabel(type) {
  return type.toUpperCase().slice(0, 4);
}

/* ══════════════════════════════════════
   PREVIEW COLUMNS MAP
══════════════════════════════════════ */
const PREVIEW_COLUMNS_MAP = {
  sales: [
    { key: "employee_id",   label: "Employee ID"   },
    { key: "branch",        label: "Branch"        },
    { key: "role",          label: "Role"          },
    { key: "vehicle_model", label: "Vehicle Model" },
    { key: "quantity",      label: "Qty"           },
    { key: "sale_date",     label: "Sale Date"     },
    { key: "vehicle_type",  label: "Vehicle Type"  },
  ],
  incentive: [
    { key: "rule_id",              label: "Rule ID"        },
    { key: "role",                 label: "Role"           },
    { key: "vehicle_type",         label: "Vehicle Type"   },
    { key: "min_units",            label: "Min Units"      },
    { key: "max_units",            label: "Max Units"      },
    { key: "incentive_amount_inr", label: "Incentive (₹)"  },
    { key: "bonus_per_unit_inr",   label: "Bonus/Unit (₹)" },
    { key: "valid_from",           label: "Valid From"     },
    { key: "valid_to",             label: "Valid To"       },
    { key: "rule_type",            label: "Rule Type"      },
  ],
};

const PAGE_SIZE = 5;

/* ══════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════ */
function SkeletonGrid() {
  return (
    <div className="uf-skeleton-grid">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="uf-skeleton-card"
          style={{ animationDelay: `${i * 60}ms` }}
        >
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
   CELL RENDERER
══════════════════════════════════════ */
function renderCell(col, row) {
  const val = row[col.key];

  if (col.key === "role") {
    return (
      <span className={`uf-role-badge uf-role-${(val ?? "").toLowerCase()}`}>
        {val ?? "—"}
      </span>
    );
  }

  if (col.key === "vehicle_type") {
    return <span className="uf-vtype-badge">{val ?? "—"}</span>;
  }

  if (col.key === "incentive_amount_inr" || col.key === "bonus_per_unit_inr") {
    return (
      <span className="uf-amount-cell">
        ₹{Number(val ?? 0).toLocaleString("en-IN")}
      </span>
    );
  }

  if (col.key === "rule_type") {
    return <span className="uf-ruletype-badge">{val ?? "—"}</span>;
  }

  if (col.key === "rule_id") {
    return <span className="uf-ruleid-cell">{val ?? "—"}</span>;
  }

  if (col.key === "min_units" || col.key === "max_units") {
    return (
      <span className="uf-units-cell">
        {val === 100 ? "100+" : (val ?? "—")}
      </span>
    );
  }

  if (col.key === "valid_from" || col.key === "valid_to") {
    return <span className="uf-date-cell">{val ?? "—"}</span>;
  }

  return val ?? "—";
}

/* ══════════════════════════════════════
   PREVIEW MODAL
══════════════════════════════════════ */
function PreviewModal({
  file,
  previewData,
  previewLoading,
  previewError,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onClose,
  columns,
}) {
  if (!file) return null;

  const stripMap   = { csv: "#10b981", txt: "#9ca3af" };
  const stripColor = stripMap[file.type] || "#7c3aed";
  const isIncentive = file.fileType === "incentive";

  return (
    <div className="uf-modal-overlay" onClick={onClose}>
      <div
        className={`uf-modal ${isIncentive ? "uf-modal-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="uf-modal-accent" style={{ background: stripColor }} />

        {/* ── Header ── */}
        <div className="uf-modal-header">
          <div className="uf-modal-title-group">
            <div className={`uf-file-type-badge ${getTypeClass(file.type)}`}>
              {getTypeLabel(file.type)}
            </div>
            <div className="uf-modal-title-text">
              <div className="uf-modal-filename">{file.name}</div>
              <div className="uf-modal-chips">
                {/* Date chip */}
                <span className="uf-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8"  y1="2" x2="8"  y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
                  </svg>
                  {file.uploadedOn}
                </span>
                {/* Records chip */}
                <span className="uf-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {file.rows?.toLocaleString() ?? "—"} records
                </span>
                {/* File type chip */}
                <span className={`uf-chip uf-chip-filetype uf-chip-filetype-${file.fileType}`}>
                  {isIncentive ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  )}
                  {isIncentive ? "Incentive" : "Sales"}
                </span>
                {/* Status chip */}
                <span className="uf-chip uf-chip-status">
                  <span className="uf-chip-dot" />
                  Uploaded
                </span>
              </div>
            </div>
          </div>
          <button className="uf-modal-close" onClick={onClose} title="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Sub-header: row range + nav ── */}
        <div className="uf-modal-subheader">
          <span className="uf-modal-page-info">
            {previewLoading
              ? "Loading…"
              : `Rows ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  currentPage * PAGE_SIZE,
                  file.rows ?? 0
                )} of ${file.rows?.toLocaleString() ?? "—"}`
            }
          </span>
          <div className="uf-modal-nav">
            <button
              className="uf-nav-btn"
              onClick={onPrev}
              disabled={previewLoading || currentPage <= 1}
              title="Previous page"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Prev
            </button>
            <span className="uf-nav-count">{currentPage} / {totalPages || "—"}</span>
            <button
              className="uf-nav-btn"
              onClick={onNext}
              disabled={previewLoading || currentPage >= totalPages}
              title="Next page"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="uf-modal-body">
          {previewLoading ? (
            <div className="uf-modal-state">
              <div className="uf-modal-spinner" />
              <span>Fetching rows…</span>
            </div>
          ) : previewError ? (
            <div className="uf-modal-state uf-modal-error">
              <div className="uf-modal-error-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8"  x2="12"   y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <span>{previewError}</span>
            </div>
          ) : previewData.length === 0 ? (
            <div className="uf-modal-state">
              <div className="uf-modal-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <span>No data available for this page.</span>
            </div>
          ) : (
            <div className="uf-modal-table-wrap">
              <table className="uf-preview-table">
                <thead>
                  <tr>
                    <th className="uf-th-num">#</th>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={row._id || i} className={i % 2 === 0 ? "uf-tr-even" : ""}>
                      <td className="uf-row-num">
                        {(currentPage - 1) * PAGE_SIZE + i + 1}
                      </td>
                      {columns.map((col) => (
                        <td key={col.key}>{renderCell(col, row)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="uf-modal-footer">
          <div className="uf-modal-footer-left">
            <span className="uf-modal-note">
              Page {currentPage} of {totalPages || "—"}
            </span>
            {totalPages > 1 && totalPages <= 10 && (
              <div className="uf-dot-pagination">
                {[...Array(totalPages)].map((_, idx) => (
                  <span
                    key={idx}
                    className={`uf-dot ${idx + 1 === currentPage ? "active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>
          <button className="uf-modal-close-btn" onClick={onClose}>Close</button>
        </div>

      </div>
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

  // ── Preview state ──
  const [previewFile, setPreviewFile]       = useState(null);
  const [previewData, setPreviewData]       = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError]     = useState(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const [totalPages, setTotalPages]         = useState(1);

  // ── Download state ──
  const [downloadingId, setDownloadingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => { loadFiles(); }, []);

  /* ── Fetch all files ── */
  const loadFiles = async () => {
    setLoading(true);
    try {
      const res      = await fetchUploadedFiles();
      const apiFiles = res?.res_data?.files?.res_data?.files || [];

      const formatted = apiFiles.map((file) => ({
        id:         file._id,
        name:       file.file_name,
        type:       file.file_name.split(".").pop(),
        fileType:   file.file_type || "sales",
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

  /* ── Fetch one page of preview data ── */
  const fetchPage = async (file, page) => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const res    = await fetchPreviewFile(file.id, PAGE_SIZE, offset);
      const raw    = res?.res_data?.data || [];

      const totalRecords =
        res?.res_data?.file_details?.total_records ?? file.rows ?? 0;

      setTotalPages(Math.ceil(totalRecords / PAGE_SIZE));
      setPreviewData(raw);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching preview:", err);
      setPreviewError("Failed to load preview. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ── Open preview modal ── */
  const loadPreview = (file) => {
    setPreviewFile(file);
    setPreviewData([]);
    setPreviewError(null);
    setCurrentPage(1);
    setTotalPages(Math.ceil((file.rows ?? 0) / PAGE_SIZE));
    fetchPage(file, 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) fetchPage(previewFile, currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) fetchPage(previewFile, currentPage + 1);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewData([]);
    setPreviewError(null);
    setCurrentPage(1);
    setTotalPages(1);
  };

  /* ── Download handler ── */
  const handleDownload = async (file) => {
    if (downloadingId) return;
    setDownloadingId(file.id);
    try {
      const blob     = await downloadFile(file.id);
      const filename = file.name || "download.csv";
      const url      = window.URL.createObjectURL(new Blob([blob]));
      const link     = document.createElement("a");
      link.href      = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  /* ── Derive columns from open file's fileType ── */
  const previewColumns = previewFile
    ? (PREVIEW_COLUMNS_MAP[previewFile.fileType] || PREVIEW_COLUMNS_MAP.sales)
    : [];

  /* ── Filter logic ── */
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

      <main className="db-main">

        {/* ── Topbar ── */}
        <header className="uf-topbar">
          <div className="uf-topbar-left">
            <h1 className="uf-page-title">Uploaded Files</h1>
            <span className="uf-breadcrumb">Files · View All</span>
          </div>
          <div className="uf-topbar-right">
            <div className="uf-notif">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="uf-notif-dot" />
            </div>
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
            <div className="uf-search">
              <span className="uf-search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                className="uf-search-input"
                placeholder="Search by file name or branch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
          <div className="uf-grid">
            {visible.map((file, i) => (
              <div
                className="uf-file-card"
                key={file.id}
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <div className={`uf-file-card-strip ${getStripClass(file.type)}`} />
                <div className="uf-file-card-body">

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

                  <div className="uf-file-name">{file.name}</div>

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
                        <line x1="8"  y1="2" x2="8"  y2="6"/>
                        <line x1="3"  y1="10" x2="21" y2="10"/>
                      </svg>
                      {file.uploadedOn}
                    </span>
                  </div>

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
                        {typeof file.rows === "number"
                          ? file.rows.toLocaleString()
                          : file.rows ?? "—"}
                      </span>
                    </div>
                    <div className="uf-detail-row">
                      <span className="uf-detail-key">File Type</span>
                      <span className="uf-detail-val">{file.type.toUpperCase()}</span>
                    </div>
                    <div className="uf-detail-row">
                      <span className="uf-detail-key">Data Type</span>
                      <span className={`uf-detail-val uf-datatype-val uf-datatype-${file.fileType}`}>
                        {file.fileType === "incentive" ? "Incentive" : "Sales"}
                      </span>
                    </div>
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="uf-file-card-actions">

                    {/* Preview */}
                    <button
                      className="uf-action-btn"
                      onClick={() => loadPreview(file)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview
                    </button>

                    {/* Download */}
                    <button
                      className={`uf-action-btn ${downloadingId === file.id ? "uf-action-btn-loading" : ""}`}
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                      title={`Download ${file.name}`}
                    >
                      {downloadingId === file.id ? (
                        <>
                          <span className="uf-btn-spinner" />
                          Downloading…
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Download
                        </>
                      )}
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ── Preview Modal ── */}
      <PreviewModal
        file={previewFile}
        previewData={previewData}
        previewLoading={previewLoading}
        previewError={previewError}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
        onClose={closePreview}
        columns={previewColumns}
      />

    </div>
  );
}