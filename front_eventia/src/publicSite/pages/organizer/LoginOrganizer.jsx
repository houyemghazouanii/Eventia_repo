import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'animate.css';
import './LoginOrganizer.css';

function LoginOrganizer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [erreur, setErreur] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      const res = await axios.post("http://localhost:8081/api/auth/login", { email, password });

      if (res.data.role !== "ORGANIZER") {
        setErreur("Accès réservé aux organisateurs uniquement.");
        return;
      }
      localStorage.setItem("id", res.data.id);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      
      navigate("/organizer/dashboard");
    } catch (err) {
      setErreur("Identifiants incorrects ou compte non vérifié.");
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 text-center">
              <h1 className="display-4 text-white animate__animated animate__fadeInDown">
                Espace Organisateur
              </h1>
              <p className="fs-5 text-white animate__animated animate__fadeInUp">
                Accédez à votre espace pour gérer vos événements sur EventIA.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="card p-4 shadow-lg animate__animated animate__fadeInUp" style={{ borderRadius: '20px', maxWidth: 500, width: '100%' }}>
          <div className="text-center mb-4">
            <div className="avatar-bounce">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="organizer-avatar"
                className="rounded-circle border border-3 border-primary avatar-img"
              />
            </div>
            <h3 className="fw-bold mt-3">Connexion Organisateur</h3>
            <p className="text-muted">Bienvenue dans votre espace pro !</p>
          </div>

          {erreur && <div className="alert alert-danger">{erreur}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Adresse e-mail</label>
              <input
                type="email"
                className="form-control rounded-pill"
                placeholder="organisateur@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required />
            </div>

            {/* Champ mot de passe avec icône */}
            <div className="mb-3" style={{ position: 'relative' }}>
              <label className="form-label">Mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control rounded-pill pe-5"
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
              <button type="submit" className="btn btn-primary rounded-pill py-2">
                Se connecter
              </button>
            </div>

            <div className="text-center mt-3">
              <small>
                Pas encore de compte ?{" "}
                <Link to="/register-organizer" className="text-primary fw-bold">
                  S’inscrire
                </Link>
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginOrganizer;
