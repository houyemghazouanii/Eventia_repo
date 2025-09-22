package Eventia.EventIA.preference;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/preferences")
@RequiredArgsConstructor
public class PreferenceController {

    private final PreferenceService preferenceService;

    // 🔹 GET : récupérer préférences par participant
    @GetMapping("/{participantId}")
    public ResponseEntity<PreferenceDto> getPreferences(@PathVariable Long participantId) {
        PreferenceDto dto = preferenceService.getPreferencesByParticipant(participantId);
        return ResponseEntity.ok(dto);
    }

    // 🔹 POST : créer ou mettre à jour préférences d’un participant
    @PostMapping("/{participantId}")
    public ResponseEntity<PreferenceDto> savePreferences(
            @PathVariable Long participantId,
            @RequestBody PreferenceDto dto) {
        PreferenceDto saved = preferenceService.savePreferences(participantId, dto);
        return ResponseEntity.ok(saved);
    }
}
