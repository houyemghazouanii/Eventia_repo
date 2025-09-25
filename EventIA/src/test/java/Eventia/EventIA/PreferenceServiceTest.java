package Eventia.EventIA;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.preference.Preference;
import Eventia.EventIA.preference.PreferenceDto;
import Eventia.EventIA.preference.PreferenceRepository;
import Eventia.EventIA.preference.PreferenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;


class PreferenceServiceTest {

    @Mock
    private PreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PreferenceService preferenceService;

    private User participant;
    private Preference preference;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        participant = new User();
        participant.setId(1L);
        participant.setNom("Doe");
        participant.setPrenom("John");
        participant.setEmail("john@example.com");

        preference = new Preference();
        preference.setId(1L);
        preference.setCategorie("Musique");
        preference.setLocalisation("Tunis");
        preference.setParticipant(participant);
    }

    @Test
    void testGetPreferencesByParticipantSuccess() {
        when(preferenceRepository.findByParticipantId(1L)).thenReturn(Optional.of(preference));

        PreferenceDto dto = preferenceService.getPreferencesByParticipant(1L);

        assertEquals("Musique", dto.getCategorie());
        assertEquals("Tunis", dto.getLocalisation());
        assertEquals("John", dto.getParticipantPrenom());
    }

    @Test
    void testGetPreferencesByParticipantNotFound() {
        when(preferenceRepository.findByParticipantId(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> preferenceService.getPreferencesByParticipant(1L));
    }

    @Test
    void testSavePreferencesNew() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(preferenceRepository.findByParticipantId(1L)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(Preference.class))).thenReturn(preference);

        PreferenceDto dtoInput = new PreferenceDto(null, "Musique", "Tunis", null, null, null, null);
        PreferenceDto dto = preferenceService.savePreferences(1L, dtoInput);

        assertEquals("Musique", dto.getCategorie());
        verify(preferenceRepository, times(1)).save(any(Preference.class));
    }
}

