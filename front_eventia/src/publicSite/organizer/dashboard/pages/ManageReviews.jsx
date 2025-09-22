import React, { useEffect, useState } from "react";
import OrganizerLayout from "./OrganizerLayout";
import axios from "../../../../admin/config/axiosConfig";
import Swal from "sweetalert2";
import { FaTrashAlt, FaStar } from "react-icons/fa";
import { Pie, Line, PolarArea } from "react-chartjs-2"; // Add PolarArea
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale, // Add RadialLinearScale
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartDataLabels,
  RadialLinearScale // Register the new scale
);

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const userData = localStorage.getItem("user");
  let organizerId = localStorage.getItem("id");
  let token = localStorage.getItem("token");

  if (userData) {
    try {
      const user = JSON.parse(userData);
      organizerId = user.id;
      token = user.token;
    } catch (err) {
      console.error("Erreur parsing localStorage", err);
    }
  }

  const fetchReviews = async () => {
    if (!organizerId || !token) {
      setErrorMsg("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    try {
      // Récupérer les événements de l'organisateur
      const eventsRes = await axios.get(
        `/events/users/organizers/${organizerId}/events`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const events = eventsRes.data;

      // Pour chaque événement, appeler le backend Flask pour récupérer les avis avec sentiment
      const reviewsPromises = events.map(async (event) => {
        try {
          const res = await axios.get(
            `http://localhost:8081/reviews/event/${event.id}`
          );
          const eventReviews = res.data.reviews || [];
          // Ajouter le titre de l'événement à chaque avis
          return eventReviews.map((rev) => ({
            ...rev,
            eventTitle: event.titre,
          }));
        } catch (err) {
          console.error(
            `Impossible de récupérer les avis sentiment de l'événement ${event.id}`,
            err
          );
          return [];
        }
      });

      const reviewsArrays = await Promise.all(reviewsPromises);
      setReviews(reviewsArrays.flat());
    } catch (err) {
      console.error(err);
      setErrorMsg("Impossible de récupérer les événements et avis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [organizerId, token]);

  const handleDelete = async (reviewId) => {
    const result = await Swal.fire({
      title: "Supprimer l'avis ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F0604D",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/reviews/${reviewId}?organizerId=${organizerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Supprimé !", "L'avis a été supprimé.", "success");
      setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
    } catch (err) {
      console.error(err);
      Swal.fire("Erreur !", "Impossible de supprimer l'avis.", "error");
    }
  };

  // Statistiques pour le graphique des sentiments (Pie/PolarArea)
  const sentimentStats = reviews.reduce(
    (acc, rev) => {
      const sentiment = (rev.sentiment || "").trim().toLowerCase();
      if (sentiment === "positif") acc.Positif += 1;
      else if (sentiment === "négatif") acc.Négatif += 1;
      else acc.Neutre += 1;
      return acc;
    },
    { Positif: 0, Neutre: 0, Négatif: 0 }
  );

  const pieData = {
    labels: ["Positif", "Neutre", "Négatif"],
    datasets: [
      {
        data: [sentimentStats.Positif, sentimentStats.Neutre, sentimentStats.Négatif],
        backgroundColor: ["#FFAA95", "#9AC8EB", "#EF7D7D"],
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { position: "bottom" },
      datalabels: {
        color: "#fff",
        formatter: (value) => `${value}`,
      },
      title: {
        display: true,
        text: "Répartition des avis par sentiment",
        font: { size: 16 },
      },
    },
  };

  // Nouvelles statistiques pour le graphique des notes (Polar Area)
  const ratingStats = reviews.reduce(
    (acc, rev) => {
      acc[rev.rating] = (acc[rev.rating] || 0) + 1;
      return acc;
    },
    {}
  );

  const ratingLabels = ["1 étoile", "2 étoiles", "3 étoiles", "4 étoiles", "5 étoiles"];
  const ratingData = {
    labels: ratingLabels,
    datasets: [
      {
        data: ratingLabels.map((_, i) => ratingStats[i + 1] || 0),
        backgroundColor: [
          '#F0604D', 
          '#FE9D15', 
          '#FEBB5F', 
          '#82F2A7', 
          '#7DC2A5' 
        ],
        hoverOffset: 4,
      },
    ],
  };

  const ratingOptions = {
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: "Répartition des avis par note",
        font: { size: 16 },
      },
      datalabels: {
        color: '#000',
        formatter: (value) => value > 0 ? value : '',
      }
    },
    scales: {
      r: {
        grid: {
          color: '#e9ecef',
        },
        angleLines: {
          color: '#e9ecef',
        },
        pointLabels: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <OrganizerLayout>
      <div className="container py-5">
        <h2 className="fw-bold mb-4">Gestion des Avis</h2>

        {loading ? (
          <p>Chargement des avis...</p>
        ) : errorMsg ? (
          <p className="text-danger">{errorMsg}</p>
        ) : (
          <>
            {/* Graphiques */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card shadow-sm p-3">
                  <Pie data={pieData} options={pieOptions} plugins={[ChartDataLabels]} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-sm p-3">
                  <PolarArea data={ratingData} options={ratingOptions} plugins={[ChartDataLabels]} />
                </div>
              </div>
            </div>

            {/* Liste des avis */}
            <div className="row g-4">
              {reviews.length === 0 ? (
                <p className="text-muted">Aucun avis trouvé.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="col-md-6 col-lg-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header text-white d-flex justify-content-between align-items-center"   
                      style={{ backgroundColor: "#2DBDB4" }}>
                        <span className="fw-bold">{rev.eventTitle}</span>
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: "#F0604D", color: "white" }}
                          onClick={() => handleDelete(rev.id)}
                          title="Supprimer"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                      <div className="card-body">
                        <p className="mb-2">{rev.comment}</p>
                        <p className="mb-1">
                          Note:{" "}
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <FaStar key={i} className="text-warning" />
                          ))}
                          {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                            <FaStar key={i} className="text-secondary" />
                          ))}
                        </p>
                        <p className="text-muted mb-0">
                          Par: {rev.participantNomPrenom || `ID ${rev.participant_id}`} | Sentiment:{" "}
                          <span
                          className="badge"
                          style={{
                            backgroundColor:
                              rev.sentiment?.toLowerCase() === "positif"
                                ? "#FFAA95"
                                : rev.sentiment?.toLowerCase() === "négatif"
                                ? "#EF7D7D"
                                : "#9AC8EB", // This color is used for "Neutre"
                            color: "white", // Added to ensure text is readable on the new backgrounds
                          }}
                        >
                          {rev.sentiment}
                        </span>
                       </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </OrganizerLayout>
  );
}