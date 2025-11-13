import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import FarmerAssistant from "./components/FarmerAssistant";
import Insights from "./components/Insights";
import MapView from "./components/MapView";

function App() {
  const [data, setData] = useState([]); // shared data state

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home setData={setData} />} />
        <Route path="/dashboard" element={<Dashboard data={data} />} />
        <Route path="/farmers" element={<FarmerAssistant data={data} />} />
        <Route path="/analytics" element={<Insights data={data} />} />
        <Route path="/map" element={<MapView data={data} setData={setData} />} /> {/* ✅ pass setData */}
      </Routes>
    </Router>
  );
}

export default App;
