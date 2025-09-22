package Eventia.EventIA.reservation;

import Eventia.EventIA.Ticket.TemplateRenderService;
import Eventia.EventIA.Ticket.TicketTemplate;
import Eventia.EventIA.Ticket.TicketTemplateRepository;
import Eventia.EventIA.User.configuration.service.EmailService;
import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.TypeOrganisateur;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.repository.EventRepository;
import Eventia.EventIA.reservation.qrcode.PdfGeneratorService;
import Eventia.EventIA.reservation.qrcode.QRCodeService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketTemplateRepository templateRepo;

    @Autowired
    private QRCodeService qrCodeService;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TemplateRenderService renderService;

    @Autowired
    private ObjectMapper objectMapper; // ✅ ajouté

    // -------------------------
    // Réservation d’un événement
    // -------------------------
    @PostMapping
    public ResponseEntity<?> reserverEvenement(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long eventId = ((Number) body.get("eventId")).longValue();
        Integer quantite = ((Number) body.get("quantite")).intValue();

        if (quantite < 1 || quantite > 3) {
            return ResponseEntity.badRequest().body("Quantité invalide (doit être entre 1 et 3).");
        }

        String email = userDetails.getUsername();
        User participant = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        boolean existeDeja = reservationRepository.existsByParticipantIdAndEventId(participant.getId(), eventId);
        if (existeDeja) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Vous avez déjà réservé cet événement.");
        }

        Reservation reservation = reservationService.createReservation(participant.getId(), eventId, quantite);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    // -------------------------
    // Paiement + génération billet PDF
    // -------------------------
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payReservation(@PathVariable Long id) {
        try {
            // 1️⃣ Récupérer la réservation
            Reservation reservation = reservationService.findById(id);
            if (reservation == null)
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Réservation introuvable");

            if (reservation.getStatut() != StatutReservation.EN_ATTENTE)
                return ResponseEntity.badRequest().body("Réservation non éligible au paiement.");

            Event event = reservation.getEvent();
            int quantite = reservation.getQuantite();
            int anciennes = event.getNombreInscriptions() != null ? event.getNombreInscriptions() : 0;

            if (anciennes + quantite > event.getCapaciteMax())
                return ResponseEntity.badRequest().body("Capacité maximale atteinte.");

            // 2️⃣ Mettre à jour statut paiement et nombre d'inscriptions
            reservation.setStatut(StatutReservation.PAYEE);
            event.setNombreInscriptions(anciennes + quantite);
            eventRepository.save(event);

            // 3️⃣ Préparer template et paramètres
            String htmlRempli;
            byte[] pdfBillet;
            Map<String, Object> params = new HashMap<>();

            // 4️⃣ Récupérer organisateur et nom
            User organizer = event.getOrganizer();
            String organisateurNom = "N/A";
            if (organizer != null) {
                if (organizer.getTypeOrganisateur() == TypeOrganisateur.SOCIETE) {
                    organisateurNom = organizer.getNomSociete();
                } else {
                    organisateurNom = organizer.getNom() + " " + organizer.getPrenom();
                }
            }
            params.put("organisateurNom", organisateurNom);

            // 5️⃣ Si template défini
            if (event.getTicketTemplateId() != null) {
                TicketTemplate template = templateRepo.findById(event.getTicketTemplateId())
                        .orElseThrow(() -> new RuntimeException("Modèle introuvable"));

                // Paramètres JSON du template
                if (event.getTicketTemplateParams() != null && !event.getTicketTemplateParams().isBlank()) {
                    params.putAll(objectMapper.readValue(
                            event.getTicketTemplateParams(),
                            new com.fasterxml.jackson.core.type.TypeReference<Map<String,Object>>() {}
                    ));
                }

                // Infos participant
                User participant = reservation.getParticipant();
                params.put("participantNom", participant.getNom());
                params.put("participantPrenom", participant.getPrenom());
                params.put("participantTelephone", participant.getTelephone() != null ? participant.getTelephone() : "N/A");
                params.put("quantite", quantite);
                params.put("prixTotal", reservation.getPrixTotal());
                params.put("dateReservation", reservation.getDateReservation().toString());
                params.put("eventTitre", event.getTitre());

                // QR Code dynamique
                String qrText = String.format(
                        "EventIA|EventId:%d|ReservationId:%d|Nom:%s|Prenom:%s|Tel:%s|Email:%s",
                        event.getId(),
                        reservation.getId(),
                        participant.getNom(),
                        participant.getPrenom(),
                        participant.getTelephone() != null ? participant.getTelephone() : "N/A",
                        participant.getEmail()
                );
                byte[] qrCodeImageBytes = qrCodeService.generateQRCodeImage(qrText, 200, 200);
                String qrCodeBase64 = Base64.getEncoder().encodeToString(qrCodeImageBytes);
                params.put("qrCodeBase64", qrCodeBase64);

                // Générer PDF
                htmlRempli = renderService.render(template.getTemplateHtml(), event, params);
                pdfBillet = pdfGeneratorService.genererBilletPdf(htmlRempli);

            } else {
                // Template par défaut
                User participant = reservation.getParticipant();
                String contenuSimple = "<html><body>"
                        + "<h1>Billet pour " + event.getTitre() + "</h1>"
                        + "<p>Participant : " + participant.getNom() + " " + participant.getPrenom() + "</p>"
                        + "<p>Quantité : " + quantite + "</p>"
                        + "<p>Date de réservation : " + reservation.getDateReservation() + "</p>"
                        + "<p>Organisateur : " + organisateurNom + "</p>"
                        + "<p>Merci pour votre réservation !</p>"
                        + "</body></html>";

                pdfBillet = pdfGeneratorService.genererBilletPdf(contenuSimple);
            }

            // 6️⃣ Sauvegarder PDF
            reservation.setBilletPdf(pdfBillet);
            reservationService.save(reservation);

            // 7️⃣ Envoyer mail
            emailService.sendTicketEmail(reservation.getParticipant(), pdfBillet);

            // 8️⃣ Réponse frontend
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBillet);
            Map<String, Object> response = new HashMap<>();
            response.put("pdfBilletBase64", pdfBase64);
            response.put("message", "Paiement effectué et billet envoyé avec succès");

            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du paiement : " + ex.getMessage());
        }
    }




