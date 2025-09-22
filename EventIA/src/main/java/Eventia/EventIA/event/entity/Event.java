package Eventia.EventIA.event.entity;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.event.enums.EventStatut;
import Eventia.EventIA.event.enums.Type;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;


import java.time.LocalDate;

@Entity
@Table(name = "events")
@Data
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "La date de début est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin;

    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime heureDebut;


    @NotNull(message = "La date limite d'inscription est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateLimiteInscription;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotNull(message = "Le prix est obligatoire")
    private Double prix;

    @Enumerated(EnumType.STRING) // Stocker l'enum comme String dans la DB
    @NotNull(message = "Le type d'événement est obligatoire")
    private Type type;

    @Enumerated(EnumType.STRING) // Stocker l'enum comme String dans la DB
    @NotNull(message = "Le statut de l'événement est obligatoire")
    private EventStatut statut;

    @Min(value = 1, message = "La capacité doit être au moins 1")
    @NotNull(message = "La capacité maximale est obligatoire")
    private Integer capaciteMax;

    private Integer nombreInscriptions =0 ;

    @Lob
    private String image; // Image encodée en Base64

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    @JsonBackReference
    @NotNull(message = "L'organisateur est obligatoire")
    private User organizer;
    private Long ticketTemplateId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String ticketTemplateParams;



    public Event() {

    }
}