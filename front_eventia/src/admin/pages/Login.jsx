import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css"; // ton fichier CSS avec les styles

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Connexion réussie :", data);

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("nom", data.nom);
        localStorage.setItem("prenom", data.prenom);
        localStorage.setItem("email", data.email);

        navigate("/admin/dashboard");
      } else {
        const errorText = await res.text();
        console.error("Erreur :", errorText);
        alert("Email ou mot de passe invalide.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="container px-4 py-5 mx-auto">
      <div className="card card0">
        <div className="d-flex flex-lg-row flex-column-reverse">
          <div className="card card1">
            <div className="row justify-content-center my-auto">
              <div className="col-md-8 col-10 my-5">
                <div className="row justify-content-center px-3 mb-3">
                 
                </div>
                <h3 className="mb-5 text-center heading">EventIA Admin</h3>
                <h6 className="msg-info">Veuillez vous connecter à votre compte</h6>
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-control-label text-muted">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Tapez votre mail"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-control-label text-muted">Mot de passe</label>
                    <input
                      type="password"
                      id="psw"
                      name="psw"
                      placeholder="Tapez votre mot de passe"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row justify-content-center my-3 px-3">
                    <button type="submit" className="btn-block btn-color">
                      Connexion
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="card card2">
            <div className="my-auto mx-md-5 px-md-5 right">
              <h3 className="text-white">EventIA : Gérez vos événements facilement</h3>
              <small className="text-white">
                Une plateforme intelligente pour la gestion des événements avec recommandations
                personnalisées, QR codes, IA et plus encore.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
