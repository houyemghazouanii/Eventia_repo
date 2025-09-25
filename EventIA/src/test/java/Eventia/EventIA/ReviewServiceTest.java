package Eventia.EventIA;

import Eventia.EventIA.Review.Review;
import Eventia.EventIA.Review.ReviewRepository;
import Eventia.EventIA.Review.ReviewService;
import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.repository.EventRepository;
import Eventia.EventIA.reservation.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ReviewService reviewService;

    private User participant;
    private Event event;
    private Review review;

    @BeforeEach
    void setUp() {
        participant = new User();
        participant.setId(1L);
        participant.setRole(Role.USER);

        event = new Event();
        event.setId(1L);

        review = new Review();
        review.setParticipant(participant);
        review.setEvent(event);
        review.setRating(5);
        review.setComment("Super !");
    }

    @Test
    void testAddReviewSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(reservationRepository.existsByParticipant_IdAndEvent_IdAndStatut(anyLong(), anyLong(), any()))
                .thenReturn(true);
        when(reviewRepository.existsByParticipantIdAndEventId(anyLong(), anyLong()))
                .thenReturn(false);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(reviewRepository.save(any())).thenReturn(review);

        Review r = reviewService.addReview(1L, 1L, 5, "Super !");
        assertNotNull(r);
        assertEquals(5, r.getRating());
    }

}

