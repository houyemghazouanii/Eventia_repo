import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";


import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import AdminProfile from "./pages/AdminProfile";

import Events from "./Events/Events";
import AddEvent from "./Events/AddEvent";
import EditEvent from "./Events/EditEvent";
import EventDetails from "./Events/EventDetails";

import Users from "./users/UserView";
import AddUser from "./users/AddUsers";
import DetailsUser from "./users/DetailsUser";
import EditUser from "./users/EditUser";
import TicketTemplate from "./pages/TicketTemplate"
import AjouterModeleBillet from "./pages/AjouterModeleBillet"
const AdminLayout = () => {
  useEffect(() => {
    // Charger CSS KaiAdmin
    const cssFiles = [
      "/assets/css/bootstrap.min.css",
      "/assets/css/plugins.min.css",
      "/assets/css/kaiadmin.min.css",
      "/assets/css/demo.css",
      "/assets/css/fonts.min.css",
    ];
    const cssLinks = cssFiles.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    // Charger JS KaiAdmin (ordre important)
    const jsFiles = [
      "/assets/js/core/jquery-3.7.1.min.js",
      "/assets/js/core/popper.min.js",
      "/assets/js/core/bootstrap.min.js",
      "/assets/js/plugin/jquery-scrollbar/jquery.scrollbar.min.js",
      "/assets/js/plugin/chart.js/chart.min.js",
      "/assets/js/plugin/jquery.sparkline/jquery.sparkline.min.js",
      "/assets/js/plugin/chart-circle/circles.min.js",
      "/assets/js/plugin/datatables/datatables.min.js",

      // **Ajout obligatoire de jsvectormap.min.js avant world.js**
      //"/assets/js/plugin/jsvectormap/jsvectormap.min.js",
      //"/assets/js/plugin/jsvectormap/world.js",

      "/assets/js/plugin/sweetalert/sweetalert.min.js",
      "/assets/js/kaiadmin.min.js",
      "/assets/js/setting-demo.js",
      //"/assets/js/demo.js",
    ];

    const jsScripts = jsFiles.map((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
      return script;
    });

    return () => {
      // Nettoyer les liens ajoutés (si toujours présents)
      cssLinks.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });

      // Nettoyer les scripts ajoutés (si toujours présents)
      jsScripts.forEach((script) => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      });
    };
  }, []);

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-panel">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<AdminProfile />} />
  
            {/* Events */}
            <Route path="events" element={<Events />} />
            <Route path="add-events" element={<AddEvent />} />
            <Route path="events/edit/:id" element={<EditEvent />} />
            <Route path="events/view/:id" element={<EventDetails />} />

            {/* Users */}
            <Route path="users" element={<Users />} />
            <Route path="add-users" element={<AddUser />} />
            <Route path="users/view/:id" element={<DetailsUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />


            <Route path="modeles-billets" element={<TicketTemplate />} />
            <Route path="modeles-billets/ajouter" element={<AjouterModeleBillet />} />



           


          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
