import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from '../config/axiosConfig'; 
import Swal from "sweetalert2";

const gouvernorats = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
  "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
  "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

const AddUsers = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    typeOrganisateur: "PERSONNE",
    nom: "",
    prenom: "",
    nomSociete: "",
    gouvernorat: "",
    email: "",
    telephone: "",
    role: "ORGANIZER",
    statut: "ENABLED",
    motDePasse: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.typeOrganisateur)
      newErrors.typeOrganisateur = "Le type d'organisateur est requis.";

    if (formData.typeOrganisateur === "PERSONNE") {
      if (!formData.nom) newErrors.nom = "Le nom est requis.";
      if (!formData.prenom) newErrors.prenom = "Le prénom est requis.";
    } else {
      if (!formData.nomSociete)
        newErrors.nomSociete = "Le nom de la société est requis.";
    }

    if (!formData.gouvernorat)
      newErrors.gouvernorat = "Le gouvernorat est requis.";

    if (!formData.email) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide.";
    }

    if (!formData.telephone) {
      newErrors.telephone = "Le téléphone est requis.";
    } else if (!/^\d{8,}$/.test(formData.telephone)) {
      newErrors.telephone = "Le téléphone doit contenir au moins 8 chiffres.";
    }

    if (!formData.motDePasse) {
      newErrors.motDePasse = "Le mot de passe est requis.";
    } else if (formData.motDePasse.length < 6) {
      newErrors.motDePasse = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (!formData.statut) {
      newErrors.statut = "Le statut est requis.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
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
      // Préparer le payload avec "password" au lieu de "motDePasse"
      const payload = {
        ...formData,
        password: formData.motDePasse,
      };
      delete payload.motDePasse; // supprimer motDePasse pour éviter doublon

      await axios.post("http://localhost:8081/users", payload, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Organisateur ajouté avec succès !",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/admin/users");
      }, 2000);
    } catch (error) {
      let errorMessage = "Erreur lors de l'ajout de l'organisateur.";

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Requête invalide. Vérifiez les données (ex: email existant).";
        } else if (error.response.status === 409) {
          errorMessage = "Conflit : Email ou téléphone déjà utilisé.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Serveur injoignable. Vérifiez votre connexion.";
      } else {
        errorMessage = "Erreur inconnue.";
      }

      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="container mt-5" style={{ padding: '40px 80px' }}>
      <div className="page-inner">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Ajouter un organisateur</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><Link to="/admin/">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/admin/users">Utilisateurs</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Ajouter</li>
            </ol>
          </nav>
        </div>

        <section id="add-organizer-form">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Informations de l'organisateur</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">

                  {/* Type Organisateur */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="typeOrganisateur">Type d'organisateur</label>
                      <select
                        id="typeOrganisateur"
                        name="typeOrganisateur"
                        className="form-control rounded-0"
                        value={formData.typeOrganisateur}
                        onChange={handleChange}
                      >
                        <option value="PERSONNE">Personne</option>
                        <option value="SOCIETE">Société</option>
                      </select>
                      {errors.typeOrganisateur && (
                        <strong className="text-danger">{errors.typeOrganisateur}</strong>
                      )}
                    </div>
                  </div>

                  {/* Nom ou Société */}
                  {formData.typeOrganisateur === "PERSONNE" ? (
                    <>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label htmlFor="nom">Nom</label>
                          <input
                            type="text"
                            name="nom"
                            className="form-control rounded-0"
                            value={formData.nom}
                            onChange={handleChange}
                          />
                          {errors.nom && (
                            <strong className="text-danger">{errors.nom}</strong>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label htmlFor="prenom">Prénom</label>
                          <input
                            type="text"
                            name="prenom"
                            className="form-control rounded-0"
                            value={formData.prenom}
                            onChange={handleChange}
                          />
                          {errors.prenom && (
                            <strong className="text-danger">{errors.prenom}</strong>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="nomSociete">Nom de la société</label>
                        <input
                          type="text"
                          name="nomSociete"
                          className="form-control rounded-0"
                          value={formData.nomSociete}
                          onChange={handleChange}
                        />
                        {errors.nomSociete && (
                          <strong className="text-danger">{errors.nomSociete}</strong>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gouvernorat */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="gouvernorat">Gouvernorat</label>
                      <select
                        name="gouvernorat"
                        className="form-control rounded-0"
                        value={formData.gouvernorat}
                        onChange={handleChange}
                      >
                        <option value="">-- Sélectionnez un gouvernorat --</option>
                        {gouvernorats.map((gov, i) => (
                          <option key={i} value={gov}>{gov}</option>
                        ))}
                      </select>
                      {errors.gouvernorat && (
                        <strong className="text-danger">{errors.gouvernorat}</strong>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control rounded-0"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <strong className="text-danger">{errors.email}</strong>
                      )}
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="telephone">Téléphone</label>
                      <input
                        type="text"
                        name="telephone"
                        className="form-control rounded-0"
                        value={formData.telephone}
                        onChange={handleChange}
                      />
                      {errors.telephone && (
                        <strong className="text-danger">{errors.telephone}</strong>
                      )}
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="statut">Statut</label>
                      <select
                        name="statut"
                        className="form-control rounded-0"
                        value={formData.statut}
                        onChange={handleChange}
                      >
                        <option value="ENABLED">Activé</option>
                        <option value="DISABLED">Désactivé</option>
                      </select>
                      {errors.statut && (
                        <strong className="text-danger">{errors.statut}</strong>
                      )}
                    </div>
                  </div>

                  {/* Mot de passe avec bouton afficher */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="motDePasse">Mot de passe</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="motDePasse"
                          className={`form-control rounded-0 ${errors.motDePasse ? 'is-invalid' : ''}`}
                          value={formData.motDePasse}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                      {errors.motDePasse && (
                        <div className="invalid-feedback d-block">{errors.motDePasse}</div>
                      )}
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="col-12 d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">
                      Ajouter
                    </button>
                    <Link to="/admin/users" className="btn btn-secondary">
                      Annuler
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddUsers;
