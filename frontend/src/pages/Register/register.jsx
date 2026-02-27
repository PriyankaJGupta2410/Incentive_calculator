import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    industry: "",
    company_size: "",
    city: "",
    state: "",
    country: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Connect backend API here
  };

  return (
    <div className="register-page">

      {/* NAVBAR */}
      <nav className="register-navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>💰 IncentCalc</div>
        <button className="nav-login-btn" onClick={() => navigate("/login")}>Login</button>
      </nav>

      {/* MAIN */}
      <div className="register-wrapper">

        {/* LEFT PANEL */}
        <div className="register-left">
          <div className="left-content">
            <h1 className="left-title">Get Started with IncentCalc</h1>
            <p className="left-sub">
              Register your organization and start managing incentives with full clarity and zero errors.
            </p>
            <ul className="left-points">
              <li>✅ Real-time incentive calculations</li>
              <li>✅ Custom slab configuration</li>
              <li>✅ Team & individual tracking</li>
              <li>✅ Exportable payroll reports</li>
            </ul>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="register-right">
          <div className="register-form-box">
            <h2 className="form-title">Register Organization</h2>
            <p className="form-sub">Fill in the details below to create your account</p>

            <form onSubmit={handleSubmit}>

              {/* Company Details */}
              <div className="section-header">
                <span className="section-badge">01</span>
                <h3 className="section-title">Company Details</h3>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Company Name</label>
                  <input type="text" name="name" placeholder="e.g. Acme Pvt Ltd" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Company Email</label>
                  <input type="email" name="email" placeholder="company@example.com" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" placeholder="+91 XXXXX XXXXX" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Industry</label>
                  <input type="text" name="industry" placeholder="e.g. Finance, IT, Retail" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Company Size</label>
                  <input type="text" name="company_size" placeholder="e.g. 50-100 employees" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input type="text" name="city" placeholder="e.g. Mumbai" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>State</label>
                  <input type="text" name="state" placeholder="e.g. Maharashtra" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Country</label>
                  <input type="text" name="country" placeholder="e.g. India" onChange={handleChange} required />
                </div>
              </div>

              {/* Admin Details */}
              <div className="section-header">
                <span className="section-badge">02</span>
                <h3 className="section-title">Admin Details</h3>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Admin Name</label>
                  <input type="text" name="admin_name" placeholder="Full Name" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Admin Email</label>
                  <input type="email" name="admin_email" placeholder="admin@example.com" onChange={handleChange} required />
                </div>
                <div className="input-group full-width">
                  <label>Admin Password</label>
                  <input type="password" name="admin_password" placeholder="Create a strong password" onChange={handleChange} required />
                </div>
              </div>

              <button type="submit" className="register-btn">
                Create Account →
              </button>

              <p className="login-link">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")}>Login here</span>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}