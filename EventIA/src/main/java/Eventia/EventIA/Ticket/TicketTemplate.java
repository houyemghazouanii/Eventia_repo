package Eventia.EventIA.Ticket;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "ticket_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du modèle est obligatoire")
    private String nom;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String templateHtml; // HTML avec placeholders {{titre}}, {{dateDebut}}, {{heureDebut}}, {{image}}, etc.

    @Lob
    @Column(columnDefinition = "TEXT")
    private String thumbnailBase64; // Image d'aperçu optionnelle

    @Lob
    @Column(columnDefinition = "TEXT")
    private String defaultParamsJson; // JSON string avec paramètres par défaut (bgColor, textColor…)
}

