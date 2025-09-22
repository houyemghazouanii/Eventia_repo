package Eventia.EventIA.reservation;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.repository.EventRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    public Reservation createReservation(Long participantId, Long eventId, int quantite) {
        // Vérification de la quantité
        if (quantite < 1 || quantite > 3) {
            throw new IllegalArgumentException("La quantité doit être entre 1 et 3.");
        }

        // Récupération du participant
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant introuvable"));

        // Récupération de l'événement
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));

        // Vérifier si le participant a déjà réservé cet événement
        boolean dejaReserve = reservationRepository.existsByParticipantIdAndEventId(participantId, eventId);
        if (dejaReserve) {
            throw new IllegalStateException("Vous avez déjà réservé cet événement.");
        }

        // calcul du prix total
        double prixTotal = event.getPrix() * quantite;

        // Création de la réservation
        Reservation reservation = new Reservation();
        reservation.setParticipant(participant);
        reservation.setEvent(event);
        reservation.setQuantite(quantite);
        reservation.setDateReservation(LocalDateTime.now());
        reservation.setStatut(StatutReservation.EN_ATTENTE);
        reservation.setPrixTotal(prixTotal);

        return reservationRepository.save(reservation);
    }

    public Reservation findById(Long id) {
        return reservationRepository.findById(id).orElse(null);
    }

    public Reservation save(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public List<Reservation> findPendingByUser(Long participantId) {
        return reservationRepository.findByParticipant_IdAndStatut(participantId, StatutReservation.EN_ATTENTE);
    }


    public void deleteById(Long id) {
        reservationRepository.deleteById(id);
    }

    @Scheduled(cron = "0 0 * * * *") // chaque heure
    public void supprimerReservationsNonPayees() {
        System.out.println("⏰ Tâche planifiée exécutée à : " + LocalDateTime.now());

        LocalDateTime limite = LocalDateTime.now().minusDays(1);
        List<Reservation> anciennes = reservationRepository
                .findByStatutAndDateReservationBefore(StatutReservation.EN_ATTENTE, limite);

        System.out.println("🔍 Réservations à supprimer : " + anciennes.size());
        anciennes.forEach(r -> System.out.println(" ➤ Réservation ID: " + r.getId() + " - Date: " + r.getDateReservation()));

        reservationRepository.deleteAll(anciennes);
        System.out.println("✅ Réservations supprimées.");
    }

}
