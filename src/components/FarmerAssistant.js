import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import "./FarmerAssistant.css";

export default function FarmerAssistant({ data = [] }) {
  const [stateSelected, setStateSelected] = useState("");
  const [cropSelected, setCropSelected] = useState("");
  const [areaInput, setAreaInput] = useState("");

  const norm = s => (typeof s === "string" ? s.trim() : s);

  const states = useMemo(() => {
    const s = new Set();
    data.forEach(r => {
      if (r.state_name) s.add(norm(r.state_name));
    });
    return Array.from(s).sort();
  }, [data]);

  const cropsForState = useMemo(() => {
    if (!stateSelected) {
      const all = new Set();
      data.forEach(r => { if (r.crop) all.add(norm(r.crop)); });
      return Array.from(all).sort();
    }
    const setC = new Set();
    data.forEach(r => {
      if (r.state_name && norm(r.state_name) === stateSelected && r.crop) {
        setC.add(norm(r.crop));
      }
    });
    return Array.from(setC).sort();
  }, [data, stateSelected]);

  const recordsForSelection = useMemo(() => {
    return data.filter(r =>
      stateSelected && cropSelected
        ? (norm(r.state_name) === stateSelected && norm(r.crop) === cropSelected)
        : []
    ).map(r => ({
      ...r,
      crop_year: r.crop_year ? String(r.crop_year) : "",
      area_: Number(r.area_ || r.area || 0),
      production_: Number(r.production_ || r.production || 0),
      yield: Number(r.yield || (r.production_ && r.area_ ? (r.production_ / r.area_) : 0) || 0),
      soil_quality: Number(r.soil_quality || 0),
      seeds: Number(r.seeds || 0),
      fertilizer: Number(r.fertilizer || 0),
      water: Number(r.water || 0),
      recommended_fertilizer: r.recommended_fertilizer || r.recommended_fert || "N/A",
      season: r.season || "",
    }));
  }, [data, stateSelected, cropSelected]);

  const trendData = useMemo(() => {
    if (!recordsForSelection.length) return [];
    const map = {};
    recordsForSelection.forEach(r => {
      const year = r.crop_year || "Unknown";
      if (!map[year]) map[year] = { year, totalProduction: 0, count: 0 };
      map[year].totalProduction += Number(r.production_ || 0);
      map[year].count += 1;
    });
    const arr = Object.values(map).map(v => ({
      year: v.year,
      production: Math.round(v.totalProduction)
    }));
    arr.sort((a, b) => {
      const na = Number(a.year), nb = Number(b.year);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.year.localeCompare(b.year);
    });
    return arr;
  }, [recordsForSelection]);

  const suitabilityScore = useMemo(() => {
    if (!recordsForSelection.length) return null;
    let totalYield = 0, totalSoilQ = 0, countY = 0, countSQ = 0;
    recordsForSelection.forEach(r => {
      if (r.yield && !isNaN(r.yield)) { totalYield += r.yield; countY++; }
      if (r.soil_quality && !isNaN(r.soil_quality)) { totalSoilQ += r.soil_quality; countSQ++; }
    });
    const avgYield = countY ? totalYield / countY : 0;
    const avgSoilQ = countSQ ? totalSoilQ / countSQ : 50;
    const yieldScore = Math.min(100, Math.round((avgYield / (avgYield + 50)) * 100));
    const soilScore = Math.min(100, Math.round((avgSoilQ / 100) * 100));
    const avgArea = recordsForSelection.reduce((s, r) => s + (r.area_ || 0), 0) / (recordsForSelection.length || 1);
    const areaScore = Math.min(100, Math.round((Math.log1p(avgArea) / Math.log1p(avgArea + 10)) * 100));
    const score = Math.round(yieldScore * 0.5 + soilScore * 0.35 + areaScore * 0.15);
    return Math.max(0, Math.min(100, score));
  }, [recordsForSelection]);

  const riskAssessment = useMemo(() => {
    if (!recordsForSelection.length) return null;
    const yearMap = {};
    recordsForSelection.forEach(r => {
      const y = r.crop_year || "0";
      if (!yearMap[y]) yearMap[y] = { sum: 0, count: 0 };
      yearMap[y].sum += Number(r.yield || 0);
      yearMap[y].count += 1;
    });
    const years = Object.keys(yearMap).sort();
    const yearAverages = years.map(y => {
      const it = yearMap[y];
      return { year: y, avgYield: it.count ? it.sum / it.count : 0 };
    });
    if (yearAverages.length === 0) return "Unknown";
    const overallAvg = yearAverages.reduce((s, v) => s + v.avgYield, 0) / yearAverages.length;
    const recent = yearAverages.slice(-2);
    const recentAvg = recent.length ? (recent.reduce((s, v) => s + v.avgYield, 0) / recent.length) : overallAvg;
    if (overallAvg === 0) return "Unknown";
    const changePct = ((recentAvg - overallAvg) / (overallAvg || 1)) * 100;
    if (changePct <= -15) return "High";
    if (changePct <= -5) return "Medium";
    return "Low";
  }, [recordsForSelection]);

  const rotationSuggestion = useMemo(() => {
    if (!stateSelected || !data.length || !cropSelected) return null;
    const cropMap = {};
    data.forEach(r => {
      if (norm(r.state_name) !== stateSelected) return;
      const c = norm(r.crop);
      if (!c) return;
      const yieldVal = Number(r.yield || r.production_ / (r.area_ || 1) || 0);
      if (!cropMap[c]) cropMap[c] = { sum: 0, count: 0 };
      cropMap[c].sum += yieldVal;
      cropMap[c].count += 1;
    });
    const cropAverages = Object.entries(cropMap).map(([crop, v]) => ({
      crop,
      avgYield: v.count ? (v.sum / v.count) : 0
    })).filter(x => x.crop && x.crop !== cropSelected);
    if (!cropAverages.length) return null;
    cropAverages.sort((a, b) => b.avgYield - a.avgYield);
    const best = cropAverages[0];
    const suggested = best.crop;
    const note = `Consider planting ${suggested} next season — historically it had higher average yields in ${stateSelected}.`;
    return { suggested, note, confidence: Math.round((best.avgYield / (best.avgYield + 20)) * 100) };
  }, [data, stateSelected, cropSelected, recordsForSelection]);

  const recommendations = useMemo(() => {
    if (!recordsForSelection.length) return ["No recommendations — no data."];
    const rec = [];
    if (suitabilityScore !== null) {
      if (suitabilityScore >= 75) rec.push("Suitability looks strong — this crop is a good fit for the region.");
      else if (suitabilityScore >= 50) rec.push("Moderate suitability — follow recommended practices to improve yield.");
      else rec.push("Low suitability — consider alternatives or soil improvement before planting.");
    }
    if (riskAssessment === "High") rec.push("High risk detected — yields have declined recently. Investigate causes (pests, weather).");
    if (rotationSuggestion) rec.push(rotationSuggestion.note);
    return rec;
  }, [recordsForSelection, suitabilityScore, riskAssessment, rotationSuggestion]);

const renderRiskBadge = (r) => {
  if (!r) return "Unknown";
  return r; 
};


  return (
    <div className="farmer-assistant-box">
      <div className="fa-form">
        <div className="input-row">
          <label>State</label>
          <select value={stateSelected} onChange={e => { setStateSelected(e.target.value); setCropSelected(""); }}>
            <option value="">— Select State —</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="input-row">
          <label>Crop</label>
          <select value={cropSelected} onChange={e => setCropSelected(e.target.value)} disabled={!stateSelected && cropsForState.length===0}>
            <option value="">— Select Crop —</option>
            {cropsForState.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="input-row">
          <label>Area (ha) — optional</label>
          <input type="number" placeholder="e.g. 2.5" value={areaInput} onChange={e => setAreaInput(e.target.value)} />
        </div>
      </div>

      <div className="fa-results">
        {!stateSelected || !cropSelected ? (
          <div className="empty-note">Choose state & crop to see tailored insights.</div>
        ) : (
          <>
            <div className="fa-cards">
              <div className="card">
                <h4>Suitability</h4>
                <div className="big-score">{suitabilityScore !== null ? suitabilityScore : "—"}</div>
                <small>0 (low) — 100 (high)</small>
              </div>

              <div className="card">
                <h4>Risk</h4>
                <div className="risk-area">{renderRiskBadge(riskAssessment)}</div>
                <small>Trend-based risk</small>
              </div>

              <div className="card">
                <h4>Rotation Suggestion</h4>
                <div className="rotation">{rotationSuggestion ? rotationSuggestion.suggested : "No suggestion"}</div>
                <small>{rotationSuggestion ? `${rotationSuggestion.confidence}% confidence` : ""}</small>
              </div>

              <div className="card">
                <h4>Crop Performance Summary</h4>
                {recordsForSelection.length ? (
                  <>
                    <div>Average Yield: <strong>{(recordsForSelection.reduce((sum, r) => sum + r.yield, 0) / recordsForSelection.length).toFixed(2)}</strong></div>
                    <div>Best Year: <strong>{recordsForSelection.reduce((best, r) => r.production_ > best.production_ ? r : best, recordsForSelection[0]).crop_year}</strong></div>
                    <div>Worst Year: <strong>{recordsForSelection.reduce((worst, r) => r.production_ < worst.production_ ? r : worst, recordsForSelection[0]).crop_year}</strong></div>
                  </>
                ) : <div>—</div>}
              </div>
            </div>

            <div className="fa-trend-and-details">
              <div className="trend-card">
                <h4>Historical Production Trend</h4>
                {trendData.length ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="production" stroke="#a86138" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="no-data">No historical data</div>}
              </div>

              <div className="details-card">
                <h4>Recommendations & Alerts</h4>
                <ul className="rec-list">
                  {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>

            <div className="fa-more">
              <h4>Detailed Crop Records</h4>
              <p className="muted">View year-wise area, production, and yield for this crop in the selected state.</p>
              {recordsForSelection.length ? (
                <div className="record-list">
                  {recordsForSelection.map((rec, i) => (
                    <div key={i} className="record">
                      <div className="rec-left">
                        <div className="rec-year">{rec.crop_year || "—"}</div>
                        <div className="rec-season">{rec.season || "—"}</div>
                      </div>
                      <div className="rec-right">
                        <div>Area: {rec.area_}</div>
                        <div>Production: {rec.production_}</div>
                        <div>Yield: {+rec.yield.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="no-data">No records for this selection.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
