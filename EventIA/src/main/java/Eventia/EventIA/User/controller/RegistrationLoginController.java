package Eventia.EventIA.User.controller;

import Eventia.EventIA.User.configuration.jwt.JwtUtils;
import Eventia.EventIA.User.configuration.service.EmailService;
import Eventia.EventIA.User.configuration.token.TokenGenerator;
import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.enums.Statut;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.User.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class RegistrationLoginController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService; // <-- Injectez EmailService

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Empêcher l'enregistrement si l'email est déjà utilisé
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cet email est déjà utilisé.");
        }

        // Afficher les données reçues pour debug
        System.out.println("DEBUG register - données reçues:");
        System.out.println("Email: " + user.getEmail());
        System.out.println("Role: " + user.getRole());
        System.out.println("TypeOrganisateur: " + user.getTypeOrganisateur());
        System.out.println("NomSociete: " + user.getNomSociete());
        System.out.println("Nom: " + user.getNom());
        System.out.println("Prenom: " + user.getPrenom());

        // Si le rôle est ADMIN, vérifier s'il y a déjà un admin dans la base
        if (user.getRole() == Role.ADMIN) {
            boolean adminExists = userRepository.findAll().stream()
                    .anyMatch(u -> u.getRole() == Role.ADMIN);
            if (adminExists) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Un administrateur existe déjà. Impossible d'en enregistrer un deuxième.");
            }
        }

        // Hacher le mot de passe
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // --- NOUVEAU : Initialiser les champs de vérification d'e-mail ---
        user.setVerified(false); // L'utilisateur n'est pas vérifié à l'inscription
        String verificationToken = TokenGenerator.generateVerificationToken();
        LocalDateTime expiryDate = TokenGenerator.generateExpiryDate();
        user.setVerificationToken(verificationToken);
        user.setTokenExpiryDate(expiryDate);
        // ----------------------------------------------------------------

        // Enregistrement de l'utilisateur dans la base de données
        User savedUser = userRepository.save(user);

        // Afficher les données sauvegardées pour debug
        System.out.println("DEBUG register - données sauvegardées:");
        System.out.println("Email: " + savedUser.getEmail());
        System.out.println("TypeOrganisateur: " + savedUser.getTypeOrganisateur());
        System.out.println("NomSociete: " + savedUser.getNomSociete());
        System.out.println("Nom: " + savedUser.getNom());
        System.out.println("Prenom: " + savedUser.getPrenom());

        // --- NOUVEAU : Envoyer l'e-mail de vérification ---
        try {
            emailService.sendVerificationEmail(savedUser, verificationToken);

        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'e-mail de vérification à " + savedUser.getEmail() + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Inscription réussie, mais échec de l'envoi de l'e-mail de vérification. Veuillez réessayer plus tard ou contacter le support.");
        }
        // --------------------------------------------------

        return ResponseEntity.ok("Inscription réussie ! Veuillez vérifier votre e-mail (" + savedUser.getEmail() + ") pour activer votre compte.");
    }



    // --- NOUVEL ENDPOINT POUR LA VÉRIFICATION D'E-MAIL ---
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Jeton de vérification invalide ou déjà utilisé.");
        }

        if (user.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Le jeton de vérification a expiré. Veuillez vous réinscrire ou demander un nouvel e-mail de vérification.");
        }

        user.setVerified(true); // ok
        user.setStatut(Statut.ENABLED); // ✅ ICI ON ACTIVE LE COMPTE
        user.setVerificationToken(null);
        user.setTokenExpiryDate(null);

        userRepository.save(user);

        return ResponseEntity.ok("Votre e-mail a été vérifié avec succès ! Votre compte est maintenant activé.");
    }

    // ---------------------------------------------------


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            // Authentifier l'utilisateur
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            // Récupérer l'utilisateur complet depuis la BDD
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

            // Vérifier si l'utilisateur est vérifié
            if (!user.isVerified()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Votre compte n'est pas vérifié. Veuillez consulter votre e-mail pour le lien de vérification.");
            }

            // Créer UserDetails pour générer le JWT
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .authorities("ROLE_" + user.getRole().name())
                    .build();

            // Générer le token (avec nom/prénom si ta méthode le supporte)
            String token = jwtUtils.generateToken(user);

            // Construire la réponse avec tous les champs utiles
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("nom", user.getNom());
            response.put("prenom", user.getPrenom());
            response.put("role", user.getRole().name());
            response.put("typeOrganisateur", user.getTypeOrganisateur());
            response.put("nomSociete", user.getNomSociete());

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect.");
        }
    }


}