import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

function Panier() {
  const [panier, setPanier] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const storedPanier = JSON.parse(localStorage.getItem("panier")) || [];
    setPanier(storedPanier);
  }, []);

// ➤ Auto-refresh du panier toutes les 5 minutes
    useEffect(() => {
    const interval = setInterval(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");

      if (token && userId) {
        axios
          .get(`http://localhost:8081/reservations/panier-valide/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            const reservationsValides = res.data;
            const storedPanier = JSON.parse(localStorage.getItem("panier")) || [];
            const panierFiltré = storedPanier.filter((item) =>
              reservationsValides.includes(item.reservationId)
            );

            setPanier(panierFiltré);
            localStorage.setItem("panier", JSON.stringify(panierFiltré));
          })
          .catch((err) => {
            console.error("Erreur lors du rafraîchissement du panier", err);
          });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
    }, []);



const updatePanier = (newPanier) => {
  localStorage.setItem("panier", JSON.stringify(newPanier));
  setPanier(newPanier);
  window.dispatchEvent(new Event("panierUpdated")); // ✅ correct
};


  const handleQuantiteChange = (eventId, nouvelleQuantite) => {
    if (nouvelleQuantite < 1 || nouvelleQuantite > 3) {
      Swal.fire("Attention", "La quantité doit être entre 1 et 3.", "warning");
      return;
    }
    const newPanier = panier.map((item) => {
      if (item.event?.id === eventId) {
        return { ...item, quantite: nouvelleQuantite };
      }
      return item;
    });
    updatePanier(newPanier);
  };

const handleSupprimer = (reservationId) => {
  if (!reservationId) {
    Swal.fire("Erreur", "ID de réservation manquant.", "error");
    return;
  }

  Swal.fire({
    title: "Confirmez-vous la suppression de cette réservation ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:8081/reservations/${reservationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Supprimer localement du panier
        const newPanier = panier.filter((item) => item.reservationId !== reservationId);
        updatePanier(newPanier);

        Swal.fire("Info", "Réservation supprimée.", "info");
      } catch (error) {
        Swal.fire("Erreur", "Impossible de supprimer la réservation.", "error");
      }
    }
  });
};
const handlePayerUnSeul = async ({ reservationId, event, quantite }) => {
  Swal.fire({
    title: `Confirmez-vous le paiement de ${quantite} billet(s) pour "${event.titre}" ?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Oui, payer",
    cancelButtonText: "Annuler",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:8081/reservations/${reservationId}/pay`,
        {}, // corps vide, tout est côté backend
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Message succès
      Swal.fire("Succès", res.data.message, "success");

      // ✅ Récupérer le PDF base64 et l'ouvrir
      if (res.data.pdfBilletBase64) {
        const pdfBlob = base64ToBlob(res.data.pdfBilletBase64, "application/pdf");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
      }

      // ✅ Vider le panier local pour cette réservation
      const newPanier = panier.filter(item => item.reservationId !== reservationId);
      localStorage.setItem("panier", JSON.stringify(newPanier));
      setPanier(newPanier);

      // ✅ Déclencher un event global pour mise à jour éventuelle ailleurs
      window.dispatchEvent(new Event("panierUpdated"));

    } catch (err) {
      Swal.fire("Erreur", err.response?.data || "Paiement échoué.", "error");
      console.error(err);
    }
  });
};

// Helper pour convertir base64 en Blob
function base64ToBlob(base64, mime) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mime });
}




  const total = panier.reduce((acc, item) => {
    if (!item?.event) return acc;
    const prix = item.event.prix || 0;
    const quantite = item.quantite || 0;
    return acc + prix * quantite;
  }, 0);

  
 


  return (

          <div>
            <div className="container-fluid bg-primary py-5 mb-5 hero-header">
                <div className="container py-2">
                  <div className="row justify-content-center py-3">
                    <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
                      <h1 className="display-3 text-white animated slideInDown">Votre panier</h1>
                      <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center">
                          <li className="breadcrumb-item">
                            <Link to="/">Accueil</Link>
                          </li>
                          <li className="breadcrumb-item text-white active" aria-current="page">
                            <Link to="/publicevents">Événements</Link>
                          </li>
                          <li className="breadcrumb-item text-white active" aria-current="page">
                            Panier
                          </li>
                        </ol>
                      </nav>
                      
                    </div>
                  </div>
                </div>
              </div>
    <div className="container py-5">
      <h2>Votre Panier</h2>
      {panier.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Prix total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {panier.map(({ reservationId, event, quantite }) => {
            if (!event) return null;

            // ✅ Calculer les places restantes
            const placesRestantes = event.capaciteMax - (event.nombreInscriptions || 0);
            const placesSuffisantes = quantite <= placesRestantes;

            return (
              <tr key={event.id}>
                <td>{event.titre}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => handleQuantiteChange(event.id, quantite - 1)}
                      disabled={quantite <= 1}
                    >
                      -
                    </button>
                    <span>{quantite}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => handleQuantiteChange(event.id, quantite + 1)}
                      disabled={quantite >= 3}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>{event.prix ? `${event.prix} TND` : "Gratuit"}</td>
                <td>{event.prix ? `${event.prix * quantite} TND` : "Gratuit"}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handlePayerUnSeul({ reservationId, event, quantite })}
                    disabled={loadingId === event.id || !placesSuffisantes}
                  >
                    {loadingId === event.id ? "Chargement..." : "Payer"}
                  </button>

                  <button
                    className="btn btn-danger btn-sm mt-1"
                    onClick={() => handleSupprimer(reservationId)}
                  >
                    Supprimer
                  </button>
                  {!placesSuffisantes && (
                    <div className="text-danger small mt-1">
                      🔴 Places insuffisantes
                    </div>
                  )}

                  
                </td>
              </tr>
            );
          })}
        </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th></th>
              <th></th>
              <th>{total} TND</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  </div>
  );
}

export default Panier;
