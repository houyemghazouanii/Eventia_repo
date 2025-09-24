import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaEye, FaTrashAlt, FaPlus, FaBan } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "../../../../admin/config/axiosConfig";
import OrganizerLayout from "./OrganizerLayout";
import Search from "../components/Search";

function EventOrganizer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  const userData = localStorage.getItem("user");
  let organizerId = localStorage.getItem("id");
  let token = localStorage.getItem("token");

  if (userData) {
    try {
      const user = JSON.parse(userData);
      organizerId = user.id;
      token = user.token;
    } catch {
      console.error("Erreur parsing user localStorage");
    }
  }

  const fetchEvents = useCallback(async () => {
    if (!organizerId || !token) {
      setErrorMsg("Vous devez être connecté pour voir vos événements.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `/events/users/organizers/${organizerId}/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Impossible de récupérer les événements.");
    } finally {
      setLoading(false);
    }
  }, [organizerId, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]) 

  const filteredEvents = events.filter(
    (event) =>
      event.titre.toLowerCase().includes(search.toLowerCase()) &&
      (selectedStatus === "ALL" || event.statut === selectedStatus)
  );

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (event) => {
    const isDraft = event.statut === "DRAFT";

    const result = await Swal.fire({
      title: isDraft ? "Supprimer l'événement ?" : "Archiver l'événement ?",
      text: isDraft
        ? "Cet événement sera supprimé définitivement."
        : "L'événement ne sera plus visible pour vous, mais restera dans le système.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isDraft ? "Oui, supprimer" : "Oui, archiver",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        if (isDraft) {
          await axios.delete(`/events/organizer/events/${event.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Supprimé !", "L'événement a été supprimé.", "success");
          setEvents((prev) => prev.filter((e) => e.id !== event.id));
        } else {
          await axios.put(`/events/${event.id}/archive`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Archivé !", "L'événement a été archivé.", "success");
          setEvents((prev) =>
            prev.map((e) =>
              e.id === event.id ? { ...e, statut: "ARCHIVED" } : e
            )
          );
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Erreur !", "Une erreur est survenue.", "error");
      }
    }
  };

  const handleCancel = async (event) => {
    const result = await Swal.fire({
      title: "Annulation de l'événement",
      text: "Es-tu sûr de vouloir annuler cet événement ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, annuler",
      cancelButtonText: "Non, annuler"
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        `/events/${event.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Annulé", "L'événement a été annulé avec succès.", "success");
      fetchEvents();
    } catch (error) {
      console.error("Erreur lors de l’annulation :", error);
      let message = "Une erreur est survenue lors de l’annulation.";
      if (error.response && error.response.data) {
        message = error.response.data;
      }
      Swal.fire("Erreur", message, "error");
    }
  };

  return (
    <OrganizerLayout>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold"><i className="bi bi-calendar-event text-success"></i> Mes Événements</h2>
          <Link to="/organizer/addevent" className="btn btn-success rounded-pill">
            <FaPlus className="me-2" /> Ajouter un événement
          </Link>
        </div>

        {loading ? (
          <p>Chargement des événements...</p>
        ) : errorMsg ? (
          <p className="text-danger">{errorMsg}</p>
        ) : (
          <>
            <div className="card">
              <div className="card-body table-responsive">
                <div className="d-flex align-items-center px-4 mb-3 flex-wrap gap-3">
                  <Search search={search} setSearch={setSearch} placeholder="Recherche par titre..." />
                  <div className="d-flex align-items-center">
                    <label htmlFor="statusFilter" className="me-2 fw-bold mb-0">Filtrer par statut</label>
                    <select
                      id="statusFilter"
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="ALL">Tous les statuts</option>
                      <option value="ACTIVE">Actifs</option>
                      <option value="DRAFT">Brouillons</option>
                      <option value="CANCELLED">Annulés</option>
                      <option value="ARCHIVED">Archivés</option>
                    </select>
                  </div>
                </div>

                <table className="table table-bordered table-hover text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Image</th>
                      <th>Titre</th>
                      <th>Description</th>
                      <th>Adresse</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEvents.length > 0 ? (
                      currentEvents.map((event) => (
                        <tr key={event.id}>
                          <td>
                            <img
                              src={
                                event.image
                                  ? `http://localhost:8081/uploads/images/${event.image}`
                                  : "/assets/images/faces/default.jpg"
                              }
                              alt={event.titre}
                              style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                            />
                          </td>
                          <td>{event.titre}</td>
                          <td>{event.description}</td>
                          <td>{event.adresse}</td>
                          <td>
                            <span className={`badge rounded-pill ${
                              event.statut === "ACTIVE"
                                ? "bg-success"
                                : event.statut === "ARCHIVED"
                                ? "bg-secondary"
                                : event.statut === "CANCELLED"
                                ? "bg-danger"
                                : event.statut === "DRAFT"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}>
                              {event.statut}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <Link to={`/organizer/events/view/${event.id}`} className="btn btn-info btn-sm" title="Voir">
                                <FaEye />
                              </Link>
                              <Link to={`/organizer/events/edit/${event.id}`} className="btn btn-warning btn-sm" title="Modifier">
                                <FaEdit />
                              </Link>
                              {(event.statut === "DRAFT" || event.statut === "ACTIVE") ? (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(event)}
                                  title={event.statut === "DRAFT" ? "Supprimer" : "Archiver"}
                                >
                                  <FaTrashAlt />
                                </button>
                              ) : (
                                <button className="btn btn-secondary btn-sm" disabled title="Action indisponible">
                                  <FaTrashAlt />
                                </button>
                              )}
                              {(event.statut === "DRAFT" || event.statut === "ACTIVE") && (
                                <button
                                  className="btn btn-light btn-sm me-2"
                                  onClick={() => handleCancel(event)}
                                  title="Annuler"
                                >
                                  <FaBan />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">Aucun événement trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                            {/* Pagination */}
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <li key={num} className={`page-item ${currentPage === num ? "active" : ""}`}>
                    <button className="page-link" onClick={() => paginate(num)}>
                      {num}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
              </div>
            </div>


          </>
        )}
      </div>
    </OrganizerLayout>
  );
}

export default EventOrganizer;
