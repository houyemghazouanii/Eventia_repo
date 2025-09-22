import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../../../../admin/config/axiosConfig";
import OrganizerLayout from "./OrganizerLayout";
import "./EventDetailsOrganizer.css";

const EventDetailsOrganizer = () => {
  const { id } = useParams();
  const [event, setEvent] = useState({
    titre: "",
    description: "",
    adresse: "",
    dateDebut: "",
    dateFin: "",
    heureDebut: "",
    dateLimiteInscription: "",
    prix: 0,
    type: "",
    statut: "",
    capaciteMax: 0,
    nombreInscriptions: 0,
    image: "",
  });

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const response = await axios.get(`http://localhost:8081/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      setEvent({
        ...data,
        heureDebut: data.heureDebut ? data.heureDebut.slice(0, 5) : "",
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'événement :", error);
    }
  };

  return (
    <OrganizerLayout>
      <div className="container my-5 animate__animated animate__fadeIn">
        <div className="card shadow-lg p-4 rounded">
          <div className="row g-4 align-items-center">
            {/* Image de l'événement */}
            <div className="col-md-4">
              {event.image ? (
                <img
                  src={`http://localhost:8081/uploads/images/${event.image}`}
                  alt="event"
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }}
                />
              ) : (
                <div className="text-muted text-center border rounded py-5">
                  Aucune image disponible
                </div>
              )}
            </div>

            {/* Infos principales */}
            <div className="col-md-8">
              <h2 className="fw-bold">{event.titre}</h2>
              <p className="text-muted mb-1">{event.type}</p>
              <p className="text-muted mb-3">
                <i className="bi bi-geo-alt-fill me-1"></i>
                {event.adresse}
              </p>

              <p className="text-muted">{event.description}</p>
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="row g-3 mt-4">
            <Info icon="calendar-event-fill" label="Date Début" value={event.dateDebut} />
            <Info icon="clock-fill" label="Heure Début" value={event.heureDebut} />
            <Info icon="calendar-check-fill" label="Date Fin" value={event.dateFin} />
            <Info icon="hourglass-split" label="Limite Inscription" value={event.dateLimiteInscription} />
            <Info icon="cash" label="Prix" value={`${event.prix} TND`} />
            <Info icon="people-fill" label="Capacité Max" value={event.capaciteMax} />
            <Info icon="person-check-fill" label="Inscriptions" value={event.nombreInscriptions} />
            <Info icon="patch-check-fill" label="Statut" value={event.statut} />
          </div>

          {/* Bouton retour */}
          <div className="mt-4 text-end">
            <Link to="/organizer/events" className="btn btn-outline-primary rounded-pill">
              <i className="bi bi-arrow-left me-2"></i>
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};

const Info = ({ icon, label, value }) => (
  <div className="col-md-6 col-lg-4">
    <div className="info-box border p-3 rounded shadow-sm bg-white">
      <p className="mb-1 fw-bold">
        <i className={`bi bi-${icon} me-2`}></i> {label}
      </p>
      <p className="mb-0 text-muted">{value || 0 }</p>
    </div>
  </div>
);

export default EventDetailsOrganizer;
