package Eventia.EventIA.Review;

import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService reviewService;
    private final EventRepository eventRepository;
    private final ReviewRepository reviewRepository;


    // Ajouter un avis (participant)
    @PostMapping("/event/{eventId}")
    public ResponseEntity<?> addReview(
            @PathVariable Long eventId,
            @RequestBody ReviewDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            String email = userDetails.getUsername();
            Long participantId = reviewService.getParticipantIdByEmail(email);

            var review = reviewService.addReview(
                    participantId,
                    eventId,
                    dto.getRating(),
                    dto.getComment()
            );

            dto.setId(review.getId());
            dto.setCreatedAt(review.getCreatedAt().toString());
            dto.setParticipantNomPrenom(review.getParticipant().getNom() + " " + review.getParticipant().getPrenom());
            dto.setEventTitre(review.getEvent().getTitre());

            return ResponseEntity.status(HttpStatus.CREATED).body(dto);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Récupérer tous les avis d’un événement (organisateur ou participant)
    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getReviews(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Vérifier que l'événement existe
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Événement introuvable"));

            List<ReviewDto> dtos = reviewService.getReviewsByEventWithSentiment(eventId);

            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", reviewService.getAverageRating(eventId));
            response.put("reviews", dtos);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    // Supprimer un avis (seul l'organisateur de l'événement peut le faire)
    @DeleteMapping("/{reviewId}")
    public void deleteReview(
            @PathVariable Long reviewId,
            @RequestParam Long organizerId) {  // <- utiliser @RequestParam ici
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avis introuvable"));

        Event event = review.getEvent();

        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer cet avis.");
        }

        reviewRepository.delete(review);
    }


}
