import React from 'react'
import EventList from './EventList'
import Categories from "./Categories";
import FaqData from "./QRData"

export default function Home() {
  return (
    <div>
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
      <div className="container py-4">
        <div className="row justify-content-center py-3">
          <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
            <h1 className="display-3 text-white mb-3 animated slideInDown">
              Créez ou découvrez des événements inoubliables
            </h1>
            <p className="fs-4 text-white mb-4 animated slideInDown">
              EventIA vous connecte aux meilleures conférences, ateliers et hackathons organisés près de chez vous.
              Devenez participant ou organisateur dès maintenant.
            </p>
            {/* <div className="position-relative w-75 mx-auto animated slideInDown">
              <input
                className="form-control border-0 rounded-pill w-100 py-3 ps-4 pe-5"
                type="text"
                placeholder="Ex: Hackathon IA, Conférence DevOps..."
              />
              <button
                type="button"
                className="btn btn-primary rounded-pill py-2 px-4 position-absolute top-0 end-0 me-2"
                style={{ marginTop: 7 }}  >
                Rechercher
              </button>
            </div> */}
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
                alt=""
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
          <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
            <h6 className="section-title bg-white text-start text-primary pe-3">
          À propos
            </h6>
            <h1 className="mb-4">
              Bienvenue sur <span className="text-primary">EventIA</span>
            </h1>
            <p className="mb-4">
           EventIA est une plateforme intelligente dédiée à la gestion et à
          l’organisation d’événements. Que vous soyez un participant à la
          recherche d’événements passionnants ou un organisateur souhaitant
          gérer efficacement vos activités, EventIA vous accompagne à chaque
          étape.
            </p>
           
            <div className="row gy-2 gx-4 mb-4">
              
               <div className="col-sm-6">
            <p className="mb-0">
              <i className="fa fa-arrow-right text-primary me-2" />
              Inscription rapide et sécurisée
            </p>
          </div>
               <div className="col-sm-6">
            <p className="mb-0">
              <i className="fa fa-arrow-right text-primary me-2" />
              Support 24/7
            </p>
          </div>
            
            </div>
            <a className="btn btn-primary py-3 px-5 mt-2" href="/about">
          En savoir plus
            </a>
          </div>
        </div>
      </div>
    </div>
    {/* About End */}
    {/* Categories Start */}
    <Categories showHeader={false} />
    {/* Categories End */}
   
    {/* Liste event Start */}
    <div className="container-xxl py-5">
      <EventList showHeader={false}/>
    </div>
    {/* List event End */}

    {/* Q&R Start */}
       <FaqData  />

    {/* Q&R End */}

    {/* Process Start */}
    <div className="container-xxl py-5">
    <div className="container">
      <div className="text-center pb-4 wow fadeInUp" data-wow-delay="0.1s">
        <h6 className="section-title bg-white text-center text-primary px-3">
          Comment ça marche ?
        </h6>
        <h1 className="mb-5">3 étapes simples</h1>
      </div>
      <div className="row gy-5 gx-4 justify-content-center">
        <div
          className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
          data-wow-delay="0.1s"
        >
          <div className="position-relative border border-primary pt-5 pb-4 px-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
              style={{ width: 100, height: 100 }}
            >
              <i className="fa fa-user-plus fa-3x text-white" />
            </div>
            <h5 className="mt-4">Créer un compte</h5>
            <hr className="w-25 mx-auto bg-primary mb-1" />
            <hr className="w-50 mx-auto bg-primary mt-0" />
            <p className="mb-0">
              Inscrivez-vous gratuitement en tant que participant ou organisateur pour accéder à la plateforme EventIA.
            </p>
          </div>
        </div>
        <div
          className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
          data-wow-delay="0.3s"
        >
          <div className="position-relative border border-primary pt-5 pb-4 px-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
              style={{ width: 100, height: 100 }}
            >
              <i className="fa fa-calendar-check fa-3x text-white" />
            </div>
            <h5 className="mt-4">Explorer les événements</h5>
            <hr className="w-25 mx-auto bg-primary mb-1" />
            <hr className="w-50 mx-auto bg-primary mt-0" />
            <p className="mb-0">
              Parcourez les événements disponibles, consultez les détails et trouvez ceux qui correspondent à vos centres d’intérêt.
            </p>
          </div>
        </div>
        <div
          className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
          data-wow-delay="0.5s"
        >
          <div className="position-relative border border-primary pt-5 pb-4 px-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
              style={{ width: 100, height: 100 }}
            >
              <i className="fa fa-check-circle fa-3x text-white" />
            </div>
            <h5 className="mt-4">S'inscrire & Participer</h5>
            <hr className="w-25 mx-auto bg-primary mb-1" />
            <hr className="w-50 mx-auto bg-primary mt-0" />
            <p className="mb-0">
              Inscrivez-vous à l’événement de votre choix, recevez une confirmation et vivez une expérience inoubliable !
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>

    {/* Process End */}

   
    {/* Testimonial Start */}
    <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
      <div className="container">
        <div className="text-center">
          <h6 className="section-title bg-white text-center text-primary px-3">
            Testimonial
          </h6>
          <h1 className="mb-5">Our Clients Say!!!</h1>
        </div>
        <div className="owl-carousel testimonial-carousel position-relative">
          <div className="testimonial-item bg-white text-center border p-4">
            <img
              className="bg-white rounded-circle shadow p-1 mx-auto mb-3"
              src="/publicSite/assets/img/testimonial-1.jpg"
              style={{ width: 80, height: 80 }} alt='testimonial1'
            />
            <h5 className="mb-0">John Doe</h5>
            <p>New York, USA</p>
            <p className="mb-0">
              Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
              amet diam et eos. Clita erat ipsum et lorem et sit.
            </p>
          </div>
          <div className="testimonial-item bg-white text-center border p-4">
            <img
              className="bg-white rounded-circle shadow p-1 mx-auto mb-3"
              src="/publicSite/assets/img/testimonial-2.jpg"
              style={{ width: 80, height: 80 }} alt='testimonial2'
            />
            <h5 className="mb-0">John Doe</h5>
            <p>New York, USA</p>
            <p className="mt-2 mb-0">
              Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
              amet diam et eos. Clita erat ipsum et lorem et sit.
            </p>
          </div>
          <div className="testimonial-item bg-white text-center border p-4">
            <img
              className="bg-white rounded-circle shadow p-1 mx-auto mb-3"
              src="/publicSite/assets/img/testimonial-3.jpg"
              style={{ width: 80, height: 80 }} alt='testimonial3'
            />
            <h5 className="mb-0">John Doe</h5>
            <p>New York, USA</p>
            <p className="mt-2 mb-0">
              Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
              amet diam et eos. Clita erat ipsum et lorem et sit.
            </p>
          </div>
          <div className="testimonial-item bg-white text-center border p-4">
            <img
              className="bg-white rounded-circle shadow p-1 mx-auto mb-3"
              src="/publicSite/assets/img/testimonial-4.jpg"
              style={{ width: 80, height: 80 }} alt='testimonial4'
            />
            <h5 className="mb-0">John Doe</h5>
            <p>New York, USA</p>
            <p className="mt-2 mb-0">
              Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam
              amet diam et eos. Clita erat ipsum et lorem et sit.
            </p>
          </div>
        </div>
      </div>
    </div>
    {/* Testimonial End */}  
    </div>
  )
}
