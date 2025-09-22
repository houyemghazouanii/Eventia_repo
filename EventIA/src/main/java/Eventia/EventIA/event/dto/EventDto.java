package Eventia.EventIA.event.dto;

import Eventia.EventIA.event.enums.EventStatut;
import Eventia.EventIA.event.enums.Type;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {

    private Long id;

    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "La date de début est obligatoire")
    @FutureOrPresent(message = "La date de début doit être aujourd'hui ou dans le futur")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @FutureOrPresent(message = "La date de fin doit être aujourd'hui ou dans le futur")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin;

    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime heureDebut;

    @NotNull(message = "La date limite d'inscription est obligatoire")
    @FutureOrPresent(message = "La date limite d'inscription doit être aujourd'hui ou dans le futur")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateLimiteInscription;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix doit être positif ou nul")
    private Double prix;

    @NotNull(message = "Le type est obligatoire")
    private Type type;

    @NotNull(message = "Le statut est obligatoire")
    private EventStatut statut;

    @NotNull(message = "La capacité maximale est obligatoire")
    @Min(value = 1, message = "La capacité doit être au moins 1")
    private Integer capaciteMax;

    private Integer nombreInscriptions = 0;

    private String image;

    @NotNull(message = "L'ID de l'organisateur est obligatoire")
    private Long organizerId;

    private Long ticketTemplateId;


    private String ticketTemplateParams;
    private String ticketHtml;

    private Integer score;

    public String getImageUrl() {
        if (image != null && !image.isEmpty()) {
            // Replace with your actual base URL where images are served
            return "http://localhost:8080/images/" + image;
        }
        return null;
    }

    public EventDto(Long id, String titre, String description, LocalDate dateDebut, LocalDate dateFin,
                    LocalTime heureDebut, LocalDate dateLimiteInscription, String adresse, Double prix,
                    Type type, EventStatut statut, Integer capaciteMax, Integer nombreInscriptions,
                    String image, Long organizerId) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.heureDebut = heureDebut;
        this.dateLimiteInscription = dateLimiteInscription;
        this.adresse = adresse;
        this.prix = prix;
        this.type = type;
        this.statut = statut;
        this.capaciteMax = capaciteMax;
        this.nombreInscriptions = nombreInscriptions;
        this.image = image;
        this.organizerId = organizerId;
    }



}
