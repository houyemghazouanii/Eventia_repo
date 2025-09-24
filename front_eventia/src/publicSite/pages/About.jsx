import React from 'react';
import { Link } from "react-router-dom";

function About() {
  return (
    <div>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-2">
          <div className="row justify-content-center py-3">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                À propos de nous
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                   <Link to="/" >Accueil</Link>
                  </li>
                  <li
                    className="breadcrumb-item text-white active"
                    aria-current="page"
                  >
                    À propos
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div
              className="col-lg-6 wow fadeInUp"
              data-wow-delay="0.1s"
              style={{ minHeight: 400 }}
            >
              <div className="position-relative h-100">
                <img
                  className="img-fluid position-absolute w-100 h-100"
                src="/publicSite/assets/img/bg_event.jpg"
                  alt="About EventIA"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <h6 className="section-title bg-white text-start text-primary pe-3">
                Qui sommes-nous ?
              </h6>
              <h1 className="mb-4">
                Bienvenue sur <span className="text-primary">EventIA</span>
              </h1>
              <p className="mb-4">
                EventIA est une plateforme intelligente dédiée à la gestion et à
                l’organisation d’événements. Que vous soyez un participant ou un
                organisateur, nous vous offrons des outils modernes pour vivre une
                expérience événementielle inoubliable.
              </p>
              <p className="mb-4">
                Grâce à des fonctionnalités avancées telles que la gestion des
                inscriptions, le suivi en temps réel et l’intelligence artificielle
                pour la recommandation d’événements, EventIA transforme la façon
                dont vous concevez et vivez vos événements.
              </p>
              <div className="row gy-2 gx-4 mb-4">
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Gestion intelligente d’événements
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Inscriptions en ligne simplifiées
                  </p>
                </div>
                <div className="col-sm-6">
                <p className="mb-0">
                  <i className="fa fa-arrow-right text-primary me-2" />
                  Espace organisateur dédié
                </p>
              </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Interface moderne & responsive
                  </p>
                </div>
                 <div className="col-sm-6">
                    <p className="mb-0">
                      <i className="fa fa-arrow-right text-primary me-2" />
                      Notifications & rappels
                    </p>
                  </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Support 24h/24 et 7j/7
                  </p>
                </div>
              </div>
              <a className="btn btn-primary py-3 px-5 mt-2" href="/events">
                Découvrir nos événements
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

    
    </div>
  );
}

export default About;
