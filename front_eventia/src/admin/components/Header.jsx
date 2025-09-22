import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Fonction pour décoder le JWT
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Erreur de décodage du JWT:", e);
    return null;
  }
}

const Header = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        setAdminInfo(payload);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const getAdminFirstName = () => {
    return adminInfo?.nom || "Admin";
  };

  const getAdminFullName = () => {
    if (adminInfo) {
      const prenom = adminInfo.prenom || "";
      const nom = adminInfo.nom || "";
      let fullName = "";
      if (nom) fullName += nom;
      if (prenom) fullName += (fullName ? " " : "") + prenom;
      if (fullName) return fullName;
      if (adminInfo.email) return adminInfo.email;
    }
    return "Administrateur";
  };

  return (
    <div className="main-header">
      <div className="main-header-logo">
        {/* Logo Header */}
        <div className="logo-header" data-background-color="dark">
          <div className="nav-toggle">
            <button className="btn btn-toggle toggle-sidebar">
              <i className="gg-menu-right"></i>
            </button>
            <button className="btn btn-toggle sidenav-toggler">
              <i className="gg-menu-left"></i>
            </button>
          </div>
          <button className="topbar-toggler more">
            <i className="gg-more-vertical-alt"></i>
          </button>
        </div>
      </div>

      {/* Navbar Header */}
      <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
        <div className="container-fluid">
          {/* Icons list (profil uniquement) */}
          <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
            {/* Profil utilisateur avec Dropdown de React-Bootstrap */}
            <li className="nav-item topbar-user">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="profile-pic btn btn-link">
                  <div className="avatar-sm d-flex justify-content-center align-items-center bg-primary rounded-circle text-white fw-bold" style={{ fontSize: "1.2rem" }}>
                    E
                  </div>
                  <span className="profile-username">
                    <span className="op-7">Bonjour, </span>
                    <span className="fw-bold">{getAdminFirstName()}</span>
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-user animated fadeIn">
                  <div className="dropdown-user-scroll scrollbar-outer">
                    <li>
                      <div className="user-box">
                        <div className="avatar-lg d-flex justify-content-center align-items-center bg-primary rounded-circle text-white fw-bold" style={{ fontSize: "2rem" }}>
                          E
                        </div>
                        <div className="u-text mt-2">
                          <h4>{getAdminFullName()}</h4>
                          <p className="text-muted">{adminInfo?.email}</p>
                          <a
                            href="/admin/profile"
                            className="btn btn-xs btn-secondary btn-sm"
                          >
                            Voir Profil
                          </a>
                        </div>
                      </div>
                    </li>
                    <Dropdown.Divider />
                    <Dropdown.Item href="/admin/profile">Mon Profil</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Déconnexion</Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Header;
