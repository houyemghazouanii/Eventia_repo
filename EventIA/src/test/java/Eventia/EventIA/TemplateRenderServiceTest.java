package Eventia.EventIA;

import Eventia.EventIA.Ticket.TemplateRenderService;
import Eventia.EventIA.event.entity.Event;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TemplateRenderServiceTest {

    private TemplateRenderService templateRenderService;

    @BeforeEach
    void setUp() {
        templateRenderService = new TemplateRenderService();
    }

    @Test
    void testRenderTemplate() {
        Event event = new Event();
        event.setTitre("Concert");
        event.setDescription("Super concert");

        String template = "<h1>{{titre}}</h1><p>{{description}}</p>";
        String result = templateRenderService.render(template, event, null);

        assertTrue(result.contains("Concert"));
        assertTrue(result.contains("Super concert"));
    }

    @Test
    void testRenderNullTemplate() {
        Event event = new Event();
        String result = templateRenderService.render(null, event, null);
        assertEquals("", result);
    }

    @Test
    void testRenderWithParams() {
        Event event = new Event();
        event.setTitre("Titre1");
        Map<String, Object> params = Map.of("extra", "ValeurExtra");

        String template = "{{titre}} - {{extra}}";
        String result = templateRenderService.render(template, event, params);
        assertTrue(result.contains("Titre1"));
        assertTrue(result.contains("ValeurExtra"));
    }
}
