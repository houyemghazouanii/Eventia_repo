import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../../../admin/config/axiosConfig";
import OrganizerLayout from "./OrganizerLayout";
import Swal from "sweetalert2";

const EditEventOrganizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState({
    titre: "",
    description: "",
    adresse: "",
    dateDebut: "",
    dateFin: "",
    dateLimiteInscription: "",
    heureDebut: "",
    prix: 0,
    type: "",
    statut: "",
    capaciteMax: 0,
    image: null,
  });

  const [currentImageName, setCurrentImageName] = useState("");
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line
  }, []);

  const loadEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      setEvent({
        titre: data.titre || "",
        description: data.description || "",
        adresse: data.adresse || "",
        dateDebut: data.dateDebut ? data.dateDebut.slice(0, 10) : "",
        dateFin: data.dateFin ? data.dateFin.slice(0, 10) : "",
        dateLimiteInscription: data.dateLimiteInscription ? data.dateLimiteInscription.slice(0, 10) : "",
        heureDebut: data.heureDebut ? data.heureDebut.slice(0, 5) : "",
        prix: data.prix || 0,
        type: data.type || "",
        statut: data.statut || "",
        capaciteMax: data.capaciteMax || 0,
        image: null,
      });

      if (data.image) {
        setCurrentImageName(data.image);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'événement :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Vous n'êtes pas autorisé à modifier cet événement.",
      }).then(() => navigate("/organizer/events"));
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setEvent({ ...event, image: files[0] });
    } else {
      setEvent({ ...event, [name]: value });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("titre", event.titre);
    formData.append("description", event.description);
    formData.append("adresse", event.adresse);
    formData.append("dateDebut", event.dateDebut);
    formData.append("dateFin", event.dateFin);
    formData.append("dateLimiteInscription", event.dateLimiteInscription || "");
    formData.append("heureDebut", event.heureDebut);
    formData.append("prix", event.prix);
    formData.append("type", event.type);
    formData.append("statut", event.statut);
    formData.append("capaciteMax", event.capaciteMax);

    if (event.image instanceof File) {
      formData.append("image", event.image);
    }

    await axios.put(`http://localhost:8081/events/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    Swal.fire({
      icon: "success",
      title: "Succès",
      text: "L'événement a été modifié avec succès !",
    });

    navigate("/organizer/events");
  } catch (err) {
    console.error("Erreur lors de la modification :", err);
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "La modification de l'événement a échoué.",
    });
  }
};


  const types = ["SPORT","MUSIC","FESTIVAL","TRAINING","WORKSHOP","CONFERENCE","CAMPING","OTHER"];

  return (
    <OrganizerLayout>
      <div className="container my-5">
        <div className="card shadow-lg p-4">
          <h3 className="mb-4">Modifier un événement</h3>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row g-3">
              <div className="col-md-6">
                <label>Titre</label>
                <input type="text" name="titre" value={event.titre} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label>Adresse</label>
                <input type="text" name="adresse" value={event.adresse} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label>Type</label>
                <select name="type" value={event.type} onChange={handleChange} className="form-select" required>
                  <option value="">-- Choisir un type --</option>
                  {types.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div className="col-md-6">
                <label>Date Début</label>
                <input type="date" name="dateDebut" value={event.dateDebut} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label>Date Fin</label>
                <input type="date" name="dateFin" value={event.dateFin} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label>Limite Inscription</label>
                <input type="date" name="dateLimiteInscription" value={event.dateLimiteInscription} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6">
                <label>Heure Début</label>
                <input type="time" name="heureDebut" value={event.heureDebut} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label>Prix (TND)</label>
                <input type="number" name="prix" value={event.prix} onChange={handleChange} className="form-control" min="0" />
              </div>
              <div className="col-md-6">
                <label>Capacité Max</label>
                <input type="number" name="capaciteMax" value={event.capaciteMax} onChange={handleChange} className="form-control" min="1" />
              </div>
              <div className="col-md-6">
                <label>Description</label>
                <textarea name="description" value={event.description} onChange={handleChange} className="form-control" rows="3" required />
              </div>
              <div className="col-md-6">
                <label>Image</label>
                <input type="file" name="image" onChange={handleChange} className="form-control" />
                {currentImageName && <small className="text-muted">Image actuelle : {currentImageName}</small>}
              </div>
            </div>
            <div className="mt-4 d-flex justify-content-between">
              <Link to="/organizer/events" className="btn btn-secondary">Annuler</Link>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default EditEventOrganizer;
