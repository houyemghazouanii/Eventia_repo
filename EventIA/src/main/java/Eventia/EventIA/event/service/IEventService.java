package Eventia.EventIA.event.service;

import Eventia.EventIA.event.entity.Event;

import java.util.List;

public interface IEventService {

    Event addEvent(Event event);

    List<Event> getEvents();

    Event updateEvent(Event event, Long id);

    Event getEventById(Long id);

    void deleteEvent(Long id);
}
