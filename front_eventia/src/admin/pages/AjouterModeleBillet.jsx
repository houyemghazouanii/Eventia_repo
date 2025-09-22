import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axiosConfig";
import Swal from "sweetalert2";

const AjouterModeleBillet = () => {
  const [nom, setNom] = useState("");
  const [templateHtml, setTemplateHtml] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom || !templateHtml) {
      Swal.fire("Erreur", "Veuillez renseigner le nom et le template HTML.", "error");
      return;
    }

    try {
      const templateObj = { nom, templateHtml };
      const formData = new FormData();
      formData.append("template", JSON.stringify(templateObj));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post("/api/modeles-billets", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Succès", "Modèle de billet créé avec succès.", "success");
      navigate("/admin/modeles-billets");
    } catch (error) {
      console.error("Erreur création modèle :", error);
      Swal.fire("Erreur", "Une erreur est survenue lors de la création.", "error");
    }
  };

  return (
     <div className="container mt-5" style={{ padding: "80px 180px" }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: "700px" }}>
        <div className="card-header bg-primary text-white text-center rounded-top-4">
          <h3 className="mb-0">Créer un modèle de billet</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Nom du modèle */}
            <div className="mb-4">
              <label htmlFor="nom" className="form-label fw-bold">
                Nom du modèle
              </label>
              <input
                type="text"
                id="nom"
                className="form-control form-control-lg"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Exemple : Modèle Classique"
                required
              />
            </div>

            {/* Template HTML */}
            <div className="mb-4">
              <label htmlFor="templateHtml" className="form-label fw-bold">
                Template HTML
              </label>
              <textarea
                id="templateHtml"
                className="form-control"
                rows="8"
                style={{ fontFamily: "monospace" }}
                value={templateHtml}
                onChange={(e) => setTemplateHtml(e.target.value)}
                placeholder="Collez ici le code HTML de votre modèle"
                required
              />
            </div>

           

            {/* Bouton */}
            <div className="text-center">
              <button type="submit" className="btn btn-primary btn-lg px-5">
                Créer le modèle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjouterModeleBillet;
