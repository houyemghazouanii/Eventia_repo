import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import OrganizerLayout from "./OrganizerLayout";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AddEventOrganizer = () => {
  const navigate = useNavigate();

  const [event, setEvent] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    heureDebut: "",
    adresse: "",
    type: "",
    capaciteMax: "",
    prix: "",
    dateLimiteInscription: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  const typesEvenement = [
    "SPORT",
    "MUSIC",
    "FESTIVAL",
    "TRAINING",
    "WORKSHOP",
    "CONFERENCE",
    "CAMPING",
    "OTHER",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent({
      ...event,
      [name]: value,
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

    if (!event.dateDebut) {
      newErrors.dateDebut = "La date de début est requise.";
    } else if (new Date(event.dateDebut) < today) {
      newErrors.dateDebut = "La date de début doit être aujourd'hui ou dans le futur.";
    }

    if (!event.dateFin) {
      newErrors.dateFin = "La date de fin est requise.";
    } else if (event.dateDebut && new Date(event.dateFin) < new Date(event.dateDebut)) {
      newErrors.dateFin = "La date de fin doit être après la date de début.";
    }

    if (!event.dateLimiteInscription) {
      newErrors.dateLimiteInscription = "La date limite d'inscription est requise.";
    } else if (event.dateDebut && new Date(event.dateLimiteInscription) > new Date(event.dateDebut)) {
      newErrors.dateLimiteInscription =
        "La date limite d'inscription doit être avant la date de début.";
    } else if (new Date(event.dateLimiteInscription) < today) {
      newErrors.dateLimiteInscription =
        "La date limite d'inscription doit être aujourd'hui ou dans le futur.";
    }

    if (!event.adresse) newErrors.adresse = "L'adresse est requise.";
    if (!event.type) newErrors.type = "Le type est requis.";

    if (!event.capaciteMax || isNaN(event.capaciteMax) || event.capaciteMax <= 0)
      newErrors.capaciteMax = "La capacité max est requise et doit être un nombre positif.";

    if (!event.prix || isNaN(event.prix) || event.prix < 0)
      newErrors.prix = "Le prix est requis et doit être un nombre positif ou zéro.";

    if (!event.heureDebut) newErrors.heureDebut = "L'heure de début est requise.";

    if (!event.image) newErrors.image = "L'image est requise.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveEvent = async (e) => {
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
      const formData = new FormData();

      formData.append("statut", "DRAFT"); // toujours en brouillon
      formData.append("titre", event.titre);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = event.description;
      const descriptionText = tempDiv.textContent || tempDiv.innerText || "";
      formData.append("description", descriptionText);
      formData.append("dateDebut", event.dateDebut);
      formData.append("dateFin", event.dateFin);
      formData.append("heureDebut", event.heureDebut);
      formData.append("adresse", event.adresse);
      formData.append("type", event.type);
      formData.append("capaciteMax", event.capaciteMax.toString());
      formData.append("prix", event.prix.toString());
      formData.append("dateLimiteInscription", event.dateLimiteInscription);
      formData.append("image", event.image);

      const token = localStorage.getItem("token");

      await axios.post("http://localhost:8081/events/organizer/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Événement ajouté avec succès !",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/organizer/events");
      }, 2000);
    } catch (error) {
      console.error(error);

      // 🟢 Gestion du conflit (doublon)
      if (error.response && error.response.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Échec",
          text: error.response.data || "Un événement avec ce titre existe déjà.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Erreur lors de l'ajout de l'événement.",
        });
      }
    }
  };

  return (
    <OrganizerLayout>
      <div
        style={{
          maxWidth: 800,
          margin: "40px auto",
          padding: 24,
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 10,
        }}
      >
        <h3
          style={{
            marginBottom: 24,
            textAlign: "center",
            color: "#1e3c72",
          }}
        >
          Ajouter un événement
        </h3>
        <form onSubmit={saveEvent}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="titre" className="form-label">Titre</label>
              <input type="text" id="titre" name="titre" className="form-control rounded-0"
                value={event.titre} onChange={handleInputChange} />
              {errors.titre && <small className="text-danger">{errors.titre}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="dateDebut" className="form-label">Date Début</label>
              <input type="date" id="dateDebut" name="dateDebut" className="form-control rounded-0"
                value={event.dateDebut} onChange={handleInputChange} />
              {errors.dateDebut && <small className="text-danger">{errors.dateDebut}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="dateFin" className="form-label">Date Fin</label>
              <input type="date" id="dateFin" name="dateFin" className="form-control rounded-0"
                value={event.dateFin} onChange={handleInputChange} />
              {errors.dateFin && <small className="text-danger">{errors.dateFin}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="dateLimiteInscription" className="form-label">
                Date Limite d'Inscription
              </label>
              <input type="date" id="dateLimiteInscription" name="dateLimiteInscription"
                className="form-control rounded-0" value={event.dateLimiteInscription}
                onChange={handleInputChange} />
              {errors.dateLimiteInscription && (
                <small className="text-danger">{errors.dateLimiteInscription}</small>
              )}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="heureDebut" className="form-label">Heure de début</label>
              <input type="time" id="heureDebut" name="heureDebut" className="form-control rounded-0"
                value={event.heureDebut} onChange={handleInputChange} />
              {errors.heureDebut && <small className="text-danger">{errors.heureDebut}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="adresse" className="form-label">Adresse</label>
              <input type="text" id="adresse" name="adresse" className="form-control rounded-0"
                value={event.adresse} onChange={handleInputChange} />
              {errors.adresse && <small className="text-danger">{errors.adresse}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="type" className="form-label">Type</label>
              <select id="type" name="type" className="form-select"
                value={event.type} onChange={handleInputChange}>
                <option value="">-- Choisir un type --</option>
                {typesEvenement.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <small className="text-danger">{errors.type}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="prix" className="form-label">Prix</label>
              <input type="number" id="prix" name="prix" min="0" step="0.01"
                className="form-control rounded-0"
                value={event.prix} onChange={handleInputChange} />
              {errors.prix && <small className="text-danger">{errors.prix}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="capaciteMax" className="form-label">Capacité Max</label>
              <input type="number" id="capaciteMax" name="capaciteMax" min="1"
                className="form-control rounded-0"
                value={event.capaciteMax} onChange={handleInputChange} />
              {errors.capaciteMax && <small className="text-danger">{errors.capaciteMax}</small>}
            </div>
            <div style={{ flexBasis: "48%" }}>
              <label htmlFor="image" className="form-label">Image</label>
              <input type="file" id="image" name="image" accept="image/*"
                className="form-control rounded-0" onChange={handleFileChange} />
              {errors.image && <small className="text-danger">{errors.image}</small>}
            </div>
            {/* Description */}
               <div className="col-12">
                  <div className="form-group">
                  <label>Description</label>
                  <ReactQuill theme="snow" value={event.description} onChange={(content) => setEvent(prev => ({ ...prev, description: content }))} className="bg-white"/>
                  {errors.description && <strong className="text-danger">{errors.description}</strong>}
                  </div>
                </div>
          </div>

          <div style={{ marginTop: 30, display: "flex", justifyContent: "space-between" }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 120 }}>
              Ajouter
            </button>
            <button type="button" className="btn btn-secondary" style={{ minWidth: 120 }}
              onClick={() => navigate("/organizer/events")}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
};

export default AddEventOrganizer;
