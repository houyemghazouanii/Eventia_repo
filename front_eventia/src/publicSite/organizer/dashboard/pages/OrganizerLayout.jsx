import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const OrganizerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [organizerName, setOrganizerName] = useState("Organisateur");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.nomSociete) {
          setOrganizerName(payload.nomSociete);
        } else {
          setOrganizerName(`${payload.prenom || ""} ${payload.nom || ""}`.trim());
        }
      } catch (err) {
        console.error("Erreur décodage token", err);
      }
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const goToProfile = () => {
    navigate("/organizer/profile");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          goToProfile={goToProfile}
        />

        <main style={{ flexGrow: 1, backgroundColor: "#f4f7fc", padding: 10, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <Header toggleSidebar={toggleSidebar} organizerName={organizerName} />
          <div style={{ flexGrow: 1, marginTop: 20 }}>
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
