package Eventia.EventIA.event.service;

import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.enums.EventStatut;
import Eventia.EventIA.event.exception.EventAlreadyExistsException;
import Eventia.EventIA.event.exception.EventNotFoundException;
import Eventia.EventIA.event.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventService implements IEventService{

    @Autowired
    private EventRepository eventRepository;

    // ✅ Injection via le constructeur
    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }
    @Override
    public Event addEvent(Event event) {
        if (evenementAlreadyExists(event.getTitre())) {
            throw new EventAlreadyExistsException(event.getTitre() + " already exists!");
        }
        return eventRepository.save(event);
    }

    private boolean evenementAlreadyExists(String titre) {

        return eventRepository.findByTitre(titre).isPresent();
    }

    @Override
    public List<Event> getEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Event updateEvent(Event event, Long id) {

        return eventRepository.findById(id).map(ev -> {
            ev.setTitre(event.getTitre());
            ev.setDescription(event.getDescription());
            ev.setDateDebut(event.getDateDebut());
            ev.setDateFin(event.getDateFin());
            ev.setAdresse(event.getAdresse());
            ev.setType(event.getType());
            ev.setStatut(event.getStatut());
            ev.setCapaciteMax(event.getCapaciteMax());
            ev.setNombreInscriptions(event.getNombreInscriptions());
            ev.setHeureDebut(event.getHeureDebut());
            ev.setPrix(event.getPrix());
            ev.setDateLimiteInscription(event.getDateLimiteInscription());
            ev.setImage(event.getImage());
            ev.setOrganizer(event.getOrganizer());
            return eventRepository.save(ev);
        }).orElseThrow(() -> new EventNotFoundException("Sorry, this event could not be found"));
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Sorry, no event found with the id: " + id));
    }
    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EventNotFoundException("Sorry, event not found");
        }
        // Deleting the event
        eventRepository.deleteById(id);

    }

    // Méthode appelée automatiquement chaque jour à 2h du matin
    @Scheduled(cron = "0 0 2 * * ?")
    public void autoArchiveEvents() {
        LocalDate today = LocalDate.now();
        int count = eventRepository.archiveExpiredEvents(today);
        System.out.println("✅ " + count + " événements archivés automatiquement.");
    }
}

