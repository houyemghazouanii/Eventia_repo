package Eventia.EventIA.event.repository;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.event.dto.EventDto;
import Eventia.EventIA.event.entity.Event;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import Eventia.EventIA.event.enums.EventStatut;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByOrganizer(User organizer);
    Optional<Event> findByTitre(String titre);
    List<Event> findByStatut(EventStatut statut);


    Optional<Event> findByIdAndStatut(Long id, EventStatut statut);

    List<Event> findByOrganizerId(Long organizerId);
    @Modifying
    @Transactional
    @Query("UPDATE Event e SET e.statut = 'ARCHIVED' WHERE e.statut = 'ACTIVE' AND e.dateFin < :today")
    int archiveExpiredEvents(@Param("today") LocalDate today);

    @Query("SELECT new Eventia.EventIA.event.dto.EventDto(" +
            "e.id, e.titre, e.description, e.dateDebut, e.dateFin, e.heureDebut, e.dateLimiteInscription," +
            " e.adresse, e.prix, e.type, e.statut, e.capaciteMax, e.nombreInscriptions, e.image, e.organizer.id" +
            ") " +
            "FROM Event e")
    List<EventDto> findAllEventsDto();

    // Nombre total d'événements pour un organisateur
    @Query("SELECT COUNT(e) FROM Event e WHERE e.organizer.id = :organizerId")
    int countEventsByOrganizer(@Param("organizerId") Long organizerId);

    // Nombre total d'inscriptions pour un organisateur
    @Query("SELECT SUM(e.nombreInscriptions) FROM Event e WHERE e.organizer.id = :organizerId")
    Integer totalParticipantsByOrganizer(@Param("organizerId") Long organizerId);

    // Chiffre d'affaires total pour un organisateur
    @Query("SELECT SUM(e.nombreInscriptions * e.prix) FROM Event e WHERE e.organizer.id = :organizerId")
    Double totalRevenueByOrganizer(@Param("organizerId") Long organizerId);

    // Statut count
    @Query("SELECT e.statut AS statut, COUNT(e) AS count FROM Event e WHERE e.organizer.id = :organizerId GROUP BY e.statut")
    List<Object[]> countEventsByStatus(@Param("organizerId") Long organizerId);
    // Nombre total d'événements
    @Query("SELECT COUNT(e) FROM Event e")
    long countEvents();

    // Nombre d'inscriptions totales
    @Query("SELECT SUM(e.nombreInscriptions) FROM Event e")
    Integer totalParticipants();

    // Chiffre d'affaires total
    @Query("SELECT SUM(e.nombreInscriptions * e.prix) FROM Event e")
    Double totalRevenue();

    // Statut count
    @Query("SELECT e.statut AS statut, COUNT(e) AS count FROM Event e GROUP BY e.statut")
    List<Object[]> countEventsByStatus();

    // Événements passés
    @Query("SELECT COUNT(e) FROM Event e WHERE e.dateFin < :today")
    long countPastEvents(@Param("today") LocalDate today);

    // Événements futurs
    @Query("SELECT COUNT(e) FROM Event e WHERE e.dateDebut >= :today")
    long countUpcomingEvents(@Param("today") LocalDate today);

    // Top event by participants
    @Query("SELECT e.id, e.titre, e.nombreInscriptions FROM Event e ORDER BY e.nombreInscriptions DESC")
    List<Object[]> findTopEventsByParticipants();

}
