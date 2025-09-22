package Eventia.EventIA.preference;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface PreferenceRepository extends JpaRepository<Preference, Long> {
    Optional<Preference> findByParticipantId(Long participantId);
    @Query("SELECT new Eventia.EventIA.preference.PreferenceDto(" +
            "p.id, p.categorie, p.budget, p.localisation, p.participant.id, p.participant.nom, p.participant.prenom, p.participant.email) " +
            "FROM Preference p")
    List<PreferenceDto> findAllPreferencesDto();
}