package Eventia.EventIA.reservation;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.event.entity.Event;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateReservation;

    @Enumerated(EnumType.STRING)
    private StatutReservation statut;

    @ManyToOne
    @JoinColumn(name = "participant_id")
    private User participant;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(nullable = false)
    private int quantite;

    @Column(nullable = false)
    private double prixTotal;

    @Lob
    @Column(name = "billet_pdf", columnDefinition = "LONGBLOB")
    private byte[] billetPdf;

}