import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Categories from "./pages/Categories";
import PublicEvents from "./pages/EventList";
import Destination from "./pages/Destination";
import Booking from "./pages/Booking";
import Team from "./pages/Team";
import Testimonial from "./pages/Testimonial";
import Error from "./pages/Error";
import Contact from "./pages/Contact";

import LoginParticipant from "./pages/participant/LoginParticipant";
import RegisterParticipant from "./pages/participant/RegisterParticipant";
import ProfileParticipant from "./pages/participant/ProfileParticipant";
import PrivateRouteParticipant from './pages/participant/PrivateRouteParticipant';
import EventDetails from './pages/EventDetails';

import LoginOrganizer from "./pages/organizer/LoginOrganizer";
import RegisterOrganizer from "./pages/organizer/RegisterOrganizer"
import Panier  from "./pages/participant/Panier";
import ParticipantHistory from "./pages/participant/ParticipantHistory"
import Preferences from "./pages/participant/Preferences"
import RecommendedEvents from "./pages/participant/RecommendedEvents"

import NotificationDetails from "./pages/NotificationDetails";


const PublicLayout = () => {
  useEffect(() => {
    // Charger les CSS (simultanément, c'est OK)
    const cssFiles = [
      "https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600&family=Nunito:wght@600;700;800&display=swap",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css",
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css",
      "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
      "/publicSite/assets/lib/animate/animate.min.css",
      "/publicSite/assets/lib/owlcarousel/assets/owl.carousel.min.css",
      "/publicSite/assets/lib/tempusdominus/css/tempusdominus-bootstrap-4.min.css",
      "/publicSite/assets/css/bootstrap.min.css",
      "/publicSite/assets/css/style.css"
    ];

    const cssLinks = cssFiles.map(href => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    // Fonction utilitaire pour charger un script et attendre qu'il soit chargé
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.body.appendChild(script);
      });
    };

    // Charger les scripts JS dans l'ordre, en attendant chacun
    (async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.4.1.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js");
        await loadScript("/publicSite/assets/lib/wow/wow.min.js");  // Important que WOW soit chargé avant main.js
        await loadScript("/publicSite/assets/lib/easing/easing.min.js");
        await loadScript("/publicSite/assets/lib/waypoints/waypoints.min.js");
        await loadScript("/publicSite/assets/lib/owlcarousel/owl.carousel.min.js");
        await loadScript("/publicSite/assets/lib/tempusdominus/js/moment.min.js");
        await loadScript("/publicSite/assets/lib/tempusdominus/js/moment-timezone.min.js");
        await loadScript("/publicSite/assets/lib/tempusdominus/js/tempusdominus-bootstrap-4.min.js");
        await loadScript("/publicSite/assets/js/main.js");  // main.js en dernier
      } catch (err) {
        console.error(err);
      }
    })();

    // Cleanup : enlever les CSS et JS quand composant démonté
    return () => {
      cssLinks.forEach(link => document.head.removeChild(link));
      // Note : ici on pourrait enlever les scripts aussi, mais attention car ils peuvent causer des effets secondaires
      // Si tu veux, tu peux aussi enlever les scripts ici :
      // jsScripts.forEach(script => document.body.removeChild(script));
    };
  }, []);

  return (
    <div className="container-xxl bg-white p-0">
      <Header />
      <main>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

         {/* auth user */}
          <Route path="/login-participant" element={<LoginParticipant />} />
          <Route path="/register-participant" element={<RegisterParticipant />} />
          <Route
          path="/profile-participant"
          element={
            <PrivateRouteParticipant>
              <ProfileParticipant />
            </PrivateRouteParticipant>
          } />
           <Route
            path="/eventdetails/:id"
            element={
              <PrivateRouteParticipant>
                <EventDetails />
              </PrivateRouteParticipant>
            } />

          <Route path="/panier" element={<PrivateRouteParticipant> <Panier /> </PrivateRouteParticipant>} />
          <Route path="/mon-historique" element={<PrivateRouteParticipant> <ParticipantHistory /> </PrivateRouteParticipant>} />
          <Route path="/preferences" element={<PrivateRouteParticipant> <Preferences /> </PrivateRouteParticipant>} />
          <Route path="/recommended-events" element={<PrivateRouteParticipant> <RecommendedEvents /> </PrivateRouteParticipant>} />
          <Route path="/notification/:id" element={<PrivateRouteParticipant> <NotificationDetails /> </PrivateRouteParticipant>} />




         {/* auth organizer */}
          <Route path="/login-organizer" element={<LoginOrganizer />} />
          <Route path="/register-organizer" element={<RegisterOrganizer />} />
        {/* Route protégée */}
        {/* <Route
          path="/dashboard-organizer"
          element={
            <PrivateRouteOrganizer>
              <DashboardOrganizer />
            </PrivateRouteOrganizer>
          } /> */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/publicevents" element={<PublicEvents />} />
          <Route path="/destination" element={<Destination />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/team" element={<Team />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/error" element={<Error />} />
          <Route path="/contact" element={<Contact />} />

        </Routes>
      </main>
      <Footer />
      {/* Bouton back-to-top (optionnel) */}
      {/* <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top">
        <i className="bi bi-arrow-up"></i>
      </a> */}
    </div>
  );
};

export default PublicLayout;
