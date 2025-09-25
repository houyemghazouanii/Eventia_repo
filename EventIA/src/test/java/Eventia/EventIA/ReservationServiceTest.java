package Eventia.EventIA;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.repository.EventRepository;
import Eventia.EventIA.reservation.Reservation;
import Eventia.EventIA.reservation.ReservationRepository;
import Eventia.EventIA.reservation.ReservationService;
import Eventia.EventIA.reservation.StatutReservation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;



class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User participant;
    private Event event;
    private Reservation reservation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        participant = new User();
        participant.setId(1L);
        participant.setNom("Doe");
        participant.setPrenom("John");

        event = new Event();
        event.setId(1L);
        event.setTitre("Concert");
        event.setPrix(50.0); // essentiel pour le calcul prixTotal

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setParticipant(participant);
        reservation.setEvent(event);
        reservation.setQuantite(2);
        reservation.setPrixTotal(100.0);
        reservation.setDateReservation(LocalDateTime.now());
        reservation.setStatut(StatutReservation.EN_ATTENTE);
    }

    @Test
    void testCreateReservationSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(reservationRepository.existsByParticipantIdAndEventId(1L, 1L)).thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        Reservation res = reservationService.createReservation(1L, 1L, 2);

        assertNotNull(res);
        assertEquals(100.0, res.getPrixTotal(), 0.001);
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void testCreateReservationAlreadyExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(reservationRepository.existsByParticipantIdAndEventId(1L, 1L)).thenReturn(true);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> reservationService.createReservation(1L, 1L, 2));
        assertEquals("Vous avez déjà réservé cet événement.", exception.getMessage());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void testCreateReservationInvalidQuantity() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> reservationService.createReservation(1L, 1L, 0));
        assertEquals("La quantité doit être entre 1 et 3.", ex.getMessage());
    }

    @Test
    void testFindByIdFound() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        Reservation res = reservationService.findById(1L);
        assertNotNull(res);
        assertEquals(1L, res.getId());
    }

    @Test
    void testFindByIdNotFound() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());
        assertNull(reservationService.findById(1L));
    }

    @Test
    void testDeleteById() {
        doNothing().when(reservationRepository).deleteById(1L);
        reservationService.deleteById(1L);
        verify(reservationRepository, times(1)).deleteById(1L);
    }

    @Test
    void testFindPendingByUser() {
        when(reservationRepository.findByParticipant_IdAndStatut(1L, StatutReservation.EN_ATTENTE))
                .thenReturn(List.of(reservation));

        List<Reservation> pending = reservationService.findPendingByUser(1L);
        assertEquals(1, pending.size());
        assertEquals(StatutReservation.EN_ATTENTE, pending.get(0).getStatut());
    }
}
