package Eventia.EventIA.event.controller;

import Eventia.EventIA.Ticket.ApplyTemplateRequest;
import Eventia.EventIA.Ticket.TemplateRenderService;
import Eventia.EventIA.Ticket.TicketTemplate;
import Eventia.EventIA.Ticket.TicketTemplateRepository;
import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.exception.ResourceNotFoundException;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.dto.EventDto;
import Eventia.EventIA.event.dto.EventMapper;
import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.enums.EventStatut;
import Eventia.EventIA.event.enums.Type;
import Eventia.EventIA.event.exception.EventAlreadyExistsException;
import Eventia.EventIA.event.exception.EventNotFoundException;
import Eventia.EventIA.event.repository.EventRepository;
import Eventia.EventIA.event.service.AdminStatsService;
import Eventia.EventIA.event.service.EventService;
import Eventia.EventIA.event.service.StatsService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalTime;

@RestController
@RequestMapping("/events")
@CrossOrigin("http://localhost:3000")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketTemplateRepository templateRepo;

    @Autowired
    private TemplateRenderService renderService;

    @Autowired

    private ObjectMapper objectMapper;

    @Autowired
    private StatsService statsService;

    @Autowired
    private AdminStatsService adminStatsService;

    private final RestTemplate restTemplate;
    private final String flaskBaseUrl = "http://localhost:5000";

    public EventController(EventService eventService,
                           UserRepository userRepository,
                           RestTemplate restTemplate) {
        this.eventService = eventService;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate; // ✅ injecté par Spring
    }

    // Récupérer tous les événements
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        List<EventDto> dtos = events.stream()
                .map(EventMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

   // Récupérer uniquement les événements validés (ACTIVE) pour affichage public
    @GetMapping("/public/events")
    public ResponseEntity<List<EventDto>> getPublicEvents() {
        List<Event> events = eventRepository.findByStatut(EventStatut.ACTIVE);
        
        // Vérification de debug
        events.forEach(e -> System.out.println("Événement visible publiquement : " + e.getTitre() + " - " + e.getStatut()));

        List<EventDto> dtos = events.stream()
                .map(EventMapper::toDTO)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    //  Récupérer un événement par ID
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEvenementById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(EventMapper.toDTO(event));
    }

    //  Ajouter un event par un admin
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping 
    public ResponseEntity<EventDto> createEvenement(
            @RequestParam String titre,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateLimiteInscription,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDebut,
            @RequestParam String adresse,
            @RequestParam Double prix,
            @RequestParam Type type,
            @RequestParam EventStatut statut,
            @RequestParam Integer capaciteMax,
            @RequestParam Long organizerId,
            @RequestParam("image") MultipartFile imageFile
    ) {
        try {
            User organizer = userRepository.findById(organizerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Organisateur non trouvé avec l'ID: " + organizerId));

            // Vérification du rôle de l'organisateur
            if (organizer.getRole() != Role.ORGANIZER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
            }

            Event event = new Event();
            event.setTitre(titre);
            event.setDescription(description);
            event.setDateDebut(dateDebut);
            event.setDateFin(dateFin);
            event.setDateLimiteInscription(dateLimiteInscription);
            event.setHeureDebut(heureDebut);
            event.setAdresse(adresse);
            event.setPrix(prix);
            event.setType(type);
            event.setStatut(statut);
            event.setCapaciteMax(capaciteMax);

            if (imageFile != null && !imageFile.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                Path path = Paths.get("uploads/images/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, imageFile.getBytes());
                event.setImage(fileName);
            }

            event.setOrganizer(organizer);

            Event savedEvent = eventService.addEvent(event);

            return ResponseEntity.status(HttpStatus.CREATED).body(EventMapper.toDTO(savedEvent));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (EventAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    //update event

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvenement(
            @PathVariable Long id,
            @RequestParam String titre,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateLimiteInscription,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDebut,
            @RequestParam String adresse,
            @RequestParam Double prix,
            @RequestParam Type type,
            @RequestParam EventStatut statut,
            @RequestParam Integer capaciteMax,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            Principal principal
    ) {
        try {
            Event existingEvent = eventService.getEventById(id);
            User organizer = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

            if (organizer.getRole() == Role.ORGANIZER &&
                    !existingEvent.getOrganizer().getId().equals(organizer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // 🔹 Sauvegarde anciennes valeurs
            String oldAdresse = existingEvent.getAdresse();
            LocalDate oldDateDebut = existingEvent.getDateDebut();
            LocalDate oldDateFin = existingEvent.getDateFin();
            EventStatut oldStatut = existingEvent.getStatut();

            // 🔹 Mise à jour des champs
            existingEvent.setTitre(titre);
            existingEvent.setDescription(description);
            existingEvent.setDateDebut(dateDebut);
            existingEvent.setDateFin(dateFin);
            existingEvent.setDateLimiteInscription(dateLimiteInscription);
            existingEvent.setHeureDebut(heureDebut);
            existingEvent.setAdresse(adresse);
            existingEvent.setPrix(prix);
            existingEvent.setType(type);
            existingEvent.setStatut(statut);
            existingEvent.setCapaciteMax(capaciteMax);

            if (imageFile != null && !imageFile.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                Path path = Paths.get("uploads/images/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, imageFile.getBytes());
                existingEvent.setImage(fileName);
            }

            existingEvent.setOrganizer(organizer);
            Event updatedEvent = eventService.updateEvent(existingEvent, id);

            // 🔹 Vérifier champs modifiés
            List<String> champsModifies = new ArrayList<>();
            if (!Objects.equals(oldAdresse, adresse)) champsModifies.add("adresse");
            if (!Objects.equals(oldDateDebut, dateDebut)) champsModifies.add("date_debut");
            if (!Objects.equals(oldDateFin, dateFin)) champsModifies.add("date_fin");
            if (!Objects.equals(oldStatut, statut)) champsModifies.add("statut");

            // 🔹 Envoi des notifications à Flask si nécessaire
            if (!champsModifies.isEmpty()) {
                System.out.println("✅ Envoi notification Flask pour event " + updatedEvent.getId() + " champs: " + champsModifies);
                String url = flaskBaseUrl + "/notifications/event-updated";

                Map<String, Object> body = new HashMap<>();
                body.put("event_id", updatedEvent.getId());
                body.put("champs_modifies", champsModifies);

                // Anciennes valeurs à envoyer à Flask
                Map<String, Object> anciennesValeurs = new HashMap<>();
                if (champsModifies.contains("adresse")) anciennesValeurs.put("adresse", oldAdresse);
                if (champsModifies.contains("date_debut") && oldDateDebut != null)
                    anciennesValeurs.put("date_debut", oldDateDebut.toString());
                if (champsModifies.contains("date_fin") && oldDateFin != null)
                    anciennesValeurs.put("date_fin", oldDateFin.toString());
                if (champsModifies.contains("statut") && oldStatut != null)
                    anciennesValeurs.put("statut", oldStatut.toString());

                body.put("anciennes_valeurs", anciennesValeurs);

                restTemplate.postForObject(url, body, Void.class);
            }

            return ResponseEntity.ok(EventMapper.toDTO(updatedEvent));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }



    // ------------------ PATCH adresse uniquement ------------------
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PatchMapping("/{id}/adresse")
    public ResponseEntity<EventDto> patchAdresse(
            @PathVariable Long id,
            @RequestParam String adresse,
            Principal principal
    ) {
        try {
            Event existingEvent = eventService.getEventById(id);

            User organizer = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

            if (organizer.getRole() == Role.ORGANIZER &&
                    !existingEvent.getOrganizer().getId().equals(organizer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            String oldAdresse = existingEvent.getAdresse();
            existingEvent.setAdresse(adresse);
            Event updatedEvent = eventService.updateEvent(existingEvent, id);

            if (!Objects.equals(oldAdresse, adresse)) {
                Map<String, Object> body = new HashMap<>();
                body.put("event_id", updatedEvent.getId());
                body.put("champs_modifies", List.of("adresse"));
                restTemplate.postForObject(flaskBaseUrl + "/notifications/event-updated", body, Void.class);
            }

            return ResponseEntity.ok(EventMapper.toDTO(updatedEvent));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    // Supprimer un événement
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvenement(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (EventNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Valider un événement
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/events/{id}/approve")
    public ResponseEntity<?> approveEvent(@PathVariable Long id) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            event.setStatut(EventStatut.ACTIVE);
            eventRepository.save(event);
            return ResponseEntity.ok("Événement approuvé avec succès !");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Événement introuvable !");
        }
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/upload-test")
    public ResponseEntity<String> uploadTest(@RequestParam("image") MultipartFile imageFile) {
        System.out.println("Fichier reçu: " + imageFile.getOriginalFilename());
        return ResponseEntity.ok("Upload OK");
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @GetMapping("/users/organizers/{organizerId}/events")
    public ResponseEntity<List<EventDto>> getEventsByOrganizer(
            @PathVariable Long organizerId,
            Authentication authentication
    ) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(organizerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("Organisateur non trouvé"));

        List<Event> events = eventRepository.findByOrganizer(organizer);

        List<EventDto> dtos = events.stream().map(event -> {
            EventDto dto = EventMapper.toDTO(event);

            if (event.getTicketTemplateId() != null) {
                TicketTemplate tpl = templateRepo.findById(event.getTicketTemplateId()).orElse(null);
                if (tpl != null) {
                    Map<String, Object> params = new HashMap<>();
                    try {
                        if (event.getTicketTemplateParams() != null && !event.getTicketTemplateParams().isBlank()) {
                            params = objectMapper.readValue(
                                    event.getTicketTemplateParams(),
                                    new TypeReference<Map<String, Object>>() {}
                            );
                        }
                    } catch (Exception e) {
                        e.printStackTrace(); // à remplacer par un logger
                    }

                    String renderedHtml = renderService.render(tpl.getTemplateHtml(), event, params);
                    dto.setTicketHtml(renderedHtml);
                }
            }

            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }



    // Récupére tous les types
    @GetMapping("/types")
    public List<String> getEventTypes() {
        return Arrays.stream(Type.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ORGANIZER')")
    @PostMapping("/organizer/events")
    public ResponseEntity<?> createEventForOrganizer(
            @RequestParam String titre,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateLimiteInscription,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDebut,
            @RequestParam String adresse,
            @RequestParam Double prix,
            @RequestParam Type type,
            @RequestParam EventStatut statut,
            @RequestParam Integer capaciteMax,
            @RequestParam("image") MultipartFile imageFile,
            Authentication authentication
    ) {
        try {
            String emailOrganisateur = authentication.getName();
            User organizer = userRepository.findByEmail(emailOrganisateur)
                    .orElseThrow(() -> new ResourceNotFoundException("Organisateur non trouvé : " + emailOrganisateur));

            if (organizer.getRole() != Role.ORGANIZER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Event event = new Event();
            event.setTitre(titre);
            event.setDescription(description);
            event.setDateDebut(dateDebut);
            event.setDateFin(dateFin);
            event.setDateLimiteInscription(dateLimiteInscription);
            event.setHeureDebut(heureDebut);
            event.setAdresse(adresse);
            event.setPrix(prix);
            event.setType(type);
            event.setStatut(statut);
            event.setCapaciteMax(capaciteMax);

            if (imageFile != null && !imageFile.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                Path path = Paths.get("uploads/images/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, imageFile.getBytes());
                event.setImage(fileName);
            }

            event.setOrganizer(organizer);

            Event savedEvent = eventService.addEvent(event);

            return ResponseEntity.status(HttpStatus.CREATED).body(EventMapper.toDTO(savedEvent));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur lors de la création de l'événement");
        }
    }


    // L'organisateur supprime un événement encore DRAFT pas validé encore par admin
    @PreAuthorize("hasRole('ORGANIZER')")
    @DeleteMapping("/organizer/events/{id}")
    public ResponseEntity<?> deleteDraftEventByOrganizer(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();

            User currentOrganizer = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Organisateur non trouvé"));

            Event event = eventRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Événement non trouvé"));

            // 🔒 Vérifier que l'événement appartient à cet organisateur
            if (!event.getOrganizer().getId().equals(currentOrganizer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Vous n'avez pas le droit de supprimer cet événement.");
            }

            // ❌ Interdire la suppression si ce n'est pas un brouillon
            if (event.getStatut() != EventStatut.DRAFT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Seuls les événements en brouillon peuvent être supprimés.");
            }

            // ✅ Supprimer
            eventRepository.delete(event);
            return ResponseEntity.ok("Événement supprimé avec succès !");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Événement introuvable !");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression.");
        }
    }

    // Archiver un événement par organisateur pas suppression
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archiveEvent(@PathVariable Long id) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            event.setStatut(EventStatut.ARCHIVED);
            eventRepository.save(event);
            return ResponseEntity.ok("Événement archivé !");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Événement introuvable !");
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleArchivedActive(@PathVariable Long id) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Événement introuvable !");
        }

        Event event = optionalEvent.get();
        if (event.getStatut() == EventStatut.ARCHIVED) {
            event.setStatut(EventStatut.ACTIVE);
        } else if (event.getStatut() == EventStatut.ACTIVE) {
            event.setStatut(EventStatut.ARCHIVED);
        } else {
            return ResponseEntity.badRequest().body("Seuls les événements 'ARCHIVED' ou 'ACTIVE' peuvent être changés.");
        }

        eventRepository.save(event);
        return ResponseEntity.ok("Statut mis à jour avec succès !");
    }


    // Annuler un événement par organisateur pas suppression
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelEvent(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        if (event == null) {
            return ResponseEntity.notFound().build();
        }

        System.out.println("Statut actuel de l'événement : " + event.getStatut());

        if (event.getStatut() != EventStatut.ACTIVE && event.getStatut() != EventStatut.DRAFT) {
            return ResponseEntity.badRequest().body("Seuls les événements en statut 'Brouillon' ou 'Actif' peuvent être annulés.");
        }

        event.setStatut(EventStatut.CANCELLED);
        eventService.updateEvent(event, event.getId());

        return ResponseEntity.ok("Événement annulé avec succès.");
    }



    // Appliquer modèle à l'événement (sauvegarde)

    @PostMapping("/{eventId}/template")
    public ResponseEntity<?> applyTemplateToEvent(@PathVariable Long eventId,
                                                  @RequestBody ApplyTemplateRequest req) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));

        TicketTemplate template = templateRepo.findById(req.getTemplateId())
                .orElseThrow(() -> new RuntimeException("Modèle introuvable"));

        event.setTicketTemplateId(template.getId());

        try {
            event.setTicketTemplateParams(req.getParams() != null ? objectMapper.writeValueAsString(req.getParams()) : "{}");
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(500).body("Erreur conversion JSON");
        }

        eventRepository.save(event);

        return ResponseEntity.ok(event);
    }
    @PostMapping("/{eventId}/template/preview")
    public ResponseEntity<?> previewTemplate(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));
        if (event.getTicketTemplateId() == null) {
            return ResponseEntity.badRequest().body("Aucun modèle de billet associé");
        }
        TicketTemplate template = templateRepo.findById(event.getTicketTemplateId())
                .orElseThrow(() -> new RuntimeException("Modèle introuvable"));
        Map<String, Object> rawParams = new HashMap<>();
        try {
            String jsonParams = event.getTicketTemplateParams();
            if (jsonParams != null && !jsonParams.trim().isEmpty()) {
                rawParams = objectMapper.readValue(jsonParams, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // On passe directement rawParams, pas besoin de convertir en Map<String,String>
        String html = renderService.render(template.getTemplateHtml(), event, rawParams);

        return ResponseEntity.ok(html);
    }

    // Dissocier modèle d'un événement
    @DeleteMapping("/{eventId}/template")
    public ResponseEntity<?> removeTemplateFromEvent(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));

        event.setTicketTemplateId(null);
        event.setTicketTemplateParams(null);

        eventRepository.save(event);

        return ResponseEntity.noContent().build();
    }


    // Récupérer les statistiques d'un organisateur
    @GetMapping("/users/organizers/{organizerId}/stats")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getOrganizerStats(
            @PathVariable Long organizerId,
            Authentication authentication
    ) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier rôle ORGANIZER
        if (currentUser.getRole() == Role.ORGANIZER) {
            if (!currentUser.getId().equals(organizerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès refusé"));
            }
        }

        Map<String, Object> stats = statsService.getOrganizerStats(organizerId);
        return ResponseEntity.ok(stats);
    }

    // ✅ Nouveau : statistiques globales admin
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = adminStatsService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

}
