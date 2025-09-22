import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from '../config/axiosConfig';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState({
    titre: "",
    description: "",
    lieu: "",
    dateDebut: "",
    dateFin: "",
    dateLimiteInscription: "",
    prix: 0,
    type: "",
    statut: "",
    capaciteMax: 0,
    nombreInscriptions: 0,
    image: "",
    organizerId: null,
    heureDebut: "",
  });

  const [organisateur, setOrganisateur] = useState({
    nom: "",
    prenom: "",
    nomSociete: "",
    typeOrganisateur: "",
  });

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/events/${id}`);
      const data = response.data;

      // Assurer le format de l'heure (slice pour "14:30:00" → "14:30")
      setEvent({
        ...data,
        heureDebut: data.heureDebut ? data.heureDebut.slice(0, 5) : "",
      });

      if (data.organizerId) {
        const organizerRes = await axios.get(
          `http://localhost:8081/users/${data.organizerId}`
        );
        setOrganisateur({
          nom: organizerRes.data.nom || "",
          prenom: organizerRes.data.prenom || "",
          nomSociete: organizerRes.data.nomSociete || "",
          typeOrganisateur: organizerRes.data.typeOrganisateur || "",
        });
      }
    } catch (error) {
      console.error("Erreur chargement :", error);
    }
  };

  return (
    <div className="container mt-5" style={{ padding: "40px 80px 80px 80px" }}>
      <div className="page-inner">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Détails d'un événement</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <Link to="/admin/">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/admin/events">Événements</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Détails
              </li>
            </ol>
          </nav>
        </div>

        <section className="shadow" style={{ backgroundColor: "whitesmoke" }}>
          <div className="container py-5">
            <div className="row">
              {/* IMAGE ET INFO */}
              <div className="col-lg-4">
                <div className="card mb-4">
                  <div className="card-body text-center">
                    {event.image ? (
                      <img
                        src={`http://localhost:8081/uploads/images/${event.image}`}
                        alt="event"
                        className="rounded img-fluid"
                        style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
                      />
                    ) : (
                      <p className="text-muted">Aucune image disponible</p>
                    )}
                    <h5 className="my-3 mt-4">{event.titre}</h5>
                    <p className="text-muted mb-1">{event.type}</p>
                    <p className="text-muted mb-4">{event.lieu}</p>
                  </div>
                </div>
                <div className="d-grid">
                  <Link to="/admin/events" className="btn btn-secondary rounded-pill">
                    Retour à la liste
                  </Link>
                </div>
              </div>

              {/* DETAILS TEXTE */}
              <div className="col-lg-8">
                <div className="card mb-4">
                  <div className="card-body">
                    <h5>Description</h5>
                    <p className="text-muted">{event.description}</p>
                    <hr />
                    <div className="row">
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Date Début :</strong></p>
                        <p className="text-muted">{event.dateDebut}</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Heure Début :</strong></p>
                        <p className="text-muted">{event.heureDebut || "Non spécifiée"}</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Date Fin :</strong></p>
                        <p className="text-muted">{event.dateFin}</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Date limite inscription :</strong></p>
                        <p className="text-muted">{event.dateLimiteInscription}</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Prix :</strong></p>
                        <p className="text-muted">{event.prix} TND</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Capacité Max :</strong></p>
                        <p className="text-muted">{event.capaciteMax}</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Inscriptions :</strong></p>
                        <p className="text-muted">{event.nombreInscriptions}</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-0"><strong>Statut :</strong></p>
                        <p className="text-muted">{event.statut}</p>
                      </div>
                      <div className="col-sm-12">
                        <p className="mb-0"><strong>Organisateur :</strong></p>
                        <p className="text-muted">
                          {organisateur.typeOrganisateur === "PERSONNE"
                            ? `${organisateur.nom} ${organisateur.prenom}`
                            : organisateur.nomSociete || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* FIN DETAILS */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventDetails;
