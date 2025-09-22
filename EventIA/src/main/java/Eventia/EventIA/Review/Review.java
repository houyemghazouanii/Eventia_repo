package Eventia.EventIA.Review;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.event.entity.Event;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(columnNames = {"participant_id", "event_id"})) // ⚡ empêche doublon
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating; // ⭐ 1-5
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private User participant;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
}

