package Eventia.EventIA.preference;


import Eventia.EventIA.User.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String categorie;   // Ex: Musique, Sport, Conférence
    private String budget;      // Ex: Gratuit, Payant
    private String localisation; // Ex: Tunis, Sfax...

    // Relation avec User (participant uniquement)
    @OneToOne
    @JoinColumn(name = "participant_id", referencedColumnName = "id")
    private User participant;
}
