import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "./MapView.css";
import indiaGeo from "../data/india_state.json"; // local GeoJSON
import * as XLSX from "xlsx";

export default function MapView({ data, setData }) {
  const [selectedStateData, setSelectedStateData] = useState(null);

  // Normalize state names in Excel data
  const normalizedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      state_name: d.state_name?.trim(),
      crop: d.crop?.trim(),
    }));
  }, [data]);

  // Aggregate crop data by state
  const stateData = useMemo(() => {
    const map = {};
    normalizedData.forEach(d => {
      if (!d.state_name) return;
      if (!map[d.state_name]) map[d.state_name] = new Set();
      map[d.state_name].add(d.crop);
    });
    return map;
  }, [normalizedData]);

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Normalize incoming Excel data
      const cleanedData = jsonData.map(d => ({
        ...d,
        state_name: d.state_name?.trim(),
        crop: d.crop?.trim(),
      }));

      setData(cleanedData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="map-view-container">
      <div className="map-left">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 900, center: [82, 22] }}
          width={700}
          height={500}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={indiaGeo}>
            {({ geographies }) =>
              geographies.map(geo => {
                const stateName = geo.properties.ST_NM?.trim();
                const crops = stateData[stateName];
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={crops ? "#f4b183" : "#e0e0e0"}
                    stroke="#fff"
                    data-tooltip-id="state-tooltip"
                    data-tooltip-content={
                      crops
                        ? `${stateName}: ${Array.from(crops).join(", ")}`
                        : `${stateName}: No data`
                    }
                    onClick={() => {
                      const stateRecords = normalizedData.filter(d => d.state_name === stateName);
                      setSelectedStateData(stateRecords);
                    }}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#a86138", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        <Tooltip id="state-tooltip" />
      </div>

      <div className="map-right">
        <h2>Crop Insights Across India</h2>

        <div className="state-info-box">
          <div className="upload-section">
            <label>Upload Excel Data</label>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
          </div>

          <h3>{selectedStateData?.[0]?.state_name || "Select a state"}</h3>
          {selectedStateData?.length > 0 ? (
            <ul>
              {selectedStateData.map((d, i) => (
                <li key={i}>
                  {d.crop} - Area: {d.area_}, Production: {d.production_}
                </li>
              ))}
            </ul>
          ) : (
            <p>No state selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
