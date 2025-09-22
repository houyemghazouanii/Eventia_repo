import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from '../config/axiosConfig'; 
import Swal from "sweetalert2";

const EditUser = () => {
  const { id } = useParams(); // Get the user ID from URL parameters
  const navigate = useNavigate(); // Hook for navigation

  // State to hold user data
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    nomSociete: "",
    gouvernorat: "",
    email: "",
    telephone: "",
    role: "ORGANIZER", // Default role
    statut: "ENABLED", // Default status
    typeOrganisateur: "PERSONNE", // Default organizer type
    motDePasse: "", // Will only send if non-empty
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Arrays for select options
  // MODIFICATION: Added "USER" to userRoles
  const userRoles = ["ADMIN", "ORGANIZER", "USER"];
  const userStatuses = ["ENABLED", "DISABLED", "PENDING"]; // Example statuses
  const organizerTypes = ["PERSONNE", "SOCIETE"];

  // Effect hook to load user data when component mounts or ID changes
  useEffect(() => {
    axios
      .get(`http://localhost:8081/users/${id}`)
      .then((response) => {
        const data = response.data;
        setUser({
          nom: data.nom || "",
          prenom: data.prenom || "",
          nomSociete: data.nomSociete || "",
          gouvernorat: data.gouvernorat || "",
          email: data.email || "",
          telephone: data.telephone || "",
          // Ensure the role from backend is used, default to "PARTICIPANT" if not found
          role: data.role || "PARTICIPANT",
          statut: data.statut || "ENABLED",
          typeOrganisateur: data.typeOrganisateur || "PERSONNE",
          motDePasse: "", // Do not pre-fill password for security reasons
        });
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de l'utilisateur :", error);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de charger les détails de l'utilisateur.",
        });
        navigate("/admin/users"); // Redirect if user not found or error occurs
      });
  }, [id, navigate]); // Add navigate to dependencies to avoid lint warnings

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for 'typeOrganisateur' to clear irrelevant fields
    if (name === "typeOrganisateur") {
      setUser((prevUser) => {
        const updatedUser = { ...prevUser, [name]: value };
        if (value === "PERSONNE") {
          updatedUser.nomSociete = ""; // Clear nomSociete if switching to PERSONNE
        } else if (value === "SOCIETE") {
          updatedUser.nom = ""; // Clear nom if switching to SOCIETE
          updatedUser.prenom = ""; // Clear prenom if switching to SOCIETE
        }
        return updatedUser;
      });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  // Client-side validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate typeOrganisateur only if it's visible (i.e., for ORGANIZER or ADMIN)
    // REVERTED: Changed condition back to include "ADMIN"
    if (user.role === "ORGANIZER" || user.role === "ADMIN") {
      if (!user.typeOrganisateur) {
        newErrors.typeOrganisateur = "Le type d'organisateur est requis.";
      }

      if (user.typeOrganisateur === "PERSONNE") {
        if (!user.nom) newErrors.nom = "Le nom est requis.";
        if (!user.prenom) newErrors.prenom = "Le prénom est requis.";
      } else {
        if (!user.nomSociete)
          newErrors.nomSociete = "Le nom de la société est requis.";
      }
    }

    if (!user.gouvernorat)
      newErrors.gouvernorat = "Le gouvernorat est requis.";
    if (!user.email) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "L'email n'est pas valide.";
    }
    if (!user.telephone) {
      newErrors.telephone = "Le téléphone est requis.";
    } else if (!/^\d{8,}$/.test(user.telephone)) {
      newErrors.telephone = "Le numéro de téléphone doit contenir au moins 8 chiffres.";
    }
    // Password is optional on edit, only validate if provided
    if (user.motDePasse && user.motDePasse.length < 6) {
      newErrors.motDePasse = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission to update user
  const updateUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Validation échouée",
        text: "Veuillez corriger les erreurs dans le formulaire.",
      });
      return;
    }

    try {
      const userPayload = { ...user };
      // Remove motDePasse from payload if it's empty (user didn't change it)
      if (userPayload.motDePasse === "") {
        delete userPayload.motDePasse;
      }

      // If user is PARTICIPANT or USER, ensure typeOrganisateur, nom, prenom, nomSociete are cleared before sending
      // MODIFICATION: Added "USER" to the condition
      if (user.role === "PARTICIPANT" || user.role === "USER") {
        userPayload.typeOrganisateur = null; // Or empty string, depending on backend expectation for non-organizers
        userPayload.nom = null;
        userPayload.prenom = null;
        userPayload.nomSociete = null;
      }

      await axios.put(`http://localhost:8081/users/${id}`, userPayload, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "L'utilisateur a été modifié avec succès !",
        confirmButtonText: "OK",
      });

      navigate("/admin/users"); // Navigate back to the users list
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      let errorMessage = "La mise à jour de l'utilisateur a échoué.";

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message; // Use backend error message if available
      } else if (error.response && error.response.status === 409) {
        errorMessage = "Conflit : Cet email ou numéro de téléphone est peut-être déjà utilisé par un autre utilisateur.";
      }

      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    }
  };

  // Determine if the user's role should display organizer-specific fields in the form
  // REVERTED: Changed condition back to include "ADMIN"
  const shouldDisplayOrganizerFields = user.role === "ORGANIZER" || user.role === "ADMIN";


  return (
    <div className="container mt-5" style={{ paddingTop: '40px', paddingBottom: '80px', paddingLeft: '80px', paddingRight: '80px' }}>
      <div className="page-inner">
        {/* Header with title and breadcrumbs */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Modifier un utilisateur</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <Link to="/admin/">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/admin/users">Utilisateurs</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Modifier
              </li>
            </ol>
          </nav>
        </div>

        <section id="edit-user-form">
          <div className="row match-height">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Formulaire utilisateur</h4>
                </div>
                <div className="card-content">
                  <div className="card-body">
                    <form className="form" onSubmit={updateUser}>
                      <div className="row">
                        {/* Type Organisateur - Conditional display based on role */}
                        {shouldDisplayOrganizerFields && (
                          <div className="col-md-6 col-12 mb-3">
                            <label htmlFor="typeOrganisateur" className="form-label">Type d'organisateur</label>
                            <select
                              id="typeOrganisateur"
                              name="typeOrganisateur"
                              className={`form-select ${errors.typeOrganisateur ? 'is-invalid' : ''}`}
                              value={user.typeOrganisateur}
                              onChange={handleInputChange}
                              required
                            >
                              {organizerTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            {errors.typeOrganisateur && (
                              <div className="invalid-feedback">{errors.typeOrganisateur}</div>
                            )}
                          </div>
                        )}

                        {/* Conditional fields for PERSONNE (only if shouldDisplayOrganizerFields is true) */}
                        {shouldDisplayOrganizerFields && user.typeOrganisateur === "PERSONNE" && (
                          <>
                            <div className="col-md-6 col-12 mb-3">
                              <label htmlFor="nom" className="form-label">Nom</label>
                              <input
                                type="text"
                                id="nom"
                                name="nom"
                                className={`form-control rounded-0 ${errors.nom ? 'is-invalid' : ''}`}
                                placeholder="Nom"
                                value={user.nom}
                                onChange={handleInputChange}
                                required
                              />
                              {errors.nom && (
                                <div className="invalid-feedback">{errors.nom}</div>
                              )}
                            </div>
                            <div className="col-md-6 col-12 mb-3">
                              <label htmlFor="prenom" className="form-label">Prénom</label>
                              <input
                                type="text"
                                id="prenom"
                                name="prenom"
                                className={`form-control rounded-0 ${errors.prenom ? 'is-invalid' : ''}`}
                                placeholder="Prénom"
                                value={user.prenom}
                                onChange={handleInputChange}
                                required
                              />
                              {errors.prenom && (
                                <div className="invalid-feedback">{errors.prenom}</div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Conditional field for SOCIETE (only if shouldDisplayOrganizerFields is true) */}
                        {shouldDisplayOrganizerFields && user.typeOrganisateur === "SOCIETE" && (
                          <div className="col-md-6 col-12 mb-3">
                            <label htmlFor="nomSociete" className="form-label">Nom de la société</label>
                            <input
                              type="text"
                              id="nomSociete"
                              name="nomSociete"
                              className={`form-control rounded-0 ${errors.nomSociete ? 'is-invalid' : ''}`}
                              placeholder="Nom de la société"
                              value={user.nomSociete}
                              onChange={handleInputChange}
                              required
                            />
                            {errors.nomSociete && (
                              <div className="invalid-feedback">{errors.nomSociete}</div>
                            )}
                          </div>
                        )}

                        {/* Common fields */}
                        <div className="col-md-6 col-12 mb-3">
                          <label htmlFor="gouvernorat" className="form-label">Gouvernorat</label>
                          <input
                            type="text"
                            id="gouvernorat"
                            name="gouvernorat"
                            className={`form-control rounded-0 ${errors.gouvernorat ? 'is-invalid' : ''}`}
                            placeholder="Gouvernorat"
                            value={user.gouvernorat}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.gouvernorat && (
                            <div className="invalid-feedback">{errors.gouvernorat}</div>
                          )}
                        </div>

                        <div className="col-md-6 col-12 mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-control rounded-0 ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Email"
                            value={user.email}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>

                        <div className="col-md-6 col-12 mb-3">
                          <label htmlFor="telephone" className="form-label">Téléphone</label>
                          <input
                            type="text"
                            id="telephone"
                            name="telephone"
                            className={`form-control rounded-0 ${errors.telephone ? 'is-invalid' : ''}`}
                            placeholder="Téléphone"
                            value={user.telephone}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.telephone && (
                            <div className="invalid-feedback">{errors.telephone}</div>
                          )}
                        </div>

                        <div className="col-md-6 col-12 mb-3">
                          <label htmlFor="role" className="form-label">Rôle</label>
                          <select
                            id="role"
                            name="role"
                            className="form-select"
                            value={user.role}
                            onChange={handleInputChange}
                            required
                          >
                            {userRoles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6 col-12 mb-3">
                          <label htmlFor="statut" className="form-label">Statut</label>
                          <select
                            id="statut"
                            name="statut"
                            className="form-select"
                            value={user.statut}
                            onChange={handleInputChange}
                            required
                          >
                            {userStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>

                        {/* Password field (optional on edit) */}
                     

                        {/* Action buttons */}
                        <div className="col-12 d-flex justify-content-end mt-3"> {/* Added mt-3 for spacing */}
                          <button type="submit" className="btn btn-primary me-1 mb-1">
                            Enregistrer
                          </button>
                          <Link to="/admin/users" className="btn btn-light-secondary me-1 mb-1">
                            Annuler
                          </Link>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditUser;
