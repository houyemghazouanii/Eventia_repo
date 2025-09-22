package Eventia.EventIA.User.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ParticipantHistoryDto {
    private String titre;
    private String organizerName;
    private LocalDate dateDebut;
    private LocalDateTime dateReservation;
    private String statut;


}
