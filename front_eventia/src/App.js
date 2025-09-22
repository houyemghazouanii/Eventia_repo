import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginAdmin from './admin/pages/Login';
import AdminLayout from "./admin/AdminLayout";
import PublicLayout from "./publicSite/PublicLayout";
import PrivateRoute from "./admin/pages/PrivateRoute";
import DashboardOrganizer from "./publicSite/organizer/dashboard/pages/Dashboard";
import EventOrganizer from "./publicSite/organizer/dashboard/pages/EventOrganizer";

import PrivateRouteOrganizer from "./publicSite/pages/organizer/PrivateRouteOrganizer";
import ProfileOrganizer from "./publicSite/organizer/dashboard/pages/ProfileOrganizer"
import AddEventOrganizer from "./publicSite/organizer/dashboard/pages/AddEventOrganizer"
import EventDetailsOrganizer from "./publicSite/organizer/dashboard/pages/EventDetailsOrganizer"
import EditEventOrganizer from "./publicSite/organizer/dashboard/pages/EditEventOrganizer";

import OrganizerModeleBillets from "./publicSite/organizer/dashboard/pages/OrganizerModeleBillets"
import ParticipantListOrganizer from "./publicSite/organizer/dashboard/pages/ParticipantListOrganizer"
import ManageReviews from "./publicSite/organizer/dashboard/pages/ManageReviews"
function App() {
  return (
    <Routes>
      {/* Route login admin (publique) */}
      <Route path="/admin/login" element={<LoginAdmin />} />

      {/* Routes protégées pour l'admin */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute roleRequired="ADMIN">
            <AdminLayout />
          </PrivateRoute>
        }
      />
 {/* ✅ Route du dashboard organisateur (en dehors de PublicLayout) */}
      <Route
        path="/organizer/dashboard"
        element={
          <PrivateRouteOrganizer>
            <DashboardOrganizer />
          </PrivateRouteOrganizer>
        }
      />
      <Route
        path="/organizer/events"
        element={
          <PrivateRouteOrganizer>
            <EventOrganizer />
          </PrivateRouteOrganizer>
        }
      />
       <Route
        path="/organizer/profile"
        element={
          <PrivateRouteOrganizer>
            <ProfileOrganizer />
          </PrivateRouteOrganizer>
        }
      />
      <Route
        path="/organizer/addevent"
        element={
          <PrivateRouteOrganizer>
            <AddEventOrganizer />
          </PrivateRouteOrganizer>
        }
      />

      <Route
        path="/organizer/events/view/:id"
        element={
          <PrivateRouteOrganizer>
            <EventDetailsOrganizer />
          </PrivateRouteOrganizer>
        }
      />

      <Route
        path="organizer/events/edit/:id"
        element={
          <PrivateRouteOrganizer>
            <EditEventOrganizer />
          </PrivateRouteOrganizer>
        }
      />

      
      <Route
        path="/organizer/models-billets"
        element={
          <PrivateRouteOrganizer>
            <OrganizerModeleBillets />
          </PrivateRouteOrganizer>
        }
      />

        <Route
        path="/organizer/participations"
        element={
          <PrivateRouteOrganizer>
            < ParticipantListOrganizer />
          </PrivateRouteOrganizer>
        }
      />
       <Route
        path="/organizer/reviews"
        element={
          <PrivateRouteOrganizer>
            < ManageReviews />
          </PrivateRouteOrganizer>
        }
      />

      {/* Routes publiques */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}

export default App;
