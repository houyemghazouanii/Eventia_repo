import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function EventList({ showHeader = true }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // 🔹 Chargement des événements et auth
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8081/events/public/events")
      .then((res) => {
        setEvents(res.data);
        setFilteredEvents(res.data);
        setFeaturedEvents(res.data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des événements");
        setLoading(false);
      });

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsAuthenticated(token && role === "USER");
  }, []);

  // 🔹 Chargement des types d'événements
  useEffect(() => {
    axios
      .get("http://localhost:8081/events/types")
      .then((res) => setAvailableTypes(res.data))
      .catch(() => {});
  }, []);

   const handleSearch = () => {
    const titleFilter = searchTitle.toLowerCase();
    const filtered = events.filter((event) => {
      const matchesTitle = event.titre.toLowerCase().includes(titleFilter);
      const matchesDate = searchDate
        ? new Date(event.dateDebut).toISOString().slice(0, 10) === searchDate
        : true;
      const matchesPrice =
        selectedPriceFilter === "GRATUIT"
          ? !event.prix || event.prix === 0
          : selectedPriceFilter === "PAYANT"
          ? event.prix > 0
          : true;
      const matchesType = selectedType ? event.type === selectedType : true;
      return matchesTitle && matchesDate && matchesPrice && matchesType;
    });
    setFilteredEvents(filtered);
  };

  /// 🔹 Filtrage côté frontend
useEffect(() => {
  handleSearch();
}, [searchTitle, searchDate, selectedPriceFilter, selectedType, events]);
 
  // 🔹 Réservation
  const handleReserve = async (event) => {
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

  // 🔹 Donner un avis
  const handleAddReview = async (event) => {
    if (!isAuthenticated) {
      Swal.fire("Erreur", "Vous devez être connecté pour donner un avis.", "error");
      navigate("/login-participant");
      return;
    }

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

    try {
      const token = localStorage.getItem('token');
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

  const eventsToDisplay = isAuthenticated ? filteredEvents : featuredEvents;

  return (
    <div>
      {/* Header */}
      {showHeader && (
        <div className="container-fluid bg-primary py-5 mb-5 hero-header">
          <div className="container py-2">
            <div className="row justify-content-center py-3">
              <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
                <h1 className="display-3 text-white animated slideInDown">Événements</h1>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb justify-content-center">
                    <li className="breadcrumb-item">
                      <Link to="/">Accueil</Link>
                    </li>
                    <li className="breadcrumb-item text-white active" aria-current="page">
                      Événements
                    </li>
                  </ol>
                </nav>
                {isAuthenticated && (
                  <div className="mt-3">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => navigate("/recommended-events")}
                    >
                      🌟 Voir mes recommandations
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="container text-center py-5">
          <p>Chargement en cours...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="container text-center py-5 text-danger">
          <p>{error}</p>
        </div>
      )}

      {/* Liste des événements */}
      {!loading && !error && (
        <div className="container-xxl py-5">
          <div className="container">
            <div className="text-center">
              <h6 className="section-title bg-white text-center text-primary px-3">
                {isAuthenticated ? "Tous les événements" : "Événements à la une"}
              </h6>
              <h1 className="mb-4">{isAuthenticated ? "Découvrez nos événements" : "À la une"}</h1>

              {!isAuthenticated && (
                <div className="card mb-4 text-center shadow-sm p-3">
                  <div className="card-body">
                    <h5 className="card-title text-primary">Découvrez tous les événements !</h5>
                    <p className="card-text">
                      Connectez-vous pour accéder à la liste complète et réserver vos billets.
                    </p>
                    <Link to="/login-participant" className="btn btn-primary btn-sm">
                      Se connecter
                    </Link>
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <div className="row mb-4 justify-content-center">
                  {/* Filtres */}
                  <div className="col-md-3 mb-2">
                    <div className="btn-group" role="group">
                      {["", "GRATUIT", "PAYANT"].map((option) => (
                        <label
                          key={option}
                          className={`btn btn-outline-primary ${selectedPriceFilter === option ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            className="btn-check"
                            name="price"
                            value={option}
                            checked={selectedPriceFilter === option}
                            onChange={(e) => setSelectedPriceFilter(e.target.value)}
                          />
                          {option === "" ? "Tous" : option}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-4 mb-2">
                    <select
                      className="form-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="">Tous les types</option>
                      {availableTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2 mb-2 d-grid">
                    <button className="btn btn-primary btn-sm" onClick={handleSearch}>
                      Filtrer
                    </button>
                  </div>
                </div>
              )}

              <div className="row g-4 justify-content-center">
                {eventsToDisplay.map((event) => (
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
                        {isAuthenticated && (
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
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventList;
