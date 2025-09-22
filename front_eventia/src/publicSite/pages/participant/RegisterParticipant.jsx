import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './RegisterParticipant.css'; // on importe le style personnalisé

function RegisterParticipant() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    gouvernorat: '',
    nom: '',
    prenom: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};
    if (!form.nom) newErrors.nom = 'Le nom est requis.';
    if (!form.prenom) newErrors.prenom = 'Le prénom est requis.';
    if (!form.email) newErrors.email = 'L’email est requis.';
    if (!form.password || form.password.length < 6) newErrors.password = 'Mot de passe trop court (min 6 caractères).';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    if (!form.telephone.match(/^[0-9]{8,15}$/)) newErrors.telephone = 'Téléphone invalide.';
    if (!form.gouvernorat) newErrors.gouvernorat = 'Veuillez choisir un gouvernorat.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        ...form,
        role: 'USER',
        statut: 'DISABLED'
      };
      delete payload.confirmPassword;

      const res = await axios.post('http://localhost:8081/api/auth/register', payload);
      setSuccessMessage(res.data);

      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        telephone: '',
        gouvernorat: '',
        nom: '',
        prenom: ''
      });
    } catch (err) {
      const backendData = err.response?.data;
      const newErr = {};

      if (typeof backendData === 'string' && backendData.toLowerCase().includes('email')) {
        newErr.email = 'Cet email est déjà utilisé.';
      } else if (typeof backendData === 'string') {
        newErr.general = backendData;
      } else {
        newErr.general = "Erreur lors de l'inscription.";
      }
      setErrors(newErr);
    }
  };

  const gouvernorats = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
    "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
    "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
    "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  return (
    <div>
      {/* Hero */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 text-center">
              <h1 className="display-4 text-white animate__animated animate__fadeInDown">
                Inscription Participant
              </h1>
              <p className="fs-5 text-white animate__animated animate__fadeInUp">
                Créez votre compte pour réserver et participer à vos événements préférés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <div className="card shadow-lg p-4 animate__animated animate__zoomIn" style={{ maxWidth: 600, width: '100%', borderRadius: '20px' }}>
          <div className="text-center mb-4">
            <i className="fa fa-user-plus fa-2x text-primary mb-3"></i>
            <h3 className="fw-bold">Créer un compte EventIA</h3>
            <p className="text-muted">Remplissez vos informations pour commencer.</p>
          </div>

          {errors.general && <div className="text-danger text-center mb-2">{errors.general}</div>}

          {successMessage ? (
            <div className="alert alert-success text-center">
              {successMessage} <br />
              <Link to="/login-participant" className="fw-bold text-primary">
                Cliquez ici pour vous connecter
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <input type="text" name="nom" value={form.nom} onChange={handleChange}
                    className={`form-control ${errors.nom ? 'is-invalid' : ''}`} placeholder="Nom" />
                  {errors.nom && <div className="text-danger ms-1 mt-1">{errors.nom}</div>}
                </div>
                <div className="col-md-6">
                  <input type="text" name="prenom" value={form.prenom} onChange={handleChange}
                    className={`form-control ${errors.prenom ? 'is-invalid' : ''}`} placeholder="Prénom" />
                  {errors.prenom && <div className="text-danger ms-1 mt-1">{errors.prenom}</div>}
                </div>
                <div className="col-md-6">
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="Email" />
                  {errors.email && <div className="text-danger ms-1 mt-1">{errors.email}</div>}
                </div>
                {/* Password */}
              <div className="col-md-6">
                <label className="visually-hidden">Mot de passe</label>
                <div className={`input-with-icon ${errors.password ? 'is-invalid' : ''}`}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mot de passe"
                    className={errors.password ? 'is-invalid' : ''}
                    minLength={6}
                    required
                  />
                  <div
                    className="input-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword)}}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </div>

              <div className="col-md-6">
                <label className="visually-hidden">Confirmer mot de passe</label>
                <div className={`input-with-icon ${errors.confirmPassword ? 'is-invalid' : ''}`}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmer mot de passe"
                    className={errors.confirmPassword ? 'is-invalid' : ''}
                    required
                  />
                  <div
                    className="input-icon-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(!showConfirmPassword)}}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
              </div>

                <div className="col-md-6">
                  <input type="text" name="telephone" value={form.telephone} onChange={handleChange}
                    className={`form-control ${errors.telephone ? 'is-invalid' : ''}`} placeholder="Téléphone" />
                  {errors.telephone && <div className="text-danger ms-1 mt-1">{errors.telephone}</div>}
                </div>
                <div className="col-md-6">
                  <select name="gouvernorat" value={form.gouvernorat} onChange={handleChange}
                    className={`form-select ${errors.gouvernorat ? 'is-invalid' : ''}`}>
                    <option value="">-- Sélectionnez un gouvernorat --</option>
                    {gouvernorats.map((gov, index) => (
                      <option key={index} value={gov}>{gov}</option>
                    ))}
                  </select>
                  {errors.gouvernorat && <div className="text-danger ms-1 mt-1">{errors.gouvernorat}</div>}
                </div>
                <div className="col-12 d-grid mt-3">
                  <button type="submit" className="btn btn-primary rounded-pill py-2">S'inscrire</button>
                </div>
              </div>
            </form>
          )}

          <div className="text-center mt-3">
            <small>
              Vous avez déjà un compte ?{' '}
              <Link to="/login-participant" className="text-primary fw-bold">
                Se connecter
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterParticipant;
