import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { FaEdit, FaEye, FaTrashAlt, FaPlus, FaBan, FaLock, FaUnlock } from "react-icons/fa";
import Swal from 'sweetalert2';
import axios from '../config/axiosConfig';
import Search from '../components/Search';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(5);

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const result = await axios.get("/users");
        const organizersOnly = result.data.filter(user => user.role === 'ORGANIZER');
        setOrganizers(organizersOnly);
      } catch (error) {
        console.error("Erreur lors du chargement des organisateurs :", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger la liste des organisateurs.',
        });
      }
    };
    fetchOrganizers();
  }, []);

  const loadEvents = async (organizerId) => {
    try {
      let eventsData = [];
      if (organizerId !== "") {
        const response = await axios.get(`/events/users/organizers/${organizerId}/events`);
        eventsData = response.data || [];
      } else {
        const response = await axios.get("/events");
        eventsData = response.data;
      }
      setEvents(eventsData);
      setCurrentPage(1); // Reset page on filter change
    } catch (error) {
      console.error("Erreur chargement events:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de chargement',
        text: 'Impossible de charger les événements. Veuillez réessayer.',
      });
      setEvents([]);
    }
  };

  useEffect(() => {
    loadEvents(selectedOrganizerId);
  }, [selectedOrganizerId]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/events/${id}`);
        Swal.fire('Supprimé !', 'L\'événement a été supprimé.', 'success');
        loadEvents(selectedOrganizerId);
      } catch (error) {
        console.error("Erreur suppression event:", error);
        Swal.fire('Erreur!', 'Une erreur est survenue lors de la suppression.', 'error');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/events/admin/events/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("Succès", "Événement approuvé", "success");
      loadEvents(selectedOrganizerId);
    } catch (error) {
      console.error("Erreur validation:", error);
      Swal.fire("Erreur", "Impossible de valider l'événement.", "error");
    }
  };

  const handleToggleArchive = async (event) => {
    const isArchived = event.statut === "ARCHIVED";
    const confirmation = await Swal.fire({
      title: isArchived ? "Réactiver l'événement" : "Archiver l'événement",
      text: isArchived ? "Voulez-vous vraiment réactiver cet événement ?" : "Voulez-vous vraiment archiver cet événement ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isArchived ? "Réactiver" : "Archiver",
      cancelButtonText: "Annuler"
    });

    if (!confirmation.isConfirmed) return;

    try {
      await axios.put(`/events/${event.id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("Succès", `L'événement a été ${isArchived ? 'réactivé' : 'archivé'}.`, "success");
      loadEvents(selectedOrganizerId);
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      Swal.fire("Erreur", "Impossible de changer le statut de l'événement.", "error");
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
      await axios.put(`/events/${event.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("Annulé", "L'événement a été annulé avec succès.", "success");
      loadEvents(selectedOrganizerId);
    } catch (error) {
      console.error("Erreur lors de l’annulation :", error);
      let message = "Une erreur est survenue lors de l’annulation.";
      if (error.response && error.response.data) message = error.response.data;
      Swal.fire("Erreur", message, "error");
    }
  };

  // Filtrage et pagination
  const selectedOrganizer = organizers.find(org => org.id === parseInt(selectedOrganizerId));
  const filteredEvents = events.filter(event =>
    event.titre.toLowerCase().includes(search.toLowerCase()) &&
    (selectedStatus === "ALL" || event.statut === selectedStatus)
  );

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container" style={{ paddingTop: '80px' }}>
      <div className="page-inner">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Les événements</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><Link to="/admin/">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Événements</li>
            </ol>
          </nav>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title">
                  Liste des événements
                  {selectedOrganizerId && selectedOrganizer && (
                    <> (pour Organisateur : {selectedOrganizer.typeOrganisateur === 'PERSONNE' ? `${selectedOrganizer.nom} ${selectedOrganizer.prenom}` : selectedOrganizer.nomSociete})</>
                  )}
                </h4>
                <Link to="/admin/add-events" className="btn btn-success rounded-pill">
                  <FaPlus className="me-2" /> Ajouter un événement
                </Link>
              </div>

              <div className="d-flex align-items-center px-4 mb-3 flex-wrap gap-3">
                <Search search={search} setSearch={setSearch} placeholder="Recherche par titre..." />
                <div className="d-flex align-items-center">
                  <label htmlFor="organizerFilter" className="me-2 fw-bold mb-0">Filtrer par organisateur</label>
                  <select
                    id="organizerFilter"
                    className="form-select me-3"
                    style={{ minWidth: "200px" }}
                    value={selectedOrganizerId}
                    onChange={(e) => setSelectedOrganizerId(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="">-- Tous les organisateurs --</option>
                    {organizers.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.typeOrganisateur === "PERSONNE" ? `${org.nom} ${org.prenom}` : org.nomSociete}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-flex align-items-center">
                  <label htmlFor="statusFilter" className="me-2 fw-bold mb-0">Statut</label>
                  <select
                    id="statusFilter"
                    className="form-select"
                    style={{ minWidth: "150px" }}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="ALL">Tous</option>
                    <option value="ACTIVE">Actifs</option>
                    <option value="DRAFT">Brouillons</option>
                    <option value="CANCELLED">Annulés</option>
                    <option value="ARCHIVED">Archivés</option>
                  </select>
                </div>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-lg text-center">
                    <thead>
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
                        currentEvents.map(event => (
                          <tr key={event.id}>
                            <td>
                              <img
                                src={event.image ? `http://localhost:8081/uploads/images/${event.image}` : "/assets/images/faces/default.jpg"}
                                alt={`Image de ${event.titre}`}
                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                              />
                            </td>
                            <td>{event.titre}</td>
                            <td>{event.description}</td>
                            <td>{event.adresse}</td>
                            <td>
                              <span className={`badge rounded-pill ${
                                event.statut === "ACTIVE" ? "bg-success"
                                : event.statut === "ARCHIVED" ? "bg-secondary"
                                : event.statut === "CANCELLED" ? "bg-danger"
                                : event.statut === "DRAFT" ? "bg-warning text-dark"
                                : "bg-secondary"
                              }`}>{event.statut}</span>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center flex-wrap gap-2">
                                <Link to={`/admin/events/view/${event.id}`} className="btn btn-info btn-sm d-flex align-items-center justify-content-center" title="Voir" style={{ width: "42px", height: "42px" }}><FaEye size="1.2em" /></Link>
                                <Link to={`/admin/events/edit/${event.id}`} className="btn btn-warning btn-sm d-flex align-items-center justify-content-center" title="Modifier" style={{ width: "42px", height: "42px" }}><FaEdit size="1.2em" /></Link>
                                <button className="btn btn-danger btn-sm d-flex align-items-center justify-content-center" onClick={() => handleDelete(event.id)} title="Supprimer" style={{ width: "42px", height: "42px" }}><FaTrashAlt size="1.2em" /></button>
                                {event.statut === "DRAFT" && <button className="btn btn-success btn-sm d-flex align-items-center justify-content-center" onClick={() => handleApprove(event.id)} title="Valider" style={{ width: "42px", height: "42px" }}>✅</button>}
                                {(event.statut === "DRAFT" || event.statut === "ACTIVE") && <button className="btn btn-secondary btn-sm d-flex align-items-center justify-content-center" onClick={() => handleCancel(event)} title="Annuler" style={{ width: "42px", height: "42px" }}><FaBan size="1.2em" /></button>}
                                {(event.statut === "ACTIVE" || event.statut === "ARCHIVED") && <button className={`btn btn-sm d-flex align-items-center justify-content-center`} onClick={() => handleToggleArchive(event)} title={event.statut === "ARCHIVED" ? "Réactiver" : "Archiver"} style={{ width: "42px", height: "42px", backgroundColor: event.statut === "ARCHIVED" ? "#28a745" : "#343a40", color: "white", border: "none" }}>{event.statut === "ARCHIVED" ? <FaUnlock size="1.2em" /> : <FaLock size="1.2em" />}</button>}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6" className="text-center">Aucun événement trouvé.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav>
                    <ul className="pagination justify-content-center mt-3">
                      {[...Array(totalPages)].map((_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                          <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
