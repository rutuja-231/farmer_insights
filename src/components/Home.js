import React from "react";
import * as XLSX from "xlsx"; 
import "./Home.css";

export default function Home({ setData }) {
  const bgImagePath = "/images/home.jpg";

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      setData(jsonData); 
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div
      className="home-bg"
      style={{ backgroundImage: `url(${bgImagePath})` }}
    >
      <div className="home-content">
        <h1>
          Welcome to <span>Farmer Insights</span>
        </h1>
        <p>Your gateway to agricultural data and insights</p>
        <div className="upload-section">
          <h2>Upload the Data</h2>
          <input
            type="file"
            accept=".xlsx, .xls"
            className="upload-btn"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}
