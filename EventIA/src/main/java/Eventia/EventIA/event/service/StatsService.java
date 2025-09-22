package Eventia.EventIA.event.service;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.enums.EventStatut;
import Eventia.EventIA.event.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getOrganizerStats(Long organizerId) {

        Map<String, Object> stats = new HashMap<>();

        // Vérifier que l'organisateur existe
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organisateur non trouvé"));

        stats.put("totalEvents", eventRepository.countEventsByOrganizer(organizerId));
        stats.put("totalParticipants", eventRepository.totalParticipantsByOrganizer(organizerId));
        stats.put("totalRevenue", eventRepository.totalRevenueByOrganizer(organizerId));

        // Événements par statut
        List<Object[]> statusCounts = eventRepository.countEventsByStatus(organizerId);
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] obj : statusCounts) {
            EventStatut statut = (EventStatut) obj[0];
            Long count = (Long) obj[1];
            statusMap.put(statut.name(), count);
        }
        stats.put("eventsStatusCount", statusMap);

        return stats;
    }
}
