import React, { useState } from "react";
import "./Dashboard.css";

export default function Dashboard({ data }) {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");

const states = [...new Set(data.map(d => d.state_name))];
const districts = state 
  ? [...new Set(data.filter(d => d.state_name === state).map(d => d.district_name))]
  : [...new Set(data.map(d => d.district_name))];
const cropsList = district 
  ? [...new Set(data.filter(d => d.district_name === district).map(d => d.crop))]
  : [...new Set(data.map(d => d.crop))];

  const filteredData = data.filter(d =>
    (!state || d.state_name === state) &&
    (!district || d.district_name === district) &&
    (!crop || d.crop === crop)
  );

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="filters">
        <div>
          <label>State</label>
          <select value={state} onChange={e => { setState(e.target.value); setDistrict(""); setCrop(""); }}>
            <option value="">Select State</option>
            {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>District</label>
          <select value={district} onChange={e => { setDistrict(e.target.value); setCrop(""); }}>
            <option value="">Select District</option>
            {districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label>Crop</label>
          <select value={crop} onChange={e => setCrop(e.target.value)}>
            <option value="">Select Crop</option>
            {cropsList.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <h3>Filtered Records</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>District</th>
              <th>Year</th>
              <th>Season</th>
              <th>Crop</th>
              <th>Area</th>
              <th>Production</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, i) => (
              <tr key={i}>
                <td>{d.state_name}</td>
                <td>{d.district_name}</td>
                <td>{d.crop_year}</td>
                <td>{d.season}</td>
                <td>{d.crop}</td>
                <td>{d.area_}</td>
                <td>{d.production_}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
