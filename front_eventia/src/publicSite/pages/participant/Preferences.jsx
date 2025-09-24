import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaMusic,
  FaFutbol,
  FaGuitar,
  FaChalkboardTeacher,
  FaCampground,
  FaTools,
  FaGraduationCap,
  FaEllipsisH,
  FaCheckCircle
} from "react-icons/fa";
import 'animate.css';

export default function PreferencesFinal() {
  const participantId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [preferences, setPreferences] = useState({
    categories: [], // maintenant un tableau
    budget: "Gratuit",
    localisation: ""
  });
  const [loading, setLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [prefCreated, setPrefCreated] = useState(false);

  const categories = [
    { nom: "MUSIC", color: "primary", icon: <FaMusic size={24} /> },
    { nom: "SPORT", color: "success", icon: <FaFutbol size={24} /> },
    { nom: "FESTIVAL", color: "danger", icon: <FaGuitar size={24} /> },
    { nom: "TRAINING", color: "info", icon: <FaGraduationCap size={24} /> },
    { nom: "CAMPING", color: "warning", icon: <FaCampground size={24} /> },
    { nom: "CONFERENCE", color: "secondary", icon: <FaChalkboardTeacher size={24} /> },
    { nom: "WORKSHOP", color: "dark", icon: <FaTools size={24} /> },
    { nom: "OTHER", color: "muted", icon: <FaEllipsisH size={24} /> }
  ];


  useEffect(() => {
    if (!participantId || !token) {
      Swal.fire("Erreur", "Veuillez vous connecter.", "error");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8081/preferences/${participantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (res.data && res.data.id) {
          // Gère la chaîne de catégories renvoyée par le backend
          const savedCategories = res.data.categorie ? res.data.categorie.split(',') : [];
          setPreferences({
            categories: savedCategories,
            budget: res.data.budget || "Gratuit",
            localisation: res.data.localisation || ""
          });
          setIsDisabled(true);
          setPrefCreated(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [participantId, token]);

  const handleCategoryClick = (cat) => {
    if (isDisabled) return;
    setPreferences(prev => {
      const newCats = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: newCats };
    });
  };

 

  const handleSubmit = () => {
    if (preferences.categories.length === 0 || !preferences.budget || !preferences.localisation) {
      Swal.fire("Attention", "Veuillez compléter toutes les options.", "warning");
      return;
    }

    // Crée l'objet à envoyer en joignant les catégories en une seule chaîne
    const dataToSend = {
      categorie: preferences.categories.join(','), 
      budget: preferences.budget,
      localisation: preferences.localisation
    };

    axios
      .post(`http://localhost:8081/preferences/${participantId}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        Swal.fire("Succès", "Préférences enregistrées.", "success");
        setIsDisabled(true);
        setPrefCreated(true);
      })
      .catch(() => {
        Swal.fire("Erreur", "Impossible d'enregistrer vos préférences.", "error");
      });
  };

  if (loading) return <p className="text-center py-5">Chargement...</p>;

  return (
    <div>
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 text-center">
              <h1 className="display-4 text-white animate__animated animate__fadeInDown">Mes Préférences</h1>
              <p className="fs-5 text-white animate__animated animate__fadeInUp">
                Définissez vos préférences pour que nous vous recommandions les meilleurs événements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {prefCreated && (
          <div className="text-center mb-4 animate__animated animate__bounceIn">
            <FaCheckCircle className="text-success me-2" /> 
            <span className="fw-bold fs-5">Préférences créées ✅</span>
          </div>
        )}

        <h2 className="text-center mb-5">Définissez vos préférences</h2>

        <div className="row justify-content-center mb-4">
          {categories.map((cat) => (
            <div key={cat.nom} className="col-md-2 mb-3">
              <div
                className={`card text-center shadow-sm ${
                  preferences.categories.includes(cat.nom) ? "border-3 border-" + cat.color : ""
                }`}
                style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                onClick={() => handleCategoryClick(cat.nom)}
              >
                <div className={`card-body text-${cat.color}`}>
                  <div className="mb-2">{cat.icon}</div>
                  <h6 className="card-title">{cat.nom}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>

       

        <div className="row justify-content-center mb-4">
         
        </div>

        <div className="text-center">
          <button
            className="btn btn-lg btn-primary"
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {isDisabled ? "Préférences enregistrées" : "Enregistrer mes préférences"}
          </button>
        </div>

        <div className="mt-5 text-center">
          <h5>Résumé de vos préférences :</h5>
          <p>
            <strong>Catégories :</strong> {preferences.categories.length > 0 ? preferences.categories.join(", ") : "Aucune"} |{" "}
            <strong>Budget :</strong> {preferences.budget || "Aucun"} |{" "}
            <strong>Localisation :</strong> {preferences.localisation || "Aucune"}
          </p>
        </div>
      </div>
    </div>
  );
}