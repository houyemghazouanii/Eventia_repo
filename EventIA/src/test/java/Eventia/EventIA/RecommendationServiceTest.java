package Eventia.EventIA;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import Eventia.EventIA.event.dto.EventDto;
import Eventia.EventIA.event.repository.EventRepository;
import Eventia.EventIA.recommandation.RecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;



class RecommendationServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private RestTemplate restTemplateMock;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        restTemplateMock = mock(RestTemplate.class);
        recommendationService = new RecommendationService();
    }

    @Test
    void testGetRecommendedEventsEmpty() {
        List<EventDto> events = recommendationService.getRecommendedEvents(1L);
        assertNotNull(events);
    }
}
