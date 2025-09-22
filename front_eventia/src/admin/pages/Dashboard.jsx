import React, { useEffect, useState } from 'react';
import axios from '../config/axiosConfig';
import { Pie, Doughnut } from 'react-chartjs-2';
import CountUp from 'react-countup';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale
} from 'chart.js';

// ✅ Enregistrement des composants nécessaires
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale);

const StatCard = ({ icon, category, value, colorClass }) => (
  <div className="col-sm-6 col-md-3 mb-3">
    <div className="card card-stats card-round shadow-sm">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-icon">
            <div className={`icon-big text-center ${colorClass} bubble-shadow-small`}>
              <i className={icon}></i>
            </div>
          </div>
          <div className="col col-stats ms-3 ms-sm-0">
            <div className="numbers">
              <p className="card-category">{category}</p>
              <h4 className="card-title">
                <CountUp end={value} duration={1.5} separator="," />
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8081/events/admin/stats');
        setStats(res.data);
      } catch (err) {
        setError('Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-5">Chargement des statistiques...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!stats) return <div className="text-center text-muted">Aucune donnée disponible.</div>;

  // Pie chart - Répartition des événements par statut
  const eventStatusData = {
    labels: ['Actifs', 'Brouillons', 'Archivés', 'Annulés'],
    datasets: [{
      label: 'Événements',
      data: [
        stats.events.eventsStatusCount.ACTIVE || 0,
        stats.events.eventsStatusCount.DRAFT || 0,
        stats.events.eventsStatusCount.ARCHIVED || 0,
        stats.events.eventsStatusCount.CANCELLED || 0
      ],
      backgroundColor: ['#28a745', '#ffc107', '#3a9aee', '#e71453'],
    }]
  };

  // Top 5 événements par participants
  const topEvents = stats.activity.topEventsByParticipants
    ? stats.activity.topEventsByParticipants.slice(0, 5).map(ev => ({
        title: ev[1],
        participants: ev[2]
      }))
    : [];

  const topEventsData = {
    labels: topEvents.map(ev => ev.title),
    datasets: [{
      data: topEvents.map(ev => ev.participants),
      backgroundColor: ['#007bff', '#28a745', '#ffc107', '#56ececff', '#e71453'],
    }]
  };

  return (
    <div className="container" style={{ paddingTop: '60px' }}>
      <div className="page-inner">
        <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
          <div>
            <h3 className="fw-bold mb-3">Dashboard Admin</h3>
            <h6 className="op-7 mb-2">Aperçu des statistiques de la plateforme</h6>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row">
          <StatCard icon="fas fa-users" category="Utilisateurs totaux" value={stats.users.totalUsers} colorClass="icon-primary" />
          <StatCard icon="fas fa-user-check" category="Organisateurs" value={stats.users.totalOrganizers} colorClass="icon-info" />
          <StatCard icon="fas fa-user-friends" category="Participants" value={stats.users.totalParticipants} colorClass="icon-warning" />
          <StatCard icon="fas fa-calendar-alt" category="Événements" value={stats.events.totalEvents} colorClass="icon-danger" />
          <StatCard icon="fas fa-dollar-sign" category="Revenu total" value={stats.events.totalRevenue.toFixed(2)} colorClass="icon-success" />
          <StatCard icon="fas fa-history" category="Événements passés" value={stats.events.pastEvents} colorClass="icon-secondary" />
        </div>

        {/* Statistiques principales */}
        <div className="row mt-4">
          <div className="col-md-6 mb-3">
            <div className="card card-round shadow-sm p-3">
              <h5 className="text-center mb-3">Participants moyens par événement</h5>
              <h2 className="text-center text-primary">{stats.activity.averageParticipantsPerEvent.toFixed(2)}</h2>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card card-round shadow-sm p-3">
              <h5 className="text-center mb-3">Meilleur événement</h5>
              <div className="d-flex align-items-center justify-content-center">
                <i className="fas fa-trophy text-warning me-2" style={{ fontSize: '2rem' }}></i>
                <div>
                  <h4 className="mb-0">{topEvents[0]?.title || 'Aucun'}</h4>
                  <p className="mb-0">Participants : {topEvents[0]?.participants || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="row mt-4">
          <div className="col-md-6 mb-3">
            <div className="card card-round shadow-sm p-3">
              <h5 className="text-center mb-3">Répartition des événements par statut</h5>
              <Pie data={eventStatusData} />
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card card-round shadow-sm p-3">
              <h5 className="text-center mb-3">Top 5 événements par participants</h5>
              <Doughnut data={topEventsData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
