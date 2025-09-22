package Eventia.EventIA.preference;



import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PreferenceService {

    private final PreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    // 🔹 Récupérer les préférences d’un participant
    public PreferenceDto getPreferencesByParticipant(Long participantId) {
        Preference preference = preferenceRepository.findByParticipantId(participantId)
                .orElseThrow(() -> new RuntimeException("Préférences non trouvées"));

        return new PreferenceDto(
                preference.getId(),
                preference.getCategorie(),
                preference.getBudget(),
                preference.getLocalisation(),
                preference.getParticipant().getId(),
                preference.getParticipant().getNom(),
                preference.getParticipant().getPrenom(),
                preference.getParticipant().getEmail()
        );
    }

    // 🔹 Créer ou mettre à jour les préférences d’un participant
    public PreferenceDto savePreferences(Long participantId, PreferenceDto dto) {
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant introuvable"));

        Preference preference = preferenceRepository.findByParticipantId(participantId)
                .orElse(new Preference());

        preference.setCategorie(dto.getCategorie());
        preference.setBudget(dto.getBudget());
        preference.setLocalisation(dto.getLocalisation());
        preference.setParticipant(participant);

        Preference saved = preferenceRepository.save(preference);

        return new PreferenceDto(
                saved.getId(),
                saved.getCategorie(),
                saved.getBudget(),
                saved.getLocalisation(),
                participant.getId(),
                participant.getNom(),
                participant.getPrenom(),
                participant.getEmail()
        );
    }
}
