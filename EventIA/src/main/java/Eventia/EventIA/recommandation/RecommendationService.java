package Eventia.EventIA.recommandation;

import Eventia.EventIA.event.dto.EventDto;

import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.repository.EventRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;



@Service
public class RecommendationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String pythonApiUrl = "http://localhost:5000/recommendations/";

    @Autowired
    private EventRepository eventRepository;

    public List<EventDto> getRecommendedEvents(Long userId) {
        try {
            // Appelle l'API Python pour obtenir une liste d'IDs d'événements
            Long[] recommendedIds = restTemplate.getForObject(pythonApiUrl + userId, Long[].class);

            if (recommendedIds != null && recommendedIds.length > 0) {
                // Convertit le tableau en liste pour une utilisation facile
                List<Long> ids = Arrays.asList(recommendedIds);

                // Récupère les entités Event complètes depuis la base de données Spring
                List<Event> recommendedEvents = eventRepository.findAllById(ids);

                // Convertit les entités en DTOs
                return recommendedEvents.stream()
                        .map(this::convertToDto) // Cette ligne est correcte, mais l'erreur peut venir d'ailleurs.
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel de l'API de recommandation Python : " + e.getMessage());
            // Retourne une liste vide en cas d'erreur
            return Collections.emptyList();
        }

        return Collections.emptyList();
    }

    /**
     * Méthode utilitaire pour convertir une entité Event en EventDto.
     * Cette méthode doit être définie dans la même classe que le service.
     * Le code a été mis à jour pour correspondre à votre EventDto.
     */
    private EventDto convertToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setTitre(event.getTitre());
        dto.setDescription(event.getDescription());
        dto.setDateDebut(event.getDateDebut());
        dto.setDateFin(event.getDateFin());
        dto.setHeureDebut(event.getHeureDebut());
        dto.setDateLimiteInscription(event.getDateLimiteInscription());
        dto.setAdresse(event.getAdresse());
        dto.setPrix(event.getPrix());

        dto.setCapaciteMax(event.getCapaciteMax());
        dto.setNombreInscriptions(event.getNombreInscriptions());
        dto.setImage(event.getImage());
        dto.setOrganizerId(event.getOrganizer().getId());


        return dto;
    }
}