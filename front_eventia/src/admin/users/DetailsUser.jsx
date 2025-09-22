import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from '../config/axiosConfig'; 
import Swal from "sweetalert2";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState({
    id: null,
    gouvernorat: "",
    email: "",
    telephone: "",
    role: "",
    statut: "",
    typeOrganisateur: "",
    nom: "",
    prenom: "",
    nomSociete: "",
  });

  const loadUser = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8081/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des détails :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger les détails de l'utilisateur.",
      });
      setUser({});
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const getOrganizerDisplayName = () => {
    if (user.typeOrganisateur === "PERSONNE") {
      return `${user.nom || ''} ${user.prenom || ''}`.trim();
    } else if (user.typeOrganisateur === "SOCIETE") {
      return user.nomSociete || '';
    }
    return user.email || "Utilisateur Inconnu";
  };

  const shouldDisplayOrganizerDetails = user.role === "ORGANIZER" || user.role === "ADMIN";

  return (
    <div
      className="container mt-5"
      style={{
        paddingTop: "40px",
        paddingBottom: "80px",
        paddingLeft: "80px",
        paddingRight: "80px",
      }}
    >
      <div className="page-inner">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Détails de l'utilisateur</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <Link to="/admin/">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/admin/users">Utilisateurs</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Détails
              </li>
            </ol>
          </nav>
        </div>

        <div className="card shadow rounded-4 p-4">
          <div className="row g-0">
            <div className="col-md-4 bg-light d-flex flex-column align-items-center justify-content-center text-center p-4 rounded-start">
              <i className="fas fa-user-circle fa-5x text-primary mb-3"></i>
              <h4 className="fw-bold">{getOrganizerDisplayName()}</h4>
              <p className="text-muted mb-1">{user.role || "Rôle inconnu"}</p>
              <span className={`badge mt-2 ${user.statut === 'ENABLED' ? 'bg-success' : 'bg-danger'}`}>
                {user.statut || "Statut inconnu"}
              </span>
              <Link to="/admin/users" className="btn btn-outline-primary mt-4 rounded-pill">
                <i className="fas fa-arrow-left me-2"></i> Retour
              </Link>
            </div>

            <div className="col-md-8 p-4">
              <h5 className="text-primary">Informations Détaillées</h5>
              <hr />
              <div className="row mb-3">
                {/* Affiche "Type d'utilisateur" uniquement si role = ORGANIZER ou ADMIN */}
                {shouldDisplayOrganizerDetails && (
                  <div className="col-sm-6 mb-3">
                    <p className="text-muted mb-0">Type d'utilisateur</p>
                    <h6 className="fw-bold">{user.typeOrganisateur || "N/A"}</h6>
                  </div>
                )}

                {/* Nom et prénom affichés pour tous les rôles */}
                {(user.typeOrganisateur === "PERSONNE" || user.role === "USER") && (
                  <>
                    <div className="col-sm-6 mb-3">
                      <p className="text-muted mb-0">Nom</p>
                      <h6 className="fw-bold">{user.nom || "N/A"}</h6>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <p className="text-muted mb-0">Prénom</p>
                      <h6 className="fw-bold">{user.prenom || "N/A"}</h6>
                    </div>
                  </>
                )}

                {/* Nom de société uniquement si ORGANIZER et type = SOCIETE */}
                {shouldDisplayOrganizerDetails && user.typeOrganisateur === "SOCIETE" && (
                  <div className="col-sm-6 mb-3">
                    <p className="text-muted mb-0">Nom de la société</p>
                    <h6 className="fw-bold">{user.nomSociete || "N/A"}</h6>
                  </div>
                )}

                {/* Champs communs */}
                <div className="col-sm-6 mb-3">
                  <p className="text-muted mb-0">Email</p>
                  <h6 className="fw-bold">{user.email || "N/A"}</h6>
                </div>
                <div className="col-sm-6 mb-3">
                  <p className="text-muted mb-0">Téléphone</p>
                  <h6 className="fw-bold">{user.telephone || "N/A"}</h6>
                </div>
                <div className="col-sm-6 mb-3">
                  <p className="text-muted mb-0">Gouvernorat</p>
                  <h6 className="fw-bold">{user.gouvernorat || "N/A"}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
