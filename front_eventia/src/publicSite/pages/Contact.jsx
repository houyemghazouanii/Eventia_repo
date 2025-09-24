import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Contact() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8081/api/contact/send", formData);
      Swal.fire({
        icon: "success",
        title: "Message envoyé !",
        text: "Nous avons bien reçu votre message, nous vous répondrons bientôt.",
      });
      setFormData({ nom: "", email: "", sujet: "", message: "" });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible d'envoyer le message. Veuillez réessayer plus tard.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-2">
          <div className="row justify-content-center py-3">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Contactez-nous
              </h1>
              <p className="text-white mt-3">
                Pour toute question ou demande, envoyez-nous un message et notre équipe vous répondra rapidement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h6 className="section-title bg-white text-primary px-3">
              Contact
            </h6>
            <h1>Envoyez-nous un message</h1>
          </div>

          <div className="row g-4">
            {/* Coordonnées */}
            <div className="col-lg-4 col-md-6">
              <div className="bg-light rounded p-4 shadow-sm h-100">
                <h5 className="mb-3">Nos coordonnées</h5>
                <p><i className="fa fa-map-marker-alt me-2"></i>Tunis, Tunisie</p>
                <p><i className="fa fa-phone-alt me-2"></i>+216 12 345 678</p>
                <p><i className="fa fa-envelope me-2"></i>support@eventia.com</p>

                <div className="mt-4 rounded overflow-hidden" style={{height: 200}}>
                  <iframe
                    className="w-100 h-100 border-0"
                    title="Carte de localisation de l'événement"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52479.227980152206!2d10.121088!3d36.806496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd3377a1f1d2e9%3A0x96b95d6a05c1e5e2!2sTunis%2C%20Tunisie!5e0!3m2!1sfr!2stn!4v1692274838285!5m2!1sfr!2stn"
                    allowFullScreen=""
                    aria-hidden="false"
                    tabIndex={0}
                  />
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="col-lg-8 col-md-12">
              <div className="bg-light rounded p-4 shadow-sm">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="nom"
                        className="form-control"
                        placeholder="Votre nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Votre email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <input
                        type="text"
                        name="sujet"
                        className="form-control"
                        placeholder="Objet"
                        value={formData.sujet}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <textarea
                        name="message"
                        className="form-control"
                        placeholder="Votre message"
                        style={{ height: 150 }}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-3"
                        disabled={loading}
                      >
                        {loading ? "Envoi..." : "Envoyer le message"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
