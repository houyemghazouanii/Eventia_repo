import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "animate.css";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [organisateur, setOrganisateur] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsAuthenticated(token && role === "USER");

    const fetchData = async () => {
      try {
        // Charger l'événement
        const eventRes = await axios.get(`http://localhost:8081/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setEvent(eventRes.data);

        // Charger l'organisateur
        if (eventRes.data.organizerId) {
          const organizerRes = await axios.get(
            `http://localhost:8081/users/${eventRes.data.organizerId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          setOrganisateur({
            nom: organizerRes.data.nom || "",
            prenom: organizerRes.data.prenom || "",
            nomSociete: organizerRes.data.nomSociete || "",
            typeOrganisateur: organizerRes.data.typeOrganisateur || "",
          });
        }

        // Charger les avis
        const reviewsRes = await axios.get(`http://localhost:8081/reviews/event/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        let reviewsArray = [];
        if (Array.isArray(reviewsRes.data)) {
          reviewsArray = reviewsRes.data;
        } else if (reviewsRes.data.reviews && Array.isArray(reviewsRes.data.reviews)) {
          reviewsArray = reviewsRes.data.reviews;
        }
        setReviews(reviewsArray);

      } catch (error) {
        console.error("Erreur lors du chargement :", error);
      }
    };

    fetchData();
  }, [id]);

  if (!event) return <div className="text-center py-5">Chargement...</div>;

  // 🔹 Réservation
  const handleReserve = async () => {
    if (!isAuthenticated) {
      Swal.fire("Erreur", "Vous devez être connecté pour réserver.", "error");
      navigate("/login-participant");
      return;
    }

    const { value: quantite } = await Swal.fire({
      title: "Combien de billets souhaitez-vous réserver ?",
      input: "number",
      inputAttributes: { min: 1, max: 3, step: 1 },
      inputValue: 1,
      showCancelButton: true,
      confirmButtonText: "Réserver",
      cancelButtonText: "Annuler",
      inputValidator: (value) => {
        if (!value || value < 1 || value > 3) {
          return "Merci de saisir un nombre entre 1 et 3";
        }
      },
    });

    if (!quantite) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8081/reservations",
        { eventId: event.id, quantite: parseInt(quantite, 10) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const reservation = res.data;
      let panier = JSON.parse(localStorage.getItem("panier")) || [];
      const index = panier.findIndex((item) => item.event.id === event.id);
      if (index === -1) {
        panier.push({ event, quantite: parseInt(quantite, 10), reservationId: reservation.id });
      } else {
        panier[index].quantite = quantite;
        panier[index].reservationId = reservation.id;
      }
      localStorage.setItem("panier", JSON.stringify(panier));
      window.dispatchEvent(new Event("panierUpdated"));

      Swal.fire(
        "Succès",
        "Réservation enregistrée avec succès. Vous pouvez payer dans votre panier.",
        "success"
      );
    } catch (error) {
      if (error.response && error.response.status === 409) {
        Swal.fire("Erreur", "Vous avez déjà réservé cet événement.", "error");
      } else if (error.response && error.response.data) {
        Swal.fire("Erreur", error.response.data, "error");
      } else {
        Swal.fire("Erreur", "Erreur lors de la réservation.", "error");
      }
    }
  };

  // 🔹 Fonction pour afficher les étoiles
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi bi-star${i <= rating ? "-fill" : ""} me-1`}
          style={{ color: i <= rating ? "#FFD700" : "#ccc" }}
        />
      );
    }
    return stars;
  };

  return (
    <div>
      {/* Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-4 text-white animated slideInDown">Plongez dans l’univers de cet événement</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center mb-0">
                  <li className="breadcrumb-item"><Link to="/">Accueil</Link></li>
                  <li className="breadcrumb-item"><Link to="/publicevents">Les événements</Link></li>
                  <li className="breadcrumb-item active text-white" aria-current="page">Détails</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container animate__animated animate__fadeIn">
        <div className="row g-4">
          {/* Colonne gauche */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm">
              {event.image ? (
                <img
                  src={`http://localhost:8081/uploads/images/${event.image}`}
                  alt={event.titre}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover", borderTopLeftRadius: "0.5rem", borderTopRightRadius: "0.5rem" }}
                />
              ) : (
                <div className="bg-light text-center py-5 text-muted rounded-top">Aucune image disponible</div>
              )}
              <div className="card-body">
                <h2 className="card-title mb-3">{event.titre}</h2>
                <h5 className="fw-bold mb-2">Description</h5>
                <p>{event.description || "Aucune description disponible."}</p>
                <h5 className="fw-bold mt-4 mb-2">Adresse</h5>
                <p>{event.adresse}</p>
                <div className="ratio ratio-16x9 mb-3 rounded shadow">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(event.adresse)}&output=embed`}
                    allowFullScreen
                    title="Carte"
                    style={{ borderRadius: "0.5rem" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h4 className="fw-bold mb-3">Informations clés</h4>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">Date de début : {new Date(event.dateDebut).toLocaleDateString()}</li>
                    <li className="list-group-item">Date de fin : {new Date(event.dateFin).toLocaleDateString()}</li>
                    <li className="list-group-item">Heure : {event.heureDebut || "Non précisée"}</li>
                    <li className="list-group-item">Places max : {event.capaciteMax}</li>
                    <li className="list-group-item">Prix : {event.prix ? `${event.prix} TND` : "Gratuit"}</li>
                    <li className="list-group-item">
                      Organisateur : <br />
                      {organisateur ? (
                        <div>
                          {organisateur.typeOrganisateur === "SOCIETE" ? (
                            <>
                              <p>Type : Société</p>
                              <p>Nom : {organisateur.nomSociete}</p>
                            </>
                          ) : (
                            <>
                              <p>Type : Individuel</p>
                              <p>Nom : {organisateur.prenom} {organisateur.nom}</p>
                            </>
                          )}
                        </div>
                      ) : <p className="text-muted">Organisateur inconnu</p>}
                    </li>
                  </ul>

                  {/* Bouton réservation */}
                  <button onClick={handleReserve} className="btn btn-primary w-100 mt-3">
                    <i className="bi bi-ticket-perforated-fill me-2"></i>Réserver maintenant
                  </button>

                  {/* Avis */}
                  <div className="mt-4">
                    <h5 className="fw-bold mb-3">Avis des participants</h5>
                    {reviews.length === 0 ? (
                      <p className="text-muted">Aucun avis pour le moment.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {reviews.map((review) => (
                          <div key={review.id} className="card shadow-sm p-3 animate__animated animate__fadeInUp">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <strong>{review.participantNomPrenom}</strong>
                              <span>{renderStars(review.rating)}</span>
                            </div>
                            <p className="mb-1">{review.comment}</p>
                            <small className="text-muted">{new Date(review.createdAt).toLocaleString()}</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
