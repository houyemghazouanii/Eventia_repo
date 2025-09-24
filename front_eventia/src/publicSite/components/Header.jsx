import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHistory, FaBell, FaSignOutAlt, FaUserCircle, FaShoppingCart } from "react-icons/fa";

function Header() {
  const [user, setUser] = useState(null);
  const [panierCount, setPanierCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // fetchNotifications stable grâce à useCallback
  const fetchNotifications = useCallback(async (userId, token) => {
    if (!userId || !token) return;

    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/notifications/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const notifs = Array.isArray(res.data) ? res.data : [];
      setNotifications(notifs.map((n) => ({ ...n, lu: n.lu ?? false })));
    } catch (error) {
      console.error("Erreur récupération notifications:", error);
      setNotifications([]);
    }
  }, []);

  // Charger user au montage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const prenom = localStorage.getItem("prenom");
    const nom = localStorage.getItem("nom");
    const userId = localStorage.getItem("userId");

    if (token && role && userId) {
      setUser({ token, role, prenom, nom, userId });
    } else {
      setUser(null);
      setPanierCount(0);
    }
  }, []);

  // Synchroniser panier
  useEffect(() => {
    if (!user) return;
    const syncPanierBackend = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/reservations/users/${user.userId}/pending`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const panierFromBackend = res.data.map((reservation) => ({
          event: reservation.event,
          quantite: reservation.quantite,
          reservationId: reservation.id,
        }));
        localStorage.setItem("panier", JSON.stringify(panierFromBackend));
        setPanierCount(panierFromBackend.length);
      } catch (error) {
        const panier = JSON.parse(localStorage.getItem("panier")) || [];
        setPanierCount(panier.length);
      }
    };
    syncPanierBackend();
  }, [user]);

  // Charger notifications + auto refresh + écoute d'événement
  useEffect(() => {
    if (!user?.userId || !user?.token) return;

    fetchNotifications(user.userId, user.token);
    const interval = setInterval(() => fetchNotifications(user.userId, user.token), 60000);
    window.addEventListener("notificationUpdated", () => fetchNotifications(user.userId, user.token));

    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationUpdated", () => fetchNotifications(user.userId, user.token));
    };
  }, [user?.userId, user?.token, fetchNotifications]);

  // Badge rouge
  useEffect(() => {
    setHasUnread(notifications.some((n) => !n.lu));
  }, [notifications]);

  // Fermer dropdowns si clic dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notif-dropdown") && !event.target.closest(".profile-dropdown")) {
        setShowNotifDropdown(false);
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleNotifDropdown = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown) setHasUnread(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    if (user?.token) {
      try {
        await axios.put(
          `http://127.0.0.1:5000/notifications/user/${user.userId}/mark-all-read`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } catch (error) {
        console.error("Erreur marquer notifications comme lues:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("panierUpdated"));
    setUser(null);
    setPanierCount(0);
    navigate("/");
  };

  // Initiale du profil
  const profileInitial = user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || "U";

  return (
    <div className="container-fluid position-relative p-0">
      <nav className="navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0">
        <Link to="/" className="navbar-brand p-0">
          <h1 className="text-primary m-0">
            <i className="fa fa-calendar-alt me-3" />
            EventIA
          </h1>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
          <span className="fa fa-bars" />
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto py-0">
            <Link to="/" className="nav-item nav-link">Accueil</Link>
            <Link to="/about" className="nav-item nav-link">À propos</Link>
            <Link to="/categories" className="nav-item nav-link">Catégories</Link>
            <Link to="/publicevents" className="nav-item nav-link">Événements</Link>
            <Link to="/contact" className="nav-item nav-link">Contact</Link>
          </div>
          <div className="d-flex gap-3 align-items-center">

            {/* Panier icône avec badge */}
            {user?.role === "USER" && (
              <Link to="/panier" style={{ position: "relative", color: "#333" }}>
                <FaShoppingCart size={22} style={{ cursor: "pointer", color:"#0ABAB5" }} />
                {panierCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -10,
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: 12,
                    }}
                  >
                    {panierCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {user && (
              <div style={{ position: "relative" }} className="notif-dropdown">
                <FaBell size={24} style={{ cursor: "pointer", marginRight: "10px" }} onClick={toggleNotifDropdown} />
                {hasUnread && (
                  <span style={{
                    position: "absolute", top: -5, right: 0, background: "red",
                    color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: 12
                  }}>
                    {notifications.filter((n) => !n.lu).length}
                  </span>
                )}
                {showNotifDropdown && (
                  <div style={{
                    position: "absolute", top: 30, right: 0, width: 350, maxHeight: 400,
                    overflowY: "auto", background: "white", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                    borderRadius: 5, zIndex: 1000
                  }}>
                    <div style={{
                      padding: "10px 15px", borderBottom: "1px solid #eee",
                      fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <span>Notifications</span>
                      <button onClick={handleMarkAllAsRead} style={{
                        background: "#007bff", color: "white", border: "none",
                        borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontSize: 12
                      }}>
                        Marquer tout comme lu
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p style={{ padding: 15 }}>Aucune notification</p>
                    ) : (
                      notifications.map((notif) => (
                        <Link to={`/notification/${notif.id}`} key={notif.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{
                            padding: "10px 15px", borderBottom: "1px solid #eee",
                            display: "flex", alignItems: "flex-start", gap: 10, position: "relative"
                          }}>
                            <div style={{ fontSize: 20 }}>🔔</div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 600 }}>{notif.message}</p>
                              <small style={{ color: "#999" }}>
                                {new Date(notif.date_envoi).toLocaleString()}
                              </small>
                            </div>
                            {!notif.lu && (
                              <span style={{
                                position: "absolute", top: 10, right: 10,
                                width: 10, height: 10, borderRadius: "50%", background: "red"
                              }} />
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profil (avatar rond avec initiale) */}
            {user && (
              <div style={{ position: "relative" }} className="profile-dropdown">
                <div
                  onClick={toggleProfileDropdown}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#007bff",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {profileInitial}
                </div>

                {showProfileDropdown && (
                  <div style={{
                    position: "absolute", top: 50, right: 0, background: "white",
                    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", borderRadius: 5, zIndex: 1000,
                    minWidth: 180
                  }}>
                    <ul style={{ listStyle: "none", margin: 0, padding: "10px 0" }}>
                      {user.role === "USER" && (
                        <>
                          <li>
                            <Link to="/profile-participant" style={{ display: "flex", alignItems: "center", padding: "8px 15px", textDecoration: "none", color: "#0ABAB5" }}>
                              <FaUserCircle style={{ marginRight: 8 }} /> Mon Profile
                            </Link>
                          </li>
                          <li>
                            <Link to="/mon-historique" style={{ display: "flex", alignItems: "center", padding: "8px 15px", textDecoration: "none", color: "#fd7e14" }}>
                              <FaHistory style={{ marginRight: 8 }} /> Mon Historique
                            </Link>
                          </li>
                        </>
                      )}
                      <li>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 15px",
                            width: "100%",
                            background: "none",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "#333"
                          }}
                        >
                          <FaSignOutAlt style={{ marginRight: 8 }} /> Déconnexion
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <>
                <Link to="/login-participant" className="btn btn-outline-primary rounded-pill px-4">
                  S'inscrire
                </Link>
                <Link to="/login-organizer" className="btn btn-primary rounded-pill px-4">
                  Organiser un événement
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