//    @PostMapping("/bulk-pay")
//    public ResponseEntity<?> reserverEtPayer(
//            @RequestBody List<Long> eventIds,
//            @AuthenticationPrincipal UserDetails userDetails) {
//
//        String email = userDetails.getUsername();
//        User participant = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
//
//        List<Reservation> reservations = new ArrayList<>();
//        List<String> erreurs = new ArrayList<>();
//
//        for (Long eventId : eventIds) {
//            try {
//                int quantite = 1;
//
//                Reservation res = reservationService.createReservation(participant.getId(), eventId, quantite);
//                Event event = res.getEvent();
//                int anciennes = event.getNombreInscriptions() != null ? event.getNombreInscriptions() : 0;
//
//                // ✅ Vérification de capacité
//                if (anciennes + quantite > event.getCapaciteMax()) {
//                    erreurs.add("Événement ID " + eventId + ": capacité maximale atteinte");
//                    continue;
//                }
//
//                res.setStatut(StatutReservation.PAYEE);
//                event.setNombreInscriptions(anciennes + quantite);
//
//                eventRepository.save(event);
//                reservationService.save(res);
//
//                reservations.add(res);
//            } catch (IllegalStateException ex) {
//                erreurs.add("Événement ID " + eventId + ": " + ex.getMessage());
//            } catch (Exception ex) {
//                erreurs.add("Événement ID " + eventId + ": Erreur interne");
//            }
//        }
//
//        return ResponseEntity.ok(Map.of(
//                "reservations", reservations,
//                "erreurs", erreurs
//        ));
//    }



    @GetMapping("/users/{userId}/pending")
    public ResponseEntity<List<Reservation>> getPendingReservationsByUser(@PathVariable("userId") Long participantId) {
        List<Reservation> reservations = reservationService.findPendingByUser(participantId);
        return ResponseEntity.ok(reservations);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Reservation reservation = reservationService.findById(id);
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        // Vérifier si l'utilisateur est autorisé à supprimer (ex: propriétaire)
        String email = userDetails.getUsername();
        if (!reservation.getParticipant().getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Non autorisé");
        }

        reservationService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/panier-valide/{userId}")
    public List<Long> getReservationsPanierValid(@PathVariable Long userId) {
        LocalDateTime limite = LocalDateTime.now().minusDays(1);
        List<Reservation> valides = reservationRepository
                .findByParticipantIdAndStatutAndDateReservationAfter(userId, StatutReservation.EN_ATTENTE, limite);

        return valides.stream().map(Reservation::getId).collect(Collectors.toList());
    }
    @GetMapping("/test-suppression")
    public void testSuppression() {
        reservationService.supprimerReservationsNonPayees();
    }

}
