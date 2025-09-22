package Eventia.EventIA.User.entity;


import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.enums.Statut;
import Eventia.EventIA.User.enums.TypeOrganisateur;
import Eventia.EventIA.event.entity.Event;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Champs communs
    @NotBlank(message = "Le gouvernorat est obligatoire")
    @Size(max = 100, message = "Le gouvernorat ne doit pas dépasser 100 caractères")
    private String gouvernorat;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Le format de l'email est invalide")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^[0-9]{8,15}$", message = "Le numéro de téléphone est invalide")
    private String telephone;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Le rôle est obligatoire")
    private Role role;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Le statut est obligatoire")
    private Statut statut = Statut.DISABLED;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_organisateur", nullable = true)
    // @NotNull(message = "Le type d’organisateur est obligatoire")
    private TypeOrganisateur typeOrganisateur;

    // Champs spécifiques à PERSONNE
    private String nom;
    private String prenom;

    // Champ spécifique à SOCIETE
    private String nomSociete;
    // --- NOUVEAUX CHAMPS POUR LA VÉRIFICATION D'E-MAIL ---
    private boolean verified = false; // Par défaut, l'utilisateur n'est pas vérifié
    private String verificationToken;
    private LocalDateTime tokenExpiryDate; // Date d'expiration du jeton de vérification
   @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Event> organizedEvents = new ArrayList<>();

    // 🔍 Validation conditionnelle
    @AssertTrue(message = "Le nom et prénom sont requis pour un organisateur de type PERSONNE")
    public boolean isNomPrenomValideSiPersonne() {
        if (role != Role.ORGANIZER) return true; // ✅ pas concerné
        return typeOrganisateur != TypeOrganisateur.PERSONNE ||
                (nom != null && !nom.isEmpty() && prenom != null && !prenom.isEmpty());
    }

    @AssertTrue(message = "Le nom de la société est requis pour un organisateur de type SOCIETE")
    public boolean isNomSocieteValideSiSociete() {
        if (role != Role.ORGANIZER) return true; // ✅ pas concerné
        return typeOrganisateur != TypeOrganisateur.SOCIETE ||
                (nomSociete != null && !nomSociete.isEmpty());
    }
}
