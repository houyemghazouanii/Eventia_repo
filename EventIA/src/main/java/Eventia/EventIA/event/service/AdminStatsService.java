package Eventia.EventIA.event.service;

import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.enums.EventStatut;
import Eventia.EventIA.event.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminStatsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        // --- Utilisateurs ---
        long totalOrganizers = userRepository.countByRole(Role.ORGANIZER);
        long totalParticipants = userRepository.countByRole(Role.USER);
        long totalUsers = totalOrganizers + totalParticipants;

        Map<String, Object> usersStats = new HashMap<>();
        usersStats.put("totalOrganizers", totalOrganizers);
        usersStats.put("totalParticipants", totalParticipants);
        usersStats.put("totalUsers", totalUsers);

        // --- Événements ---
        long totalEvents = eventRepository.countEvents();
        Integer totalParticipantsEvent = eventRepository.totalParticipants();
        Double totalRevenue = eventRepository.totalRevenue();
        long pastEvents = eventRepository.countPastEvents(LocalDate.now());
        long upcomingEvents = eventRepository.countUpcomingEvents(LocalDate.now());

        // Statut des événements
        List<Object[]> statusCounts = eventRepository.countEventsByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] obj : statusCounts) {
            EventStatut statut = (EventStatut) obj[0];
            Long count = (Long) obj[1];
            statusMap.put(statut.name(), count);
        }

        Map<String, Object> eventsStats = new HashMap<>();
        eventsStats.put("totalEvents", totalEvents);
        eventsStats.put("totalParticipants", totalParticipantsEvent != null ? totalParticipantsEvent : 0);
        eventsStats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        eventsStats.put("pastEvents", pastEvents);
        eventsStats.put("upcomingEvents", upcomingEvents);
        eventsStats.put("eventsStatusCount", statusMap);

        // --- Activité (Top 5 événements et moyenne) ---
        List<Object[]> topEvents = eventRepository.findTopEventsByParticipants();
        Map<String, Object> activityStats = new HashMap<>();

        // Récupérer Top 5
        List<Object[]> top5Events = topEvents.stream().limit(5).collect(Collectors.toList());
        activityStats.put("topEventsByParticipants", top5Events);

        double averageParticipantsPerEvent = totalEvents > 0 && totalParticipantsEvent != null
                ? ((double) totalParticipantsEvent / totalEvents)
                : 0.0;
        activityStats.put("averageParticipantsPerEvent", averageParticipantsPerEvent);

        // --- Mettre toutes les stats ---
        stats.put("users", usersStats);
        stats.put("events", eventsStats);
        stats.put("activity", activityStats);

        return stats;
    }
}
