import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from '../config/axiosConfig'; 
import Swal from "sweetalert2";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AddEvent = () => {
  const navigate = useNavigate();

  const [event, setEvent] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    heureDebut: "",
    adresse: "",
    type: "", 
    statut: "", 
    capaciteMax: "",
    prix: "",
    dateLimiteInscription: "",
    image: null,
    organizerId: "",
  });

  const [organizers, setOrganizers] = useState([]);
  const [errors, setErrors] = useState({});

  // Charger les organisateurs
  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const result = await axios.get("/users");
        const organizersOnly = result.data.filter(user => user.role === 'ORGANIZER');
        setOrganizers(organizersOnly);
      } catch (error) {
        console.error("Erreur chargement organisateurs :", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les organisateurs.',
        });
      }
    };
    fetchOrganizers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent({
      ...event,
      [name]:
        name === "capaciteMax" ||
        name === "prix" ||
        name === "organizerId"
          ? Number(value)
          : value,
    });
  };

  const handleFileChange = (e) => {
    setEvent({ ...event, image: e.target.files[0] });
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!event.titre) newErrors.titre = "Le titre est requis.";
    if (!event.description) newErrors.description = "La description est requise.";

    // Date Début
    if (!event.dateDebut) {
      newErrors.dateDebut = "La date de début est requise.";
    } else {
      const dateDebut = new Date(event.dateDebut);
      dateDebut.setHours(0, 0, 0, 0);
      if (dateDebut < today) newErrors.dateDebut = "La date de début doit être aujourd'hui ou dans le futur.";
    }

    // Date Fin
    if (!event.dateFin) {
      newErrors.dateFin = "La date de fin est requise.";
    } else if (event.dateDebut) {
      const dateFin = new Date(event.dateFin);
      dateFin.setHours(0, 0, 0, 0);
      const dateDebut = new Date(event.dateDebut);
      dateDebut.setHours(0, 0, 0, 0);

      if (dateFin < today) newErrors.dateFin = "La date de fin doit être aujourd'hui ou dans le futur.";
      else if (dateFin < dateDebut) newErrors.dateFin = "La date de fin doit être après la date de début.";
    }

    // Heure Début
    if (!event.heureDebut) newErrors.heureDebut = "L'heure de début est requise.";
    else {
      const heureRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
      if (!heureRegex.test(event.heureDebut)) newErrors.heureDebut = "Format de l'heure invalide (HH:mm).";
    }

    // Date Limite d'Inscription
    if (!event.dateLimiteInscription) {
      newErrors.dateLimiteInscription = "La date limite d'inscription est requise.";
    } else if (event.dateDebut) {
      const dateLimite = new Date(event.dateLimiteInscription);
      dateLimite.setHours(0, 0, 0, 0);
      const dateDebut = new Date(event.dateDebut);
      dateDebut.setHours(0, 0, 0, 0);

      if (dateLimite < today) newErrors.dateLimiteInscription = "La date limite d'inscription doit être aujourd'hui ou dans le futur.";
      else if (dateLimite > dateDebut) newErrors.dateLimiteInscription = "La date limite d'inscription doit être avant la date de début.";
    } else {
      newErrors.dateLimiteInscription = "La date de début est requise pour valider la date limite d'inscription.";
    }

    // Adresse, type, statut
    if (!event.adresse) newErrors.adresse = "L'adresse est requise.";
    if (!event.type) newErrors.type = "Le type est requis.";
    if (!event.statut) newErrors.statut = "Le statut est requis.";

    // CapaciteMax, prix, organizerId
    if (isNaN(event.capaciteMax) || event.capaciteMax <= 0) newErrors.capaciteMax = "Capacité max requise et positive.";
    if (isNaN(event.prix) || event.prix < 0) newErrors.prix = "Prix requis et >= 0.";
    if (isNaN(event.organizerId) || event.organizerId <= 0) newErrors.organizerId = "Organisateur requis.";

    // Image
    if (!event.image) newErrors.image = "L'image est requise.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({ icon: "warning", title: "Validation échouée", text: "Veuillez corriger les erreurs." });
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(event).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "description") {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = value;
            formData.append(key, tempDiv.textContent || tempDiv.innerText || "");
          } else {
            formData.append(key, value);
          }
        }
      });

      await axios.post("http://localhost:8081/events", formData, { headers: { "Content-Type": "multipart/form-data" } });

      Swal.fire({ icon: "success", title: "Succès", text: "Événement ajouté !", timer: 2000, showConfirmButton: false });
      setTimeout(() => navigate("/admin/events"), 2000);
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Erreur", text: "Erreur lors de l'ajout de l'événement." });
    }
  };

  const typesEvenement = ["SPORT", "MUSIC", "FESTIVAL", "TRAINING", "WORKSHOP", "CONFERENCE", "CAMPING", "OTHER"];
  const statuts = ["ACTIVE", "ARCHIVED", "CANCELLED", "DRAFT"];

  return (
    <div className="container mt-5" style={{ padding: '40px 80px 80px 80px' }}>
      <div className="page-inner">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Ajouter un événement</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><Link to="/admin/">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/admin/events">Événements</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Ajouter</li>
            </ol>
          </nav>
        </div>

        <section id="multiple-column-form">
          <div className="row match-height">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><h4 className="card-title">Informations de l'événement</h4></div>
                <div className="card-body">
                  <form className="form" onSubmit={saveEvent}>
                    <div className="row">
                      {/* Champs */}
                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Titre</label>
                          <input type="text" name="titre" className="form-control rounded-0" value={event.titre} onChange={handleInputChange} />
                          {errors.titre && <strong className="text-danger">{errors.titre}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Adresse</label>
                          <input type="text" name="adresse" className="form-control rounded-0" value={event.adresse} onChange={handleInputChange} />
                          {errors.adresse && <strong className="text-danger">{errors.adresse}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Date Début</label>
                          <input type="date" name="dateDebut" className="form-control rounded-0" value={event.dateDebut} onChange={handleInputChange} />
                          {errors.dateDebut && <strong className="text-danger">{errors.dateDebut}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Date Fin</label>
                          <input type="date" name="dateFin" className="form-control rounded-0" value={event.dateFin} onChange={handleInputChange} />
                          {errors.dateFin && <strong className="text-danger">{errors.dateFin}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Heure de début</label>
                          <input type="time" name="heureDebut" className="form-control rounded-0" value={event.heureDebut} onChange={handleInputChange} />
                          {errors.heureDebut && <strong className="text-danger">{errors.heureDebut}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Type</label>
                          <select name="type" className="form-control rounded-0" value={event.type} onChange={handleInputChange}>
                            <option value="">-- Choisir un type --</option>
                            {typesEvenement.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                          {errors.type && <strong className="text-danger">{errors.type}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Statut</label>
                          <select name="statut" className="form-control rounded-0" value={event.statut} onChange={handleInputChange}>
                            <option value="">-- Choisir un statut --</option>
                            {statuts.map(statut => <option key={statut} value={statut}>{statut}</option>)}
                          </select>
                          {errors.statut && <strong className="text-danger">{errors.statut}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Date Limite d'Inscription</label>
                          <input type="date" name="dateLimiteInscription" className="form-control rounded-0" value={event.dateLimiteInscription} onChange={handleInputChange} />
                          {errors.dateLimiteInscription && <strong className="text-danger">{errors.dateLimiteInscription}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Prix</label>
                          <input type="number" name="prix" className="form-control rounded-0" min="0" step="0.01" value={event.prix} onChange={handleInputChange} />
                          {errors.prix && <strong className="text-danger">{errors.prix}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Capacité Max</label>
                          <input type="number" name="capaciteMax" className="form-control rounded-0" min="1" value={event.capaciteMax} onChange={handleInputChange} />
                          {errors.capaciteMax && <strong className="text-danger">{errors.capaciteMax}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Image</label>
                          <input type="file" name="image" className="form-control rounded-0" accept="image/*" onChange={handleFileChange} />
                          {errors.image && <strong className="text-danger">{errors.image}</strong>}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label>Organisateur</label>
                          <select name="organizerId" className="form-control rounded-0" value={event.organizerId} onChange={handleInputChange}>
                            <option value="">-- Sélectionner un organisateur --</option>
                            {organizers.map(org => (
                              <option key={org.id} value={org.id}>
                                {org.typeOrganisateur === "PERSONNE" ? `${org.nom} ${org.prenom}` : org.nomSociete}
                              </option>
                            ))}
                          </select>
                          {errors.organizerId && <small className="text-danger">{errors.organizerId}</small>}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group">
                          <label>Description</label>
                          <ReactQuill theme="snow" value={event.description} onChange={(content) => setEvent(prev => ({ ...prev, description: content }))} className="bg-white"/>
                          {errors.description && <strong className="text-danger">{errors.description}</strong>}
                        </div>
                      </div>

                      <div className="col-12 d-flex justify-content-between">
                        <button type="submit" className="btn btn-primary me-1 mb-1">Ajouter</button>
                        <Link to="/admin/events" className="btn btn-secondary me-1 mb-1">Annuler</Link>
                      </div>

                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddEvent;
