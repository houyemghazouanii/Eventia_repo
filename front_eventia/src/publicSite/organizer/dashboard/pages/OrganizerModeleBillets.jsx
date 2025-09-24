import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../../admin/config/axiosConfig";
import Swal from "sweetalert2";
import OrganizerLayout from "./OrganizerLayout";
import { FaLink, FaTrashAlt } from "react-icons/fa";

const OrganizerModeleBillets = () => {
  const [modeles, setModeles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const organizerId = localStorage.getItem("id");

  const fetchData = useCallback(async () => {
    if (!token || !organizerId) return;

    setLoading(true);
    try {
      const [modelesRes, eventsRes] = await Promise.all([
        axios.get("/api/modeles-billets", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/events/users/organizers/${organizerId}/events`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setModeles(modelesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      Swal.fire("Erreur", "Impossible de charger les données.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, organizerId]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  // ⚡ Associer un modèle à un événement
  const handleAssocier = async (modele) => {
    const eventsSansModele = events.filter(e => !e.ticketTemplateId);
    if (!eventsSansModele.length) {
      Swal.fire("Info", "Tous vos événements ont déjà un modèle associé.", "info");
      return;
    }

    const eventOptions = eventsSansModele.reduce((acc, e) => {
      acc[e.id] = e.titre;
      return acc;
    }, {});

    const { value: eventId } = await Swal.fire({
      title: "Associer un modèle à un événement",
      input: "select",
      inputOptions: eventOptions,
      inputPlaceholder: "Sélectionnez un événement",
      showCancelButton: true,
    });
    if (!eventId) return;

    try {
      await axios.post(`/events/${eventId}/template`, { templateId: modele.id, params: {} }, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire("Succès", `Modèle "${modele.nom}" associé.`, "success");

      // Met à jour localement l'événement sans recharger tout
      setEvents(prev => prev.map(e => e.id === parseInt(eventId) ? { ...e, ticketTemplateId: modele.id, ticketHtml: modele.templateHtml } : e));
    } catch {
      Swal.fire("Erreur", "Échec de l'association", "error");
    }
  };

  // ⚡ Dissocier le modèle d'un événement
  const handleDissocier = async (eventId) => {
    const result = await Swal.fire({
      title: "Confirmer la dissociation ?",
      text: "Le billet sera dissocié de l'événement.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/events/${eventId}/template`, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire("Dissocié !", "Le billet a été dissocié.", "success");

      // Met à jour localement l'événement dissocié
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ticketTemplateId: null, ticketHtml: null } : e));
    } catch {
      Swal.fire("Erreur", "Impossible de dissocier le billet.", "error");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <OrganizerLayout>
      <div className="container py-5">

        {/* Modèles */}
        <h2 className="mb-4">📦 Modèles de Billets</h2>
        <div className="row gy-4 mb-5">
          {modeles.map(modele => (
            <div key={modele.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 hover-scale" style={{ cursor: "pointer" }} onClick={() => handleAssocier(modele)}>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{modele.nom}</h5>
                  <div className="card-text mt-2 flex-grow-1 overflow-auto" style={{ fontSize: "0.85rem" }} dangerouslySetInnerHTML={{ __html: modele.templateHtml }} />
                  <div className="mt-3 text-center">
                    <button className="btn btn-primary w-100">
                      <FaLink className="me-2" /> Associer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Événements */}
        <h2 className="mb-4">🎫 Événements & Billets</h2>
        <div className="row gy-4">
          {events.map(event => (
            <div key={event.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 p-3">
                <h5 className="fw-bold">{event.titre}</h5>
                <p className="mb-1"><strong>Date :</strong> {new Date(event.dateDebut).toLocaleDateString()}</p>
                <p className="mb-1"><strong>Adresse :</strong> {event.adresse}</p>

                {event.ticketTemplateId ? (
                  <>
                    <div
                      className="mt-2 border rounded p-2 overflow-auto"
                      style={{ maxHeight: "200px", fontSize: "0.85rem" }}
                      dangerouslySetInnerHTML={{ __html: event.ticketHtml || "Aperçu indisponible" }}
                    />
                    <button
                      className="btn btn-danger w-100 mt-2"
                      onClick={() => handleDissocier(event.id)}
                    >
                      <FaTrashAlt className="me-2" /> Dissocier
                    </button>
                  </>
                ) : (
                  <p className="text-muted fst-italic mt-2">Aucun billet associé</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        .hover-scale:hover { transform: scale(1.03); transition: transform 0.3s; }
      `}</style>
    </OrganizerLayout>
  );
};

export default OrganizerModeleBillets;
