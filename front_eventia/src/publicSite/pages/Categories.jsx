import React from "react";
import { Link } from "react-router-dom";

function Categories({ showHeader = true }) {
  const eventTypes = [
    { type: "MUSIC", title: "Musique", icon: "fa-music", description: "Événements musicaux et concerts." },
    { type: "SPORT", title: "Sport", icon: "fa-football-ball", description: "Compétitions et activités sportives." },
    { type: "FESTIVAL", title: "Festival", icon: "fa-theater-masks", description: "Festivals culturels et artistiques." },
    { type: "TRAINING", title: "Formation", icon: "fa-chalkboard-teacher", description: "Sessions de formation et ateliers." },
    { type: "CAMPING", title: "Camping", icon: "fa-campground", description: "Sorties et activités en plein air." },
    { type: "CONFERENCE", title: "Conférence", icon: "fa-users", description: "Conférences et séminaires professionnels." },
    { type: "WORKSHOP", title: "Atelier", icon: "fa-tools", description: "Ateliers pratiques et participatifs." },
    { type: "OTHER", title: "Autre", icon: "fa-ellipsis-h", description: "Autres types d'événements divers." },
  ];

  return (
    <div>
      {showHeader && (
        <div className="container-fluid bg-primary py-5 mb-5 hero-header">
          <div className="container py-2">
            <div className="row justify-content-center py-3">
              <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
                <h1 className="display-3 text-white animated slideInDown">Catégories</h1>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb justify-content-center">
                    <li className="breadcrumb-item">
                      <Link to="/">Accueil</Link>
                    </li>
                    <li className="breadcrumb-item text-white active" aria-current="page">
                      Catégories
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Start */}
      <div className="container-xxl py-5">
       <div className="container">
        <div
          className="text-center wow fadeInUp"
          style={{ animationDelay: '0s', visibility: 'visible' }}>
          <h6 className="section-title bg-white text-center text-primary px-3">Catégories</h6>
          <h1 className="mb-5">Nos Catégories</h1>
        </div>

        <div className="row g-4">
          {eventTypes.map(({ type, title, icon, description }, index) => (
            <div
              key={type}
              className="col-lg-3 col-sm-6 wow fadeInUp"
              data-wow-delay={`${0.1 + index * 0.2}s`}
            >
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className={`fa fa-3x ${icon} text-primary mb-4`} />
                  <h5>{title}</h5>
                  <p>{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

            </div>
      {/* Categories End */}
    </div>
  );
}

export default Categories;
