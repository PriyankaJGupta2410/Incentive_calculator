import { useNavigate } from "react-router-dom";
import "./sidebar.css";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Upload Data", path: "/upload" },
  { label: "Incentive Rules", path: "/rules" },
  { label: "Salespeople", path: "/salespeople" },
  { label: "Calculation Logs", path: "/logs" },
  { label: "Export Reports", path: "/reports" },
];

export default function Sidebar({
  active,
  setActive,
  sidebarOpen,
  setSidebarOpen
}) {
  const navigate = useNavigate();

  return (
    <aside className={`db-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      
      {/* Logo */}
      <div className="db-sidebar-top">
        <div className="db-logo">
          <div className="db-logo-icon">Z</div>
          {sidebarOpen && <span className="db-logo-text">ZUNEKO</span>}
        </div>

        <button
          className="db-collapse-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "←" : "→"}
        </button>
      </div>

      {/* Menu */}
      <nav className="db-nav">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`db-nav-item ${
              active === item.label ? "db-nav-active" : ""
            }`}
            onClick={() => {
              setActive(item.label);
              navigate(item.path);
            }}
          >
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="db-sidebar-footer">
        {sidebarOpen && (
          <div className="db-user">
            <div className="db-avatar">A</div>
            <div>
              <div>Admin User</div>
              <small>Super Admin</small>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}