import { useNavigate } from "react-router-dom";
import "./sidebar.css";

/* ── SVG Icons ── */
const Icons = {
  Dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Files: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Rules: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Salespeople: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Logs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Reports: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

const menuItems = [
  { label: "Dashboard",             path: "/dashboard",         icon: Icons.Dashboard    },
  { label: "Upload Data",           path: "/upload",            icon: Icons.Upload       },
  { label: "Incentive Calculator",  path: "/calculator",        icon: Icons.Rules        },
  { label: "Salespeople",           path: "/salespeople",       icon: Icons.Salespeople  },
  { label: "Calculation Logs",      path: "/logs",              icon: Icons.Logs         }
];

export default function Sidebar({
  active,
  setActive,
  sidebarOpen,
  setSidebarOpen,
  uploadedFilesCount = 0,
}) {
  const navigate = useNavigate();

  return (
    <aside className={`db-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>

      {/* ── Logo ── */}
      <div className="db-sidebar-top">
        <div className="db-logo">
          <div className="db-logo-icon">Z</div>
          {sidebarOpen && <span className="db-logo-text">ZUNEKO</span>}
        </div>
        <button
          className="db-collapse-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="db-nav">

        {sidebarOpen && <div className="db-nav-section-label">Main Menu</div>}

        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`db-nav-item ${active === item.label ? "db-nav-active" : ""}`}
            onClick={() => {
              setActive(item.label);
              navigate(item.path);
            }}
          >
            <span className="db-nav-icon">{item.icon}</span>
            {sidebarOpen && <span className="db-nav-label">{item.label}</span>}
          </button>
        ))}

        <div className="db-nav-divider" />

        {sidebarOpen && <div className="db-nav-section-label">Files</div>}

        {/* ── Uploaded Files ── */}
        <button
          className={`db-nav-item db-nav-files ${active === "Uploaded Files" ? "db-nav-active" : ""}`}
          onClick={() => {
            setActive("Uploaded Files");
            navigate("/uploaded-files");
          }}
        >
          <span className="db-nav-icon">{Icons.Files}</span>
          {sidebarOpen && (
            <>
              <span className="db-nav-label">Uploaded Files</span>
              {uploadedFilesCount > 0 && (
                <span className="db-nav-badge">{uploadedFilesCount}</span>
              )}
            </>
          )}
        </button>

      </nav>

      {/* ── Footer ── */}
      <div className="db-sidebar-footer">
        {sidebarOpen ? (
          <div className="db-user">
            <div className="db-avatar">A</div>
            <div className="db-user-info">
              <div className="db-user-name">Admin User</div>
              <div className="db-user-role">Super Admin</div>
            </div>
          </div>
        ) : (
          <div className="db-user">
            <div className="db-avatar">A</div>
          </div>
        )}
      </div>

    </aside>
  );
}