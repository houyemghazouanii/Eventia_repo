package Eventia.EventIA;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.event.enums.EventStatut;
import Eventia.EventIA.event.exception.EventAlreadyExistsException;
import Eventia.EventIA.event.exception.EventNotFoundException;
import Eventia.EventIA.event.repository.EventRepository;
import Eventia.EventIA.event.service.EventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    private Event sampleEvent;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        sampleEvent = new Event();
        sampleEvent.setId(1L);
        sampleEvent.setTitre("Concert");
        sampleEvent.setDescription("Sample desc");
        sampleEvent.setDateDebut(LocalDate.now());
        sampleEvent.setDateFin(LocalDate.now().plusDays(1));
        sampleEvent.setStatut(EventStatut.ACTIVE);
    }

    @Test
    void testAddEventSuccess() {
        when(eventRepository.findByTitre("Concert")).thenReturn(Optional.empty());
        when(eventRepository.save(sampleEvent)).thenReturn(sampleEvent);

        Event result = eventService.addEvent(sampleEvent);

        assertNotNull(result);
        assertEquals("Concert", result.getTitre());
        verify(eventRepository, times(1)).save(sampleEvent);
    }

    @Test
    void testAddEventAlreadyExists() {
        when(eventRepository.findByTitre("Concert")).thenReturn(Optional.of(sampleEvent));

        assertThrows(EventAlreadyExistsException.class, () -> eventService.addEvent(sampleEvent));
        verify(eventRepository, never()).save(sampleEvent);
    }

    @Test
    void testGetEvents() {
        when(eventRepository.findAll()).thenReturn(List.of(sampleEvent));
        List<Event> events = eventService.getEvents();
        assertEquals(1, events.size());
    }

    @Test
    void testGetEventByIdFound() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));
        Event result = eventService.getEventById(1L);
        assertEquals("Concert", result.getTitre());
    }

    @Test
    void testGetEventByIdNotFound() {
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EventNotFoundException.class, () -> eventService.getEventById(1L));
    }

    @Test
    void testDeleteEventSuccess() {
        when(eventRepository.existsById(1L)).thenReturn(true);
        doNothing().when(eventRepository).deleteById(1L);

        eventService.deleteEvent(1L);
        verify(eventRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteEventNotFound() {
        when(eventRepository.existsById(1L)).thenReturn(false);
        assertThrows(EventNotFoundException.class, () -> eventService.deleteEvent(1L));
    }

    @Test
    void testAutoArchiveEvents() {
        when(eventRepository.archiveExpiredEvents(any())).thenReturn(2);
        eventService.autoArchiveEvents();
        verify(eventRepository, times(1)).archiveExpiredEvents(any());
    }

    @Test
    void testUpdateEventSuccess() {
        Event updatedEvent = new Event();
        updatedEvent.setTitre("New Concert");
        updatedEvent.setDescription("Updated desc");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));
        when(eventRepository.save(any(Event.class))).thenReturn(updatedEvent);

        Event result = eventService.updateEvent(updatedEvent, 1L);
        assertEquals("New Concert", result.getTitre());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void testUpdateEventNotFound() {
        Event updatedEvent = new Event();
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EventNotFoundException.class,
                () -> eventService.updateEvent(updatedEvent, 1L));
    }
}


