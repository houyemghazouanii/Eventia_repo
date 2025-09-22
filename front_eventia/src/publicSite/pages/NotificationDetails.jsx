import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import {
  VisibilityOutlined as ReadIcon,
  DraftsOutlined as UnreadIcon,
  EventNoteOutlined as EventIcon,
  MessageOutlined as MessageIcon,
} from "@mui/icons-material";

function NotificationDetails() {
  const { id } = useParams();
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndMarkNotification = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        const res = await axios.get(
          `http://127.0.0.1:5000/notifications/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const found = res.data.find((n) => n.id === parseInt(id));
        if (found) {
          setNotif(found);

          if (!found.lu) {
            await axios.put(
              `http://127.0.0.1:5000/notifications/${id}/mark-read`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            window.dispatchEvent(new Event("notificationUpdated"));
          }
        } else {
          setNotif(null);
        }
      } catch (err) {
        console.error("Erreur notification:", err);
        setError("Impossible de charger les détails de la notification.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndMarkNotification();
  }, [id]);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Chargement...
        </Typography>
      </Box>
    );

  if (error)
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );

  if (!notif)
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">Notification introuvable.</Alert>
      </Container>
    );

  const StatusIcon = notif.lu ? ReadIcon : UnreadIcon;
  const NotificationIcon = notif.type_notif === "Evenement" ? EventIcon : MessageIcon;

  return (
    <div>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-2">
          <div className="row justify-content-center py-3">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-4 text-white animated slideInDown">Détails de la notification</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center bg-transparent">
                  <li className="breadcrumb-item">
                    <Link to="/">Accueil</Link>
                  </li>
                  
                  <li className="breadcrumb-item text-white active" aria-current="page">
                    Détails de la notification
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <NotificationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                {notif.type_notif}
              </Typography>
            </Box>
            <Chip
              icon={<StatusIcon />}
              label={notif.lu ? "Lue" : "Non lue"}
              color={notif.lu ? "success" : "warning"}
              size="small"
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Message :
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              {notif.message}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Date d'envoi :
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {new Date(notif.date_envoi).toLocaleString()}
            </Typography>
          </Box>
         
        </CardContent>
      </Card>
    </Container>
    </div>
  );
}

export default NotificationDetails;