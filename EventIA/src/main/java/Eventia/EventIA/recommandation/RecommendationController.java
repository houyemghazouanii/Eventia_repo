package Eventia.EventIA.recommandation;

import Eventia.EventIA.event.dto.EventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<EventDto>> getRecommendedEvents(@PathVariable Long userId) {
        List<EventDto> recommendedEvents = recommendationService.getRecommendedEvents(userId);
        return ResponseEntity.ok(recommendedEvents);
    }
}