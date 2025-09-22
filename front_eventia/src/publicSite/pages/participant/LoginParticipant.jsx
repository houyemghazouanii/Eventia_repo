import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'animate.css';

function LoginParticipant() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      const res = await axios.post("http://localhost:8081/api/auth/login", { email, password });

      if (res.data.role !== "USER") {
        setErreur("Accès réservé aux participants uniquement.");
        return;
      }
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("prenom", res.data.prenom);
      localStorage.setItem("nom", res.data.nom);
      localStorage.setItem("email", res.data.email);
      
      window.dispatchEvent(new Event("storageChanged"));

      navigate("/profile-participant");
      window.location.reload(); // Recharge la page pour mettre à jour le Header
    } catch (err) {
      if (err.response?.data?.message) {
        setErreur(err.response.data.message);
      } else {
        setErreur("Identifiants incorrects ou compte non vérifié.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  return (
    <div>
      {/* Hero animé */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 text-center">
              <h1 className="display-4 text-white animate__animated animate__fadeInDown">
                Connexion Participant
              </h1>
              <p className="fs-5 text-white animate__animated animate__fadeInUp">
                Accédez à des centaines d’événements à travers la Tunisie.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire animé */}
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <div className="card shadow-lg p-4 animate__animated animate__zoomIn" style={{ maxWidth: 500, width: '100%', borderRadius: '12px' }}>
          <div className="text-center mb-4">
            <i className="fa fa-user-circle fa-3x text-primary mb-2"></i>
            <h3 className="fw-bold">Bienvenue sur EventIA</h3>
            <p className="text-muted small">Connectez-vous pour réserver vos événements préférés.</p>
          </div>

          {erreur && <div className="alert alert-danger py-2">{erreur}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Adresse e-mail</label>
              <input
                type="email"
                className="form-control"
                placeholder="participant@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
            </div>

            {/* Champ mot de passe avec icône */}
            <div className="mb-3" style={{ position: 'relative' }}>
              <label className="form-label">Mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pe-5"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '65%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary py-2">
                Se connecter
              </button>
            </div>

            <div className="text-center mt-3">
              <small>
                Pas encore de compte ?{" "}
                <Link to="/register-participant" className="text-primary fw-bold">
                  Créer un compte
                </Link>
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginParticipant;
