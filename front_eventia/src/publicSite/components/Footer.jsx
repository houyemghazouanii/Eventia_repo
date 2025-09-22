import React from 'react'
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <div>
      {/* Footer Start */}
      <div
        className="container-fluid bg-dark text-light footer pt-3 mt-3 wow fadeIn"
        data-wow-delay="0.1s"
      >
        <div className="container py-3">
          <div className="row g-5 justify-content-center text-center">
            <div className="col-lg-3 col-md-3">
              <h4 className="text-white mb-3 fst-italic">EventIA</h4>
              <hr />
               <Link to="/" className="btn btn-link">
                Home
              </Link>

              <Link to="/about" className="btn btn-link" >
                À propos
              </Link>
          
              <Link to="/publicevents" className="btn btn-link" >
                Événements
              </Link>

               <Link to="/contact" className="btn btn-link" >
                Contact
              </Link>
             
            </div>
            <div className="col-lg-5 col-md-3">
              <h4 className="text-white mb-3">Contact</h4>
              <p className="mb-2">
                <i className="fa fa-map-marker-alt me-3" />
                Tunis, Tunisie
              </p>
              <p className="mb-2">
                <i className="fa fa-phone-alt me-3" />
                +216 12 345 678
              </p>
              <p className="mb-2">
                <i className="fa fa-envelope me-3" />
                eventia.gha@gmail.com
              </p>
              
            </div>
          </div>
        </div>
        <div className="container">
          <div className="copyright">
            <div className="row">
              <div className="col-md-12 text-center">
                ©{" "}
                <a className="border-bottom" href="#">
                  EventIA
                </a>{" "}
                - Tous droits réservés.  
                Développé avec ❤️ par Houyem Ghazouani
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}
    </div>
  )
}
