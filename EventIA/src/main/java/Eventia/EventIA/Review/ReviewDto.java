package Eventia.EventIA.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDto {
    private Long id;
    private int rating;
    private String comment;
    private String participantNomPrenom;
    private String eventTitre;
    private String createdAt;
    private String sentiment;
}