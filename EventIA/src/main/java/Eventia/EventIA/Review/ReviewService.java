package Eventia.EventIA.Review;


import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.repository.EventRepository;
import Eventia.EventIA.reservation.ReservationRepository;
import Eventia.EventIA.reservation.StatutReservation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    private final RestTemplate restTemplate;
    private final String SENTIMENT_API_URL = "http://localhost:5000/sentiment/reviews";

    // Ajouter un avis
    public Review addReview(Long participantId, Long eventId, int rating, String comment) {
        // Vérifier que l'utilisateur existe et est un participant
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant introuvable"));

        if (participant.getRole() != Role.USER) {
            throw new IllegalStateException("Seuls les participants peuvent donner un avis.");
        }

        // Vérifier que le participant a une réservation PAYEE
        boolean aPaye = reservationRepository.existsByParticipant_IdAndEvent_IdAndStatut(
                participantId, eventId, StatutReservation.PAYEE);

        if (!aPaye) {
            throw new IllegalStateException("Vous devez payer cet événement avant de donner un avis.");
        }

        // Vérifier si déjà évalué
        if (reviewRepository.existsByParticipantIdAndEventId(participantId, eventId)) {
            throw new IllegalStateException("Vous avez déjà évalué cet événement.");
        }

        // Vérifier que l'événement existe
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable"));

        // Créer et sauvegarder l'avis
        Review review = new Review();
        review.setParticipant(participant);
        review.setEvent(event);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }
    // Récupérer tous les avis d'un événement avec sentiment depuis Flask
    public List<ReviewDto> getReviewsByEventWithSentiment(Long eventId) {
        List<Review> reviews = reviewRepository.findByEventId(eventId);

        // Appel à l’API Flask pour récupérer les sentiments
        String url = SENTIMENT_API_URL + "/" + eventId;
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        // Map des sentiments par participant_id + comment (pour matcher avec Spring)
        Map<String, String> sentimentsMap = new HashMap<>();
        if (response != null && response.containsKey("reviews")) {
            List<Map<String, Object>> flaskReviews = (List<Map<String, Object>>) response.get("reviews");
            for (Map<String, Object> r : flaskReviews) {
                Long participantIdFlask = ((Number) r.get("participant_id")).longValue();
                String commentFlask = (String) r.get("comment");
                String sentiment = (String) r.get("sentiment");
                // clé = participantId + comment pour matcher
                sentimentsMap.put(participantIdFlask + "||" + commentFlask, sentiment);
            }
        }

        // Convertir en DTO
        return reviews.stream().map(r -> {
            ReviewDto dto = new ReviewDto();
            dto.setId(r.getId());
            dto.setRating(r.getRating());
            dto.setComment(r.getComment());
            dto.setCreatedAt(r.getCreatedAt().toString());
            dto.setParticipantNomPrenom(r.getParticipant().getNom() + " " + r.getParticipant().getPrenom());
            dto.setEventTitre(r.getEvent().getTitre());

            // Ajouter sentiment récupéré depuis Flask
            String key = r.getParticipant().getId() + "||" + r.getComment();
            dto.setSentiment(sentimentsMap.getOrDefault(key, "Neutre"));

            return dto;
        }).toList();
    }



    // Récupérer tous les avis d'un événement
    public List<Review> getReviewsByEvent(Long eventId) {
        return reviewRepository.findByEventId(eventId);
    }

    // Moyenne des notes d'un événement
    public Double getAverageRating(Long eventId) {
        return reviewRepository.findAverageRatingByEvent(eventId);
    }

    // Récupérer l'ID d'un participant connecté via son email
    public Long getParticipantIdByEmail(String email) {
        User participant = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec cet email : " + email));

        if (participant.getRole() != Role.USER) {
            throw new IllegalStateException("Seuls les participants peuvent donner un avis.");
        }

        return participant.getId();
    }
    public void deleteReview(Long reviewId, Long organizerId) {
        if (reviewId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'id de l'avis ne peut pas être null");
        }
        if (organizerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'id de l'organisateur ne peut pas être null");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avis introuvable"));

        Event event = review.getEvent();

        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer cet avis.");
        }

        reviewRepository.delete(review);
    }

}