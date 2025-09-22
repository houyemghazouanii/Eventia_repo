import React, { useEffect, useState } from "react";
import axios from "../../../../admin/config/axiosConfig";
import OrganizerLayout from "./OrganizerLayout";
import { FaUsers, FaDollarSign, FaCalendarAlt } from "react-icons/fa";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import "./Dashboard.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStats = async () => {
    let organizerId = localStorage.getItem("id");
    let token = localStorage.getItem("token");

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        organizerId = user.id;
        token = user.token;
      } catch {
        console.error("Erreur parsing user localStorage");
      }
    }

    if (!organizerId || !token) {
      setErrorMsg("Vous devez être connecté pour voir vos statistiques.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `/events/users/organizers/${organizerId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { eventsStatusCount, totalParticipants, totalRevenue, totalEvents } = response.data;
      setStats({
        activeEvents: eventsStatusCount.ACTIVE || 0,
        archivedEvents: eventsStatusCount.ARCHIVED || 0,
        cancelledEvents: eventsStatusCount.CANCELLED || 0,
        draftEvents: eventsStatusCount.DRAFT || 0,
        totalParticipants: totalParticipants || 0,
        totalRevenue: totalRevenue || 0,
        totalEvents: totalEvents || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques :", error);
      setErrorMsg("Impossible de récupérer les statistiques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = stats
    ? {
        labels: ["Actifs", "En attente", "Archivés", "Annulés"],
        datasets: [
          {
            label: "Événements",
            data: [stats.activeEvents, stats.draftEvents, stats.archivedEvents, stats.cancelledEvents],
            backgroundColor: ["#28a745", "#ffc107", "#6c757d", "#dc3545"],
            borderRadius: 8,
            barThickness: 30,
          },
        ],
      }
    : null;

  const chartOptions = {
    indexAxis: 'y', // horizontal bars
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: {
        anchor: 'end',
        align: 'right',
        color: '#000',
        font: { weight: 'bold' },
      },
      title: {
        display: true,
        text: "Répartition des événements par statut",
        font: { size: 16 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      },
      y: { 
        ticks: { font: { size: 14 } } 
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
  };

  return (
    <OrganizerLayout>
      <div className="container py-5">
        <h2 className="fw-bold mb-4 fade-in">Tableau de bord</h2>

        {loading ? (
          <p>Chargement des statistiques...</p>
        ) : errorMsg ? (
          <p className="text-danger">{errorMsg}</p>
        ) : stats ? (
          <>
            {/* Cartes */}
            <div className="row g-4 mb-4">
              <StatCard label="Total d'événements" value={stats.totalEvents} icon={<FaCalendarAlt size={36} className="text-primary" />} />
              <StatCard label="Participants inscrits" value={stats.totalParticipants} icon={<FaUsers size={36} className="text-success" />} />
              <StatCard label="Revenu total" value={`$${stats.totalRevenue}`} icon={<FaDollarSign size={36} className="text-warning" />} />
            </div>

            {/* Chart horizontal */}
            <div className="card shadow-sm p-4 mb-4 fade-in">
              {chartData && <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />}
            </div>
          </>
        ) : (
          <p>Aucune statistique disponible.</p>
        )}
      </div>
    </OrganizerLayout>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="col-md-4 fade-in">
    <div className="card shadow-sm p-4 rounded text-center bg-light hover-shadow">
      <div className="mb-2">{icon}</div>
      <h6 className="text-muted">{label}</h6>
      <h2 className="fw-bold">{value ?? 0}</h2>
    </div>
  </div>
);

export default Dashboard;
