import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'animate.css';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaStar } from 'react-icons/fa';

function ProfileParticipant() {
  const [userData, setUserData] = useState(null);
  const [preferencesExist, setPreferencesExist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const gouvernorats = [
    "Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa",
    "Jendouba","Kairouan","Kasserine","Kébili","Le Kef","Mahdia",
    "La Manouba","Médenine","Monastir","Nabeul","Sfax","Sidi Bouzid",
    "Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan"
  ];

  useEffect(() => {
    const fetchUserAndPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get("http://localhost:8081/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(userRes.data);
        setEditData(userRes.data);

        // Vérifier si l’utilisateur a déjà des préférences
        try {
          await axios.get(`http://localhost:8081/preferences/${userRes.data.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPreferencesExist(true);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            setPreferencesExist(false);
          }
        }

      } catch (err) {
        console.error("Erreur lors du chargement du profil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndPreferences();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storageChanged"));
    navigate('/login-participant');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put("http://localhost:8081/users/me", editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
      setShowModal(false);
    } catch (error) {
      console.error("Erreur de mise à jour", error);
    }
  };

  if (loading) return <p className="text-center py-5">Chargement...</p>;

  return (
     <div>
      {/* Hero header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 text-center">
              <h1 className="display-4 text-white animate__animated animate__fadeInDown">Mon Profil</h1>
              <p className="fs-5 text-white animate__animated animate__fadeInUp">Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>
      </div>
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold">Mon Profil</h2>
        {!preferencesExist && (
          <span className="badge bg-warning text-dark fs-6 animate__animated animate__flash">
            Définir vos préférences ! <FaStar className="ms-1"/>
          </span>
        )}
      </div>

      <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: 600, borderRadius: 20 }}>
        <div className="text-center mb-4">
          <FaUserCircle size={80} className="text-primary mb-2"/>
          <h3 className="fw-bold">{userData.prenom} {userData.nom}</h3>
          <p className="text-muted mb-2">Participant EventIA</p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded shadow-sm bg-light text-center">
              <strong>Email</strong>
              <p className="mb-0">{userData.email}</p>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded shadow-sm bg-light text-center">
              <strong>Téléphone</strong>
              <p className="mb-0">{userData.telephone || "-"}</p>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded shadow-sm bg-light text-center">
              <strong>Gouvernorat</strong>
              <p className="mb-0">{userData.gouvernorat || "-"}</p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
          {!preferencesExist && (
            <button className="btn btn-warning rounded-pill px-4" onClick={() => navigate('/preferences')}>
              Définir mes préférences
            </button>
          )}
          <button className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-1" onClick={() => setShowModal(true)}>
            <FaEdit/> Modifier
          </button>
          <button className="btn btn-outline-danger rounded-pill px-4 d-flex align-items-center gap-1" onClick={handleLogout}>
            <FaSignOutAlt/> Déconnexion
          </button>
        </div>
      </div>

      {/* Modal modification */}
      {showModal && (
        <div className="modal d-block animate__animated animate__fadeIn">
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Modifier mes informations</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label>Nom</label>
                  <input type="text" name="nom" className="form-control" value={editData.nom} onChange={handleEditChange} />
                </div>
                <div className="mb-2">
                  <label>Prénom</label>
                  <input type="text" name="prenom" className="form-control" value={editData.prenom} onChange={handleEditChange} />
                </div>
                <div className="mb-2">
                  <label>Email</label>
                  <input type="email" name="email" className="form-control" value={editData.email} disabled />
                </div>
                <div className="mb-2">
                  <label>Téléphone</label>
                  <input type="text" name="telephone" className="form-control" value={editData.telephone} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label>Gouvernorat</label>
                  <select name="gouvernorat" className="form-control rounded-pill" value={editData.gouvernorat} onChange={handleEditChange}>
                    <option value="">-- Sélectionnez un gouvernorat --</option>
                    {gouvernorats.map((gov,i) => <option key={i} value={gov}>{gov}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary rounded-pill" onClick={() => setShowModal(false)}>Annuler</button>
                <button className="btn btn-primary rounded-pill" onClick={handleSaveChanges}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

    </div>
  );
}

export default ProfileParticipant;
