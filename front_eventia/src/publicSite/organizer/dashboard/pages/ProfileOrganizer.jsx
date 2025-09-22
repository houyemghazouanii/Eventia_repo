import React, { useEffect, useState } from "react";
import OrganizerLayout from "./OrganizerLayout";
import axios from "axios";
import "animate.css";
import "./ProfileOrganizer.css";


const ProfileOrganizer = () => {
  const [organizer, setOrganizer] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8081/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrganizer(res.data);
        setEditData(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:8081/users/me", editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganizer(res.data);
      setShowModal(false);
    } catch (error) {
      console.error("Erreur de mise à jour", error);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

   const gouvernorats = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
    "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
    "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
    "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  return (
    <OrganizerLayout>
   <div className="profile-container" style={{ maxWidth: 500, margin: "30px auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
  <div
    className="profile-card animate__animated animate__fadeInUp"
    style={{
      backgroundColor: "#ffffff",
      padding: 30,
      borderRadius: 12,
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      textAlign: "center",
    }}
  >
      <div
        className="avatar-placeholder"
        style={{
          fontSize: 40,
          backgroundColor: "#007bff",
          width: 100,
          height: 100,
          borderRadius: "50%",
          color: "white",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      </div>

    {organizer && (
      <>
        <h2
          className="profile-name"
          style={{ fontWeight: "700", fontSize: 28, marginBottom: 8, color: "#4d84e4ff" }}
        >
          {organizer.nomSociete
            ? organizer.nomSociete
            : `${organizer.prenom} ${organizer.nom}`}
        </h2>
        <p
          className="profile-role"
          style={{ fontSize: 16, color: "#666", marginBottom: 30, fontWeight: "500" }}
        >
          Organisateur
        </p>

        <div
          className="profile-info"
          style={{ textAlign: "left", fontSize: 16, color: "#333", lineHeight: 1.6 }}
        >
          <div style={{ marginBottom: 12 }}>
            <strong>📧 Email :</strong>{" "}
            <span style={{ color: "#555", fontWeight: "400" }}>{organizer.email}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>🏢 Type :</strong>{" "}
            <span style={{ color: "#555", fontWeight: "400" }}>
              {organizer.typeOrganisateur || "N/A"}
            </span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>📍 Gouvernorat :</strong>{" "}
            <span style={{ color: "#555", fontWeight: "400" }}>
              {organizer.gouvernorat || "N/A"}
            </span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>📞 Téléphone :</strong>{" "}
            <span style={{ color: "#555", fontWeight: "400" }}>
              {organizer.telephone || "N/A"}
            </span>
          </div>
        </div>
      </>
    )}

   <button
      className="edit-button"
      onClick={() => setShowModal(true)}
      style={{
        marginTop: 40, // More spacing
        backgroundColor: "#6a40e2", // Use a color from the gradient
        backgroundImage: "linear-gradient(to right, #4a90e2, #6a40e2)", // Gradient button
        color: "white",
        border: "none",
        padding: "14px 32px", // Larger button
        fontSize: 17, // Larger font
        borderRadius: 30, // More rounded, pill-shaped button
        cursor: "pointer",
        fontWeight: "600",
        transition: "all 0.3s ease", // Smooth transition for all properties
        boxShadow: "0 5px 15px rgba(106, 64, 226, 0.3)", // Button shadow
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(106, 64, 226, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 5px 15px rgba(106, 64, 226, 0.3)";
      }}
    >
      ✏️ Modifier mes informations
    </button>
  </div>
</div>



      {/* Modal d'édition */}
      {showModal && (
        <div className="modal d-block animate__animated animate__fadeIn">
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Modifier mes informations</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {!organizer.nomSociete && (
                  <>
                    <div className="mb-2">
                      <label>Nom</label>
                      <input
                        type="text"
                        name="nom"
                        className="form-control"
                        value={editData.nom || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="mb-2">
                      <label>Prénom</label>
                      <input
                        type="text"
                        name="prenom"
                        className="form-control"
                        value={editData.prenom || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </>
                )}

                {organizer.nomSociete && (
                  <div className="mb-2">
                    <label>Nom de société</label>
                    <input
                      type="text"
                      name="nomSociete"
                      className="form-control"
                      value={editData.nomSociete || ""}
                      onChange={handleEditChange}
                    />
                  </div>
                )}

                <div className="mb-2">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={editData.email || ""}
                    onChange={handleEditChange}
                    disabled
                  />
                </div>
               <div className="mb-2">
                <label>Gouvernorat</label>
                <select
                  name="gouvernorat"
                  className="form-control rounded-pill"
                  value={editData.gouvernorat || ""}
                  onChange={handleEditChange}
                >
                  <option value="">-- Sélectionner --</option>
                  {gouvernorats.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

                <div className="mb-2">
                  <label>Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    className="form-control"
                    value={editData.telephone || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary rounded-pill"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary rounded-pill"
                  onClick={handleSaveChanges}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};

export default ProfileOrganizer;
