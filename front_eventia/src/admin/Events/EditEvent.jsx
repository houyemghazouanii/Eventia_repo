import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from '../config/axiosConfig'; 
import Swal from "sweetalert2";

const EditEvent = () => {
  const { id } = useParams();
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

  const [currentImageName, setCurrentImageName] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8081/events/${id}`)
      .then((response) => {
        const data = response.data;
        setEvent({
          titre: data.titre || "",
          description: data.description || "",
          dateDebut: data.dateDebut ? data.dateDebut.slice(0, 10) : "",
          dateFin: data.dateFin ? data.dateFin.slice(0, 10) : "",
          heureDebut: data.heureDebut ? data.heureDebut.slice(0, 5) : "", 
          adresse: data.adresse || "",
          type: data.type || "",
          statut: data.statut || "",
          capaciteMax: data.capaciteMax || "",
          prix: data.prix !== null && data.prix !== undefined ? data.prix : "",
          dateLimiteInscription: data.dateLimiteInscription
            ? data.dateLimiteInscription.slice(0, 10)
            : "",
          image: null,
          organizerId: data.organizerId || "",
        });

        if (data.image) {
          const urlParts = data.image.split("/");
          setCurrentImageName(urlParts[urlParts.length - 1]);
        } else {
          setCurrentImageName("");
        }
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de l'événement :", error);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent({ ...event, [name]: value });
  };

  const handleFileChange = (e) => {
    setEvent({ ...event, image: e.target.files[0] });
  };

  const updateEvent = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("titre", event.titre);
      formData.append("description", event.description);
      formData.append("dateDebut", event.dateDebut);
      formData.append("dateFin", event.dateFin);
      formData.append("heureDebut", event.heureDebut);
      formData.append("adresse", event.adresse);
      formData.append("type", event.type);
      formData.append("statut", event.statut);
      formData.append("capaciteMax", event.capaciteMax);
      formData.append("prix", event.prix);
      formData.append("dateLimiteInscription", event.dateLimiteInscription);
      formData.append("organizerId", event.organizerId);

      if (event.image) {
        formData.append("image", event.image);
      }

      await axios.put(`http://localhost:8081/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: "success",
        title: "Succès",
        text: "L'événement a été modifié avec succès !",
        confirmButtonText: "OK",
      });

      navigate("/admin/events");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement :", error);

      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "La mise à jour de l'événement a échoué.",
        confirmButtonText: "OK",
      });
    }
  };

 const type = [
    "SPORT",
    "MUSIC", 
    "FESTIVAL",
    "TRAINING",
    "WORKSHOP",
    "CONFERENCE",
    "CAMPING",
    "OTHER"
  ];  
  const eventStatuses = ["ACTIVE", "PLANNED", "COMPLETED", "CANCELLED", "ARCHIVED"];

  return (
      <div className="container mt-5" style={{ paddingTop: '40px', paddingBottom: '80px', paddingLeft: '80px', paddingRight: '80px' }}>
            <div className="page-inner">
      
              {/* En-tête avec titre et fil d'ariane */}
             <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold m-0">Modifier un événement</h3>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/admin/">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/admin/events">Événements</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Modifier
                  </li>
                </ol>
              </nav>
            </div>

      <section id="multiple-column-form">
        <div className="row match-height">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Formulaire événement</h4>
              </div>
              <div className="card-content">
                <div className="card-body">
                  <form
                    className="form"
                    onSubmit={updateEvent}
                    encType="multipart/form-data"
                  >
                    <div className="row">
                      <div className="col-md-6 col-12">
                        <label htmlFor="titre">Titre</label>
                        <input
                          type="text"
                          id="titre"
                          name="titre"
                          className="form-control rounded-0"
                          placeholder="Titre"
                          value={event.titre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="adresse">Adresse</label>
                        <input
                          type="text"
                          id="adresse"
                          name="adresse"
                          className="form-control rounded-0"
                          placeholder="Adresse"
                          value={event.adresse}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="dateDebut">Date Début</label>
                        <input
                          type="date"
                          id="dateDebut"
                          name="dateDebut"
                          className="form-control rounded-0"
                          value={event.dateDebut}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="dateFin">Date Fin</label>
                        <input
                          type="date"
                          id="dateFin"
                          name="dateFin"
                          className="form-control rounded-0"
                          value={event.dateFin}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                       <div className="col-md-6 col-12">
                        <label htmlFor="heureDebut">Heure de début</label>
                        <input
                          type="time"
                          id="heureDebut"
                          name="heureDebut"
                          className="form-control rounded-0"
                          value={event.heureDebut}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                    {/* Select for Type */}
                      <div className="col-md-6 col-12 mb-3">
                        <label htmlFor="type" className="form-label">Type</label>
                        <select
                          id="type"
                          name="type"
                          className="form-select"
                          value={event.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Sélectionner un type</option>
                          {type.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Select for Statut */}
                      <div className="col-md-6 col-12 mb-3">
                        <label htmlFor="statut" className="form-label">Statut</label>
                        <select
                          id="statut"
                          name="statut"
                          className="form-select"
                          value={event.statut}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Sélectionner un statut</option>
                          {eventStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="capaciteMax">Capacité Max</label>
                        <input
                          type="number"
                          id="capaciteMax"
                          name="capaciteMax"
                          className="form-control rounded-0"
                          placeholder="Capacité Max"
                          value={event.capaciteMax}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="prix">Prix (TND)</label>
                        <input
                          type="number"
                          step="0.01"
                          id="prix"
                          name="prix"
                          className="form-control rounded-0"
                          placeholder="Prix"
                          value={event.prix}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="dateLimiteInscription">
                          Date Limite d'inscription
                        </label>
                        <input
                          type="date"
                          id="dateLimiteInscription"
                          name="dateLimiteInscription"
                          className="form-control rounded-0"
                          value={event.dateLimiteInscription}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          className="form-control rounded-0"
                          rows={3}
                          placeholder="Description"
                          value={event.description}
                          onChange={handleInputChange}
                          maxLength={1000}
                          required
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="image">Image:</label>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          className="form-control rounded-0"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {currentImageName && (
                          <small className="text-muted">Image actuelle : {currentImageName}</small>
                        )}
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="organizerId">Organisateur ID</label>
                        <input
                          type="text"
                          id="organizerId"
                          name="organizerId"
                          className="form-control rounded-0"
                          placeholder="Organisateur ID"
                          value={event.organizerId}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <br />
                      <br />
                      <br />
                      <div className="col-12 d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary me-1 mb-1">
                          Enregistrer
                        </button>
                        <Link to="/admin/events" className="btn btn-light-secondary me-1 mb-1">
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

export default EditEvent;
