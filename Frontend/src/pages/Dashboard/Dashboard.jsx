import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">ZUNEKO</h2>

        <ul className="menu">
          <li>Dashboard</li>
          <li>Upload Data</li>
          <li>Incentive Rules</li>
          <li>Salespeople</li>
          <li>Calculation Logs</li>
          <li>Export Reports</li>
        </ul>
      </div>


      {/* Main Content */}
      <div className="main">

        <h1>Incentive Dashboard</h1>

        {/* Cards */}
        <div className="cards">

          <div className="card">
            <h3>Total Incentives</h3>
            <p>₹12,45,000</p>
          </div>

          <div className="card">
            <h3>Salespeople</h3>
            <p>108</p>
          </div>

          <div className="card">
            <h3>Branches</h3>
            <p>7</p>
          </div>

          <div className="card">
            <h3>Exceptions</h3>
            <p>6</p>
          </div>

        </div>


        {/* Table */}
        <div className="table-section">

          <h2>Salesperson Incentives</h2>

          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Branch</th>
                <th>Role</th>
                <th>Total Units</th>
                <th>Incentive</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>ASM1002</td>
                <td>Mumbai-North</td>
                <td>ASM</td>
                <td>45</td>
                <td>₹61,300</td>
                <td>Success</td>
              </tr>

              <tr>
                <td>RM1015</td>
                <td>Delhi-West</td>
                <td>RM</td>
                <td>32</td>
                <td>₹41,200</td>
                <td>Success</td>
              </tr>

              <tr>
                <td>ASM1045</td>
                <td>Pune-Central</td>
                <td>ASM</td>
                <td>38</td>
                <td>₹52,700</td>
                <td>Success</td>
              </tr>

            </tbody>
          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
