package Eventia.EventIA.User.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ParticipantEventDto {
    private Long participantId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Long eventId;
    private String titreEvent;
    private LocalDate dateDebut;

    public ParticipantEventDto(Long participantId, String nom, String prenom,
                               String email, String telephone,
                               Long eventId, String titreEvent, LocalDate dateDebut) {
        this.participantId = participantId;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.eventId = eventId;
        this.titreEvent = titreEvent;
        this.dateDebut = dateDebut;
    }
}




