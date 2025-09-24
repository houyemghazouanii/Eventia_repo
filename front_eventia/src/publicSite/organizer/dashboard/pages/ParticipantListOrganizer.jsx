import React, { useEffect, useState, useCallback } from "react";
import { FaEye, FaFileExcel, FaFilePdf } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "../../../../admin/config/axiosConfig";
import OrganizerLayout from "./OrganizerLayout";
import Search from "../components/Search";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ParticipantsOrganizer() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const organizerId = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fonction stable pour fetch
  const fetchParticipants = useCallback(async () => {
    try {
      const response = await axios.get(`/users/${organizerId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParticipants(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Impossible de récupérer les participants.");
    } finally {
      setLoading(false);
    }
  }, [organizerId, token]);

  useEffect(() => {
    if (!organizerId || !token || role !== "ORGANIZER") {
      setErrorMsg("Vous devez être connecté pour voir vos participants.");
      setLoading(false);
      return;
    }
    fetchParticipants();
  }, [fetchParticipants, organizerId, token, role]);

  // Filtrage
  const filteredParticipants = participants.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.prenom.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.titreEvent.toLowerCase().includes(search.toLowerCase())
  );

  // Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredParticipants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    XLSX.writeFile(workbook, "participants.xlsx");
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Participants", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [["Nom", "Prénom", "Email", "Téléphone", "Événement", "Date Début"]],
      body: filteredParticipants.map((p) => [
        p.nom,
        p.prenom,
        p.email,
        p.telephone,
        p.titreEvent,
        p.dateDebut,
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    });

    doc.save("participants.pdf");
  };

  return (
    <OrganizerLayout>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="fw-bold">
            <i className="bi bi-people text-success"></i> Mes Participants
          </h2>
          <div className="d-flex gap-2">
            <button
              onClick={exportToExcel}
              className="btn btn-success d-flex align-items-center gap-1"
            >
              <FaFileExcel /> Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="btn btn-danger d-flex align-items-center gap-1"
            >
              <FaFilePdf /> Export PDF
            </button>
          </div>
        </div>

        <div className="mb-3">
          <Search
            search={search}
            setSearch={setSearch}
            placeholder="Recherche par nom, prénom, email ou événement..."
          />
        </div>

        {loading ? (
          <p>Chargement des participants...</p>
        ) : errorMsg ? (
          <p className="text-danger">{errorMsg}</p>
        ) : filteredParticipants.length === 0 ? (
          <p className="text-muted">Aucun participant trouvé.</p>
        ) : (
          <div className="row g-3">
            {filteredParticipants.map((p) => (
              <div key={`${p.participantId}-${p.eventId}`} className="col-md-6 col-lg-4">
                <div className="card shadow-sm p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{p.nom} {p.prenom}</h5>
                    <span className="badge bg-primary">{p.titreEvent}</span>
                  </div>
                  
                  <p className="mb-1"><strong>Date Début:</strong> {p.dateDebut}</p>
                  <button
                    className="btn btn-info btn-sm mt-2"
                    onClick={() =>
                      Swal.fire({
                        title: `${p.nom} ${p.prenom}`,
                        html: `<p>Email: ${p.email}</p>
                               <p>Téléphone: ${p.telephone}</p>
                               <p>Événement: ${p.titreEvent}</p>
                               <p>Date Début: ${p.dateDebut}</p>`,
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
    </OrganizerLayout>
  );
}
