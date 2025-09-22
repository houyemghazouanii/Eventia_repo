import React, { useState, useEffect, useRef } from "react";

const Header = ({ toggleSidebar, organizerName, sidebarOpen }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitial = () => {
    if (!organizerName) return "O";
    return organizerName.charAt(0).toUpperCase();
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#eaf4fc", // plus clair
        color: "#134074",
        height: 60,
        width: "100%",
        flexShrink: 0,
        borderBottom: "1px solid #dce4ec",
      }}
    >
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 5,
          padding: 0,
        }}
      >
        <div
          style={{
            width: 25,
            height: 3,
            backgroundColor: "#134074",
            borderRadius: 2,
            transformOrigin: "left",
            transform: sidebarOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            transition: "all 0.3s",
          }}
        />
        <div
          style={{
            width: 25,
            height: 3,
            backgroundColor: "#134074",
            borderRadius: 2,
            opacity: sidebarOpen ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        />
        <div
          style={{
            width: 25,
            height: 3,
            backgroundColor: "#134074",
            borderRadius: 2,
            transformOrigin: "left",
            transform: sidebarOpen ? "rotate(-45deg) translate(7px, -6px)" : "none",
            transition: "all 0.3s",
          }}
        />
      </button>

      {/* Message de bienvenue */}
      <div
        style={{
          fontSize: "1.2rem",
          fontWeight: "600",
          userSelect: "none",
          animation: "fadeSlideIn 0.8s forwards",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{ fontSize: "1.5rem", animation: "wave 2s infinite" }}
          role="img"
          aria-label="Salut"
        >
          👋
        </span>
        <span>
          Bonjour, <strong>{organizerName || "Organisateur"}</strong>
        </span>
      </div>

      {/* Avatar */}
      <div
        title="Organisateur"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#4d84e4ff",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "700",
          fontSize: "1.3rem",
          userSelect: "none",
        }}
      >
        {getInitial()}
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg) }
          15% { transform: rotate(14deg) }
          30% { transform: rotate(-8deg) }
          40% { transform: rotate(14deg) }
          50% { transform: rotate(-4deg) }
          60% { transform: rotate(10deg) }
          70% { transform: rotate(0deg) }
          100% { transform: rotate(0deg) }
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateX(-15px) }
          100% { opacity: 1; transform: translateX(0) }
        }
      `}</style>
    </header>
  );
};

export default Header;
