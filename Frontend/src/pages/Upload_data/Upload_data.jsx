import React, { useState } from "react";
import "./Upload_data.css";
import Sidebar from "../../components/sidebar/sidebar";

function Upload_data() {
  const [active, setActive] = useState("Upload Data");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="upload-data-page">

      {/* ── Sidebar ── */}
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ── Main Content ── */}
      <main className="upload-main">

        {/* Topbar */}
        <header className="upload-topbar">
          <div>
            <h1 className="upload-page-title">Upload Data</h1>
            <span className="upload-breadcrumb">Dashboard · Upload Data</span>
          </div>
        </header>

        {/* Upload Card */}
        <section className="upload-card">
          <div className="upload-dropzone">
            <div className="upload-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="upload-drop-title">Drag & drop your file here</p>
            <p className="upload-drop-sub">Supports .xlsx, .csv, .xls — Max 10MB</p>
            <label className="upload-browse-btn">
              Browse File
              <input type="file" accept=".xlsx,.csv,.xls" hidden />
            </label>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Upload_data;