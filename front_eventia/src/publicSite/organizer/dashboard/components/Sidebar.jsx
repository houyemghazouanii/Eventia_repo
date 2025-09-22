

import React from "react";
import { FaTachometerAlt, FaCalendarAlt, FaUsers, FaTicketAlt , FaSignOutAlt, FaUserCircle, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../pages/Dashboard.css";  

const Sidebar = ({ sidebarOpen, toggleSidebar, onLogout, goToProfile }) => {

  const navItems = [
    { icon: FaTachometerAlt, label: "Dashboard", to: "/organizer/dashboard" },
    { icon: FaCalendarAlt, label: "Événements", to: "/organizer/events" },
    { icon: FaUsers, label: "Participants", to: "/organizer/participations" },
    { icon: FaTicketAlt, label: "Billets", to: "/organizer/models-billets" },
    { icon: FaStar, label: "Avis", to: "/organizer/reviews" },

  ];

  return (
    <aside
      className={`sidebar animate__animated ${sidebarOpen ? "animate__fadeInLeft" : "animate__fadeOutLeft"}`}
      style={{
        width: sidebarOpen ? 260 : 0,
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        color: "#fff",
        transition: "width 0.3s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingTop: 20,
      }}
    >
      <div style={{ padding: "0 20px", marginBottom: 40 }}>
            <h2 style={{ fontWeight: "bold", fontSize: 24 }}>
            <span className="animated-emoji">🎉</span> EventIA
            </h2>
        <p style={{ fontSize: 14, opacity: 0.9 }}>Espace Organisateur</p>
      </div>

      <nav style={{ flexGrow: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {navItems.map((item, index) => (
            <li key={index} className="sidebar-item" style={{ marginBottom: 12 }}>
              <Link to={item.to} style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                <item.icon /> {item.label}
              </Link>
            </li>
          ))}

          <li
            onClick={goToProfile}
            className="sidebar-item profile-button"
            style={{
              cursor: "pointer",
              marginTop: 20,
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            title="Voir mon profil"
          >
            <FaUserCircle /> Mon Profil
          </li>
        </ul>
      </nav>

      <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        <button
          onClick={onLogout}
          className="logout-button"
          title="Déconnexion"
        >
          <FaSignOutAlt /> Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
