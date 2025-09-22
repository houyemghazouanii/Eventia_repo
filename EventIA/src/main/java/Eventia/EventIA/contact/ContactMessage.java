package Eventia.EventIA.contact;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Data
public class ContactMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String email;
    private String sujet;

    @Column(length = 2000)
    private String message;

    private LocalDateTime dateEnvoi = LocalDateTime.now();
    private boolean lu = false; // si l'admin l'a lu

}

