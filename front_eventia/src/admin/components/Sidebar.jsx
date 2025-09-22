import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = () => {
  return (
    <div className="sidebar" data-background-color="dark">
      <div className="sidebar-logo">
        <div className="logo-header" data-background-color="dark">
          <Link to="/admin/dashboard" className="logo">
            <img
              src={process.env.PUBLIC_URL + "/assets/img/eventia/eventia-logo.png"}
              alt="logo"
              style={{ width: "150px", height: "auto" }}
            />

          </Link>
          <div className="nav-toggle">
            <button className="btn btn-toggle toggle-sidebar">
              <i className="gg-menu-right"></i>
            </button>
            <button className="btn btn-toggle sidenav-toggler">
              <i className="gg-menu-left"></i>
            </button>
          </div>
          <button className="topbar-toggler more">
            <i className="gg-more-vertical-alt"></i>
          </button>
        </div>
      </div>

      <div className="sidebar-wrapper scrollbar scrollbar-inner">
        <div className="sidebar-content">
          <ul className="nav nav-secondary">
            <li className="nav-item active">
              <Link to="/admin/dashboard" className="logo">
                <i className="fas fa-home"></i>
                <p>Dashboard</p>
              </Link>
             
            </li>

            <li className="nav-section">
              <span className="sidebar-mini-icon">
                <i className="fa fa-ellipsis-h"></i>
              </span>
              <h4 className="text-section">Events</h4>
            </li>

          <li className="nav-item">
            <Link to="/admin/events" className="nav-link">
              <i className="bi bi-calendar-event-fill"></i>
              <p>Événements</p>
            </Link>
         </li>


            <li className="nav-item">
              <Link to="/admin/users" className="nav-link">
                <i className="bi bi-people-fill"></i>
                <p>Utilisateurs</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/admin/modeles-billets" className="nav-link">
                <i className="fas fa-file"></i>
                <p>Billets</p>
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
