import React, { useEffect, useState } from "react";

// Fonction utilitaire pour décoder le token JWT
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Erreur de décodage du JWT:", e);
    return null;
  }
}

const AdminProfile = () => {
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        // Assurez-vous que votre payload JWT contient bien ces champs
        // Pour l'exemple, j'ajoute des données fictives si elles n'existent pas
        setAdminInfo({
          nom: payload.nom || "Doe",
          prenom: payload.prenom || "John",
          email: payload.email || "john.doe@example.com",
          role: payload.role || "Administrateur",
          telephone: payload.telephone || "+216 12 345 678", // Nouveau champ
          gouvernorat: payload.gouvernorat || "Tunis", // Nouveau champ
        });
      }
    }
  }, []);

  if (!adminInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 rounded-lg profile-card-custom">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <img
                  src="/assets/img/profile.jpg" // Assurez-vous que cette image existe
                  alt="Profil de l'administrateur"
                  className="rounded-circle border border-3 border-primary"
                  style={{ width: 150, height: 150, objectFit: "cover" }}
                />
              </div>
              <h2 className="card-title text-center mb-1 text-primary">
                {adminInfo.prenom} {adminInfo.nom}
              </h2>
              <p className="text-center text-muted mb-4">
                <small>{adminInfo.role}</small>
              </p>

              <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong><i className="bi bi-envelope-fill me-2"></i>Email :</strong>
                  <span>{adminInfo.email}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong><i className="bi bi-phone-fill me-2"></i>Téléphone :</strong>
                  <span>{adminInfo.telephone}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong><i className="bi bi-geo-alt-fill me-2"></i>Gouvernorat :</strong>
                  <span>{adminInfo.gouvernorat}</span>
                </li>
                {/* Ajoutez d'autres informations ici si nécessaire */}
              </ul>

              <div className="text-center mt-4">
                <button
                  className="btn btn-outline-primary btn-lg px-4"
                  onClick={() => window.history.back()}
                >
                  <i className="bi bi-arrow-left me-2"></i>Retour au tableau de bord
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;