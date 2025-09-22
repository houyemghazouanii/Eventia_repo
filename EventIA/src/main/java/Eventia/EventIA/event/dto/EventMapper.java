package Eventia.EventIA.event.dto;

import Eventia.EventIA.event.entity.Event;

public class EventMapper {

    public static EventDto toDTO(Event event) {
        if (event == null) {
            return null;
        }

        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setTitre(event.getTitre());
        dto.setDescription(event.getDescription());
        dto.setDateDebut(event.getDateDebut());
        dto.setDateFin(event.getDateFin());
        dto.setHeureDebut(event.getHeureDebut());
        dto.setAdresse(event.getAdresse());
        dto.setType(event.getType());
        dto.setStatut(event.getStatut());
        dto.setCapaciteMax(event.getCapaciteMax());
        dto.setNombreInscriptions(event.getNombreInscriptions());
        dto.setPrix(event.getPrix());
        dto.setDateLimiteInscription(event.getDateLimiteInscription());
        dto.setImage(event.getImage());  // nom du fichier image
        dto.setTicketTemplateId(event.getTicketTemplateId());
        dto.setTicketTemplateParams(event.getTicketTemplateParams());

        dto.setOrganizerId(
                event.getOrganizer() != null ? event.getOrganizer().getId() : null
        );

        // Pas besoin de dto.setImageUrl, car c’est un getter calculé

        return dto;
    }
}
