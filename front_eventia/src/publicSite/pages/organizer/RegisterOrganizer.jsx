import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Assure-toi d'importer ça en haut

function RegisterOrganizer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    gouvernorat: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    typeOrganisateur: 'PERSONNE',
    nom: '',
    prenom: '',
    nomSociete: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const gouvernorats = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
    "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
    "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
    "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.gouvernorat) newErrors.gouvernorat = 'Veuillez choisir un gouvernorat.';
    if (!form.email) newErrors.email = 'L’email est requis.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "L'email est invalide.";

    if (!form.password || form.password.length < 6)
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';

    if (!form.telephone || !form.telephone.match(/^[0-9]{8,15}$/))
      newErrors.telephone = 'Téléphone invalide.';

    if (form.typeOrganisateur === 'PERSONNE') {
      if (!form.nom) newErrors.nom = 'Le nom est obligatoire.';
      if (!form.prenom) newErrors.prenom = 'Le prénom est obligatoire.';
    }

    if (form.typeOrganisateur === 'SOCIETE' && !form.nomSociete)
      newErrors.nomSociete = 'Le nom de la société est obligatoire.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        gouvernorat: form.gouvernorat,
        email: form.email,
        password: form.password,
        telephone: form.telephone,
        role: "ORGANIZER",
        statut: "DISABLED",
        typeOrganisateur: form.typeOrganisateur,
        nom: form.typeOrganisateur === 'PERSONNE' ? form.nom : null,
        prenom: form.typeOrganisateur === 'PERSONNE' ? form.prenom : null,
        nomSociete: form.typeOrganisateur === 'SOCIETE' ? form.nomSociete : null,
      };

      const res = await axios.post("http://localhost:8081/api/auth/register", payload);
      setSuccess(res.data || "Inscription réussie ! Vérifiez votre email.");
      setForm({
        gouvernorat: '',
        email: '',
        password: '',
        confirmPassword: '',
        telephone: '',
        typeOrganisateur: 'PERSONNE',
        nom: '',
        prenom: '',
        nomSociete: '',
      });

      setTimeout(() => navigate('/login-organizer'), 4000);
    } catch (error) {
      const backendData = error.response?.data || "Erreur lors de l'inscription.";
      if (typeof backendData === 'string' && backendData.toLowerCase().includes('email')) {
        setErrors({ email: 'Cet email est déjà utilisé.' });
      } else {
        setErrors({ general: backendData });
      }
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 text-center">
              <h1 className="display-4 text-white animate__animated animate__fadeInDown">
                Devenez le maître des événements !
              </h1>
              <p className="fs-5 text-white animate__animated animate__fadeInUp">
                Créez votre compte et accédez à des outils puissants pour piloter vos événements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="card p-4 shadow-lg animate__animated animate__fadeInUp" style={{ borderRadius: '20px', maxWidth: 700, width: '100%' }}>
          <div className="text-center mb-4">
            <div className="avatar-bounce mx-auto" style={{ width: 100, height: 70 }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="organizer-avatar"
                className="rounded-circle border border-3 border-primary"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3 className="fw-bold mt-3">Inscription Organisateur</h3>
          </div>
          {errors.general && <div className="alert alert-danger">{errors.general}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">Type d’organisateur *</label>
                <select
                  name="typeOrganisateur"
                  className={`form-select rounded-pill ${errors.typeOrganisateur ? 'is-invalid' : ''}`}
                  value={form.typeOrganisateur}
                  onChange={handleChange}
                  required
                >
                  <option value="PERSONNE">Personne</option>
                  <option value="SOCIETE">Société</option>
                </select>
                {errors.typeOrganisateur && <div className="text-danger ms-1 mt-1">{errors.typeOrganisateur}</div>}
              </div>

              {form.typeOrganisateur === 'PERSONNE' && (
                <>
                  <div className="col-md-6">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      placeholder="Tapez votre nom"
                      className={`form-control rounded-pill ${errors.nom ? 'is-invalid' : ''}`}
                      value={form.nom}
                      onChange={handleChange}
                      required
                    />
                    {errors.nom && <div className="text-danger ms-1 mt-1">{errors.nom}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Prénom *</label>
                    <input
                      type="text"
                      name="prenom"
                      placeholder="Tapez votre prenom"
                      className={`form-control rounded-pill ${errors.prenom ? 'is-invalid' : ''}`}
                      value={form.prenom}
                      onChange={handleChange}
                      required
                    />
                    {errors.prenom && <div className="text-danger ms-1 mt-1">{errors.prenom}</div>}
                  </div>
                </>
              )}

              {form.typeOrganisateur === 'SOCIETE' && (
                <div className="col-md-6">
                  <label className="form-label">Nom de la société *</label>
                  <input
                    type="text"
                    name="nomSociete"
                    placeholder="Tapez votre nom du societé"
                    className={`form-control rounded-pill ${errors.nomSociete ? 'is-invalid' : ''}`}
                    value={form.nomSociete}
                    onChange={handleChange}
                    required
                  />
                  {errors.nomSociete && <div className="text-danger ms-1 mt-1">{errors.nomSociete}</div>}
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Tapez votre email"
                  className={`form-control rounded-pill ${errors.email ? 'is-invalid' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <div className="text-danger ms-1 mt-1">{errors.email}</div>}
              </div>

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
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword) }}
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
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(!showConfirmPassword) }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Téléphone *</label>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="Tapez votre numéro"
                  className={`form-control rounded-pill ${errors.telephone ? 'is-invalid' : ''}`}
                  value={form.telephone}
                  onChange={handleChange}
                  pattern="[0-9]{8,15}"
                  required
                />
                {errors.telephone && <div className="text-danger ms-1 mt-1">{errors.telephone}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Gouvernorat *</label>
                <select
                  name="gouvernorat"
                  className={`form-control rounded-pill ${errors.gouvernorat ? 'is-invalid' : ''}`}
                  value={form.gouvernorat}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionnez un gouvernorat --</option>
                  {gouvernorats.map((gov, idx) => (
                    <option key={idx} value={gov}>{gov}</option>
                  ))}
                </select>
                {errors.gouvernorat && <div className="text-danger ms-1 mt-1">{errors.gouvernorat}</div>}
              </div>

            </div>

            <div className="d-grid mt-4">
              <button type="submit" className="btn btn-primary rounded-pill py-2">
                S’inscrire
              </button>
            </div>

            <div className="text-center mt-3">
              <small>
                Déjà un compte ?{' '}
                <Link to="/login-organizer" className="text-primary fw-bold">Se connecter</Link>
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterOrganizer;
