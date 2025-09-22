import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function RecommendedEvents() {
    const [recommendedEvents, setRecommendedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Récupérer l'ID de l'utilisateur et le token depuis le stockage local
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // 🔹 Fonction de réservation (réutilisée)
    const handleReserve = async (event) => {
        // La logique de réservation de votre composant EventList
        try {
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

    // 🔹 Fonction pour donner un avis (réutilisée)
    const handleAddReview = async (event) => {
        // La logique d'avis de votre composant EventList
        try {
            const { value: formValues } = await Swal.fire({
                title: "Donner un avis",
                html:
                    '<label>Note (1 à 5):</label><input id="swal-rating" type="number" min="1" max="5" class="swal2-input">' +
                    '<label>Commentaire :</label><textarea id="swal-comment" class="swal2-textarea"></textarea>',
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: () => {
                    const rating = parseInt(document.getElementById('swal-rating').value, 10);
                    const comment = document.getElementById('swal-comment').value;
                    if (!rating || rating < 1 || rating > 5) {
                        Swal.showValidationMessage('La note doit être entre 1 et 5');
                    }
                    return { rating, comment };
                }
            });

            if (!formValues) return;

            await axios.post(
                `http://localhost:8081/reviews/event/${event.id}`,
                formValues,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            Swal.fire('Merci !', 'Votre avis a été enregistré.', 'success');
        } catch (error) {
            Swal.fire('Erreur', error.response?.data || 'Impossible d’enregistrer l’avis', 'error');
        }
    };

    // 🔹 Chargement des recommandations au montage du composant
    useEffect(() => {
        if (!userId || !token) {
            Swal.fire("Erreur", "Vous devez être connecté pour voir les recommandations.", "error");
            navigate("/login-participant");
            return;
        }

        setLoading(true);
        axios
            .get(`http://localhost:8081/api/recommendations/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                setRecommendedEvents(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    Swal.fire("Session expirée", "Veuillez vous reconnecter.", "error");
                    localStorage.clear();
                    navigate("/login-participant");
                } else {
                    setError("Impossible de charger les recommandations. Veuillez réessayer plus tard.");
                }
            });
    }, [userId, token, navigate]);

    // 🔹 Rendu du composant
    return (
        <div>
            <div className="container-fluid bg-primary py-5 mb-5 hero-header">
                <div className="container py-2">
                    <div className="row justify-content-center py-3">
                        <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
                            <h1 className="display-3 text-white animated slideInDown">Mes Recommandations</h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center">
                                    <li className="breadcrumb-item">
                                        <Link to="/">Accueil</Link>
                                    </li>
                                    <li className="breadcrumb-item text-white active" aria-current="page">
                                        Recommandations
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div className="container text-center py-5"><p>Chargement des recommandations...</p></div>}
            {error && <div className="container text-center py-5 text-danger"><p>{error}</p></div>}
            {!loading && !error && (
                <div className="container-xxl py-5">
                    <div className="container">
                        <div className="text-center">
                            <h6 className="section-title bg-white text-center text-primary px-3">
                                Pour vous
                            </h6>
                            <h1 className="mb-4">Événements recommandés</h1>
                            {recommendedEvents.length === 0 && (
                                <p className="text-muted">Aucune recommandation pour le moment. Découvrez plus d'événements pour nous aider à vous connaître !</p>
                            )}
                        </div>
                        <div className="row g-4 justify-content-center">
                            {recommendedEvents.map((event) => (
                                <div key={event.id} className="col-lg-4 col-md-6">
                                    <div className="package-item">
                                        <div className="overflow-hidden">
                                            <img
                                                className="img-fluid"
                                                src={event.image ? `http://localhost:8081/uploads/images/${event.image}` : "/publicSite/assets/img/default.jpg"}
                                                alt={event.titre}
                                                style={{ width: "100%", height: "250px", objectFit: "cover" }}
                                            />
                                        </div>
                                        <div className="d-flex border-bottom">
                                            <small className="flex-fill text-center border-end py-2">📍 {event.adresse}</small>
                                            <small className="flex-fill text-center border-end py-2">
                                                📅 {new Date(event.dateDebut).toLocaleDateString()}
                                            </small>
                                            <small className="flex-fill text-center py-2">
                                                👥 {event.nombreInscriptions ?? 0} / {event.capaciteMax} réservées
                                            </small>
                                        </div>
                                        <div className="text-center p-4">
                                            <h3 className="mb-0">{event.prix ? `${event.prix} TND` : "Gratuit"}</h3>
                                            <p>{event.titre}</p>
                                            <div className="d-flex justify-content-center mb-2 flex-wrap gap-1">
                                                <Link
                                                    to={`/eventdetails/${event.id}`}
                                                    className="btn btn-sm btn-primary px-3 border-end"
                                                    style={{ borderRadius: "30px 0 0 30px" }}
                                                >
                                                    Détails
                                                </Link>
                                                <button
                                                    onClick={() => handleReserve(event)}
                                                    className="btn btn-sm btn-primary px-3"
                                                    style={{ borderRadius: "0 30px 30px 0" }}
                                                >
                                                    Réserver
                                                </button>
                                                <button
                                                    onClick={() => handleAddReview(event)}
                                                    className="btn btn-sm btn-success px-3"
                                                >
                                                    ⭐ Donner un avis
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecommendedEvents;