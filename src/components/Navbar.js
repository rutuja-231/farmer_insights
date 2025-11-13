import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const logoPath = "/images/logo1.jpg"; // relative to public folder

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logoPath} alt="Logo" className="logo" />
        <span className="brand-name">Farmer Insights</span>
      </div>
      <ul className="navbar-right">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/farmers">Farmers</Link></li>
        <li><Link to="/analytics">Analytics</Link></li>
        <li><Link to="/map">Map</Link></li>
      </ul>
    </nav>
  );
}
