package Eventia.EventIA.preference;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PreferenceDto {
    private Long id;
    private String categorie;
    private String budget;
    private String localisation;
    private Long participantId;
    private String participantNom;
    private String participantPrenom;
    private String participantEmail;
}