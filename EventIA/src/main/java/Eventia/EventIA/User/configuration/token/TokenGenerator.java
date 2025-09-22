package Eventia.EventIA.User.configuration.token;


import java.time.LocalDateTime;
import java.util.UUID;

public class TokenGenerator {

    /**
     * Génère un jeton de vérification unique en utilisant UUID.
     * @return Le jeton de vérification sous forme de chaîne de caractères.
     */
    public static String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    /**
     * Génère une date d'expiration pour le jeton, fixée à 24 heures à partir de maintenant.
     * @return La date et l'heure d'expiration du jeton.
     */
    public static LocalDateTime generateExpiryDate() {
        // Le jeton sera valide pendant 24 heures
        return LocalDateTime.now().plusHours(24);
    }
}