import React, { useEffect, useState } from "react";
import axios from "../config/axiosConfig";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const ModeleBilletsList = () => {
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentModele, setCurrentModele] = useState(null);
  const [editNom, setEditNom] = useState("");
  const [editTemplateHtml, setEditTemplateHtml] = useState("");

  const fetchModeles = async () => {
    try {
      const response = await axios.get("/api/modeles-billets");
      setModeles(response.data);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des modèles.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModeles();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirmer la suppression",
      text: "Voulez-vous vraiment supprimer ce modèle ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/modeles-billets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        Swal.fire("Supprimé !", "Le modèle a été supprimé.", "success");
        fetchModeles();
      } catch (error) {
        Swal.fire("Erreur", "La suppression a échoué.", "error");
      }
    }
  };

  const openEditModal = (modele) => {
    setCurrentModele(modele);
    setEditNom(modele.nom);
    setEditTemplateHtml(modele.templateHtml);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editNom || !editTemplateHtml) {
      Swal.fire("Erreur", "Le nom et le template HTML sont obligatoires.", "error");
      return;
    }
    try {
      await axios.put(
        `/api/modeles-billets/${currentModele.id}`,
        {
          nom: editNom,
          templateHtml: editTemplateHtml,
          thumbnailBase64: currentModele.thumbnailBase64,
          defaultParamsJson: currentModele.defaultParamsJson,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      Swal.fire("Succès", "Modèle modifié avec succès.", "success");
      setShowModal(false);
      fetchModeles();
    } catch (error) {
      Swal.fire("Erreur", "Échec de la modification.", "error");
    }
  };

  if (loading) return <p>Chargement des modèles...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
     <div className="container mt-5" style={{ padding: "40px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Liste des modèles de billets</h3>
          <Link to="/admin/modeles-billets/ajouter" className="btn btn-success rounded-pill">
            <FaPlus className="me-2" />Ajouter un modèle
          </Link>
      </div>

      <div className="row g-4">
        {modeles.length === 0 && <p className="text-muted">Aucun modèle trouvé.</p>}

        {modeles.map((modele) => (
          <div key={modele.id} className="col-md-6 col-lg-4">
            <div
              className="ticket-preview"
              style={{
                borderRadius: "20px",
                boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
                overflow: "hidden",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
                height: "400px",
                padding: "15px",
              }}
            >
              {/* ⚡ Affichage exact du template */}
              <div
                style={{
                  flexGrow: 1,
                  overflowY: "auto",
                  padding: "10px",
                  textAlign: "center",
                }}
                dangerouslySetInnerHTML={{ __html: modele.templateHtml }}
              ></div>

              {/* Actions */}
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => openEditModal(modele)}
                >
                  <FaEdit className="me-1" /> Modifier
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(modele.id)}
                >
                  <FaTrash className="me-1" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE MODIFICATION */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Modifier le modèle</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Nom du modèle</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Template HTML</label>
                  <textarea
                    className="form-control"
                    rows={10}
                    value={editTemplateHtml}
                    onChange={(e) => setEditTemplateHtml(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeleBilletsList;
