package Eventia.EventIA.reservation;

import Eventia.EventIA.User.dto.ParticipantEventDto;
import Eventia.EventIA.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByParticipantId(Long participantId);
    boolean existsByParticipantIdAndEventId(Long participantId, Long eventId);

    List<Reservation> findByParticipant_IdAndStatut(Long participantId, StatutReservation statut);
    List<Reservation> findByStatutAndDateReservationBefore(StatutReservation statut, LocalDateTime dateLimite);
    List<Reservation> findByParticipantIdAndStatutAndDateReservationAfter(
            Long participantId, StatutReservation statut, LocalDateTime date
    );

    @Query("SELECT new Eventia.EventIA.User.dto.ParticipantEventDto(" +
            "u.id, u.nom, u.prenom, u.email, u.telephone, " +
            "e.id, e.titre, e.dateDebut) " +
            "FROM Reservation r " +
            "JOIN r.participant u " +
            "JOIN r.event e " +
            "WHERE e.organizer.id = :organizerId " +
            "AND r.statut = Eventia.EventIA.reservation.StatutReservation.PAYEE")
    List<ParticipantEventDto> findParticipantsByOrganizer(@Param("organizerId") Long organizerId);

    // ✅ Nouvelle méthode pour récupérer les événements payés par un participant
    @Query("SELECT r.event FROM Reservation r " +
            "WHERE r.participant.id = :participantId " +
            "AND r.statut = Eventia.EventIA.reservation.StatutReservation.PAYEE")
    List<Event> findEventsPayesByParticipantId(@Param("participantId") Long participantId);
    boolean existsByParticipant_IdAndEvent_IdAndStatut(Long participantId, Long eventId, StatutReservation statut);
}
