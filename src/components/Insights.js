import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";
import "./Insights.css";

export default function Insights({ data }) {
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");

  // Filtered data based on selections
  const filteredData = useMemo(() => {
    return data.filter(d =>
      (!stateFilter || d.state_name === stateFilter) &&
      (!districtFilter || d.district_name === districtFilter) &&
      (!cropFilter || d.crop === cropFilter) &&
      (!seasonFilter || d.season === seasonFilter)
    );
  }, [data, stateFilter, districtFilter, cropFilter, seasonFilter]);

  // Prepare dropdown options
  const states = [...new Set(data.map(d => d.state_name))];
  const districts = [...new Set(data.filter(d => d.state_name === stateFilter).map(d => d.district_name))];
  const crops = [...new Set(data.map(d => d.crop))];
  const seasons = [...new Set(data.map(d => d.season))];

  // Aggregate metrics
  const totalProduction = filteredData.reduce((sum, d) => sum + Number(d.production_ || 0), 0);
  const avgYield = filteredData.length ? (totalProduction / filteredData.length).toFixed(2) : 0;

  // Bar chart data: Production by district
  const productionByDistrict = [];
  const districtMap = {};
  filteredData.forEach(d => {
    if (!districtMap[d.district_name]) districtMap[d.district_name] = 0;
    districtMap[d.district_name] += Number(d.production_ || 0);
  });
  for (let key in districtMap) {
    productionByDistrict.push({ district: key, production: districtMap[key] });
  }

  // Pie chart data: Crop proportion
  const cropMap = {};
  filteredData.forEach(d => {
    if (!cropMap[d.crop]) cropMap[d.crop] = 0;
    cropMap[d.crop] += Number(d.production_ || 0);
  });
  const pieData = Object.keys(cropMap).map(key => ({ name: key, value: cropMap[key] }));

  const COLORS = ["#a86138", "#f4b183", "#f7d7b2", "#ffd699", "#cfa47f", "#e6a57e"];

  return (
    <div className="insights-container">
      <h2>Analytics & Insights</h2>

      {/* Filters */}
      <div className="filters">
        <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setDistrictFilter(""); }}>
          <option value="">All States</option>
          {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
          <option value="">All Districts</option>
          {districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <select value={cropFilter} onChange={e => setCropFilter(e.target.value)}>
          <option value="">All Crops</option>
          {crops.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)}>
          <option value="">All Seasons</option>
          {seasons.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="metrics">
        <div className="metric-card">
          <h3>Total Production</h3>
          <p>{totalProduction}</p>
        </div>
        <div className="metric-card">
          <h3>Average Yield</h3>
          <p>{avgYield}</p>
        </div>
        <div className="metric-card">
          <h3>Selected Records</h3>
          <p>{filteredData.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="bar-chart-container">
          <h3>Production by District</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionByDistrict} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="production" fill="#a86138" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pie-chart-container">
          <h3>Crop Proportion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36}/>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
