import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

export default function ParticipantHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const userId = localStorage.getItem("userId") || localStorage.getItem("id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId || !token) {
        setErrorMsg("Vous devez être connecté pour voir votre historique.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8081/users/${userId}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // organiser le nom de l’organisateur
        const processed = response.data.map((h) => {
          let organizerName = h.organizerName || "Non renseigné";
          if (h.typeOrganisateur === "PERSONNE") {
            organizerName = `${h.organizerPrenom || ""} ${h.organizerNom || ""}`.trim();
          } else if (h.typeOrganisateur === "SOCIETE") {
            organizerName = h.nomSociete || organizerName;
          }
          return { ...h, organizerName };
        });

        setHistory(processed);
      } catch (error) {
        console.error(error);
        setErrorMsg("Impossible de récupérer l'historique.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId, token]);

  if (loading) return <p>Chargement de l'historique...</p>;
  if (errorMsg) return <p className="text-danger">{errorMsg}</p>;

  return (
    <div>
      {/* Hero header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 text-center">
              <h1 className="display-4 text-white animate__animated animate__fadeInDown">Mon Historique</h1>
              <p className="fs-5 text-white animate__animated animate__fadeInUp">Retrouvez toutes vos participations passées</p>
            </div>
          </div>
        </div>
      </div>

    <div className="container py-5">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-clock-history text-primary"></i> Mon Historique
      </h2>

      {history.length === 0 ? (
        <p className="text-muted">Aucune participation trouvée.</p>
      ) : (
        <div className="row g-3">
          {history.map((h, idx) => (
            <div key={idx} className="col-md-6 col-lg-4">
              <div className="card shadow-sm p-3 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{h.titre}</h5>
                  <span
                    className={`badge ${
                      h.statut === "PAYEE"
                        ? "bg-success"
                        : h.statut === "EN_ATTENTE"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {h.statut}
                  </span>
                </div>

                <p className="mb-1">
                  <strong>Réservé le :</strong>{" "}
                  {new Date(h.dateReservation).toLocaleString()}
                </p>

                <button
                  className="btn btn-info btn-sm mt-2"
                  onClick={() =>
                    Swal.fire({
                      title: h.titre,
                      html: `<p><strong>Organisateur:</strong> ${h.organizerName}</p>
                             <p><strong>Date Début:</strong> ${h.dateDebut}</p>
                             <p><strong>Réservé le:</strong> ${new Date(
                               h.dateReservation
                             ).toLocaleString()}</p>
                             <p><strong>Statut:</strong> ${h.statut}</p>`,
                    })
                  }
                >
                  <FaEye /> Voir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    </div>
  );
}
