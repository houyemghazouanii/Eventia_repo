package Eventia.EventIA.User.configuration.service;

import Eventia.EventIA.User.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(User user, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String subject = "🎉 Bienvenue chez EventIA – Activez votre compte !";
        String verificationLink = "http://localhost:8080/api/auth/verify-email?token=" + token;

        // Construction dynamique du nom à afficher
        String displayName;
        if (user.getTypeOrganisateur() != null
                && "SOCIETE".equals(user.getTypeOrganisateur().name())
                && user.getNomSociete() != null
                && !user.getNomSociete().isBlank()) {
            displayName = user.getNomSociete();
        } else if (user.getPrenom() != null
                && !user.getPrenom().isBlank()
                && user.getNom() != null
                && !user.getNom().isBlank()) {
            displayName = user.getPrenom() + " " + user.getNom();
        } else {
            displayName = "Cher utilisateur";
        }

        String htmlContent = "<!DOCTYPE html>"
                + "<html><head><meta charset='UTF-8'><title>Activation de compte</title></head>"
                + "<body style='font-family: sans-serif; background-color: #f9f9f9; padding: 20px;'>"
                + "<div style='max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);'>"
                + "  <h2 style='color: #333;'>Bonjour " + displayName + ",</h2>"
                + "  <p style='font-size: 16px; color: #555;'>Nous vous remercions pour votre inscription sur <strong>EventIA</strong>.</p>"
                + "  <p style='font-size: 16px; color: #555;'>Afin de finaliser la création de votre compte, merci de cliquer sur le bouton ci-dessous :</p>"
                + "  <div style='text-align: center; margin: 30px 0;'>"
                + "    <a href='" + verificationLink + "' style='background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;'>Activer mon compte</a>"
                + "  </div>"
                + "  <p style='font-size: 14px; color: #888;'>Ce lien est valide pendant <strong>24 heures</strong>.</p>"
                + "  <hr style='margin: 30px 0;'>"
                + "  <p style='font-size: 13px; color: #aaa;'>Lien direct : <br><a href='" + verificationLink + "' style='color: #007bff;'>" + verificationLink + "</a></p>"
                + "  <p style='font-size: 12px; color: #aaa; text-align: center;'>"
                + "    &copy; 2025 EventIA - Tous droits réservés<br>"
                + "    <a href='mailto:eventia.gha@gmail.com' style='color: #aaa;'>contact@eventia.com</a>"
                + "  </p>"
                + "</div>"
                + "</body></html>";

        helper.setFrom("eventia.gha@gmail.com");
        helper.setTo(user.getEmail());
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    // Nouvelle méthode pour envoyer le billet PDF
    public void sendTicketEmail(User participant, byte[] pdfData) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String displayName;
        if (participant.getTypeOrganisateur() != null
                && "SOCIETE".equals(participant.getTypeOrganisateur().name())
                && participant.getNomSociete() != null
                && !participant.getNomSociete().isBlank()) {
            displayName = participant.getNomSociete();
        } else if (participant.getPrenom() != null
                && !participant.getPrenom().isBlank()
                && participant.getNom() != null
                && !participant.getNom().isBlank()) {
            displayName = participant.getPrenom() + " " + participant.getNom();
        } else {
            displayName = "Cher utilisateur";
        }

        String subject = "🎫 Votre billet pour EventIA";
        String htmlContent = "<html><body>"
                + "<h2>Bonjour " + displayName + ",</h2>"
                + "<p>Merci pour votre paiement. Vous trouverez votre billet en pièce jointe.</p>"
                + "<p>Nous vous souhaitons un excellent événement !</p>"
                + "</body></html>";

        helper.setFrom("eventia.gha@gmail.com");
        helper.setTo(participant.getEmail());
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        helper.addAttachment("billet-eventia.pdf", new ByteArrayResource(pdfData));

        mailSender.send(message);
    }

    public void sendContactMessage(String nom, String email, String sujet, String messageContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String subject = "📩 Nouveau message de Contact : " + sujet;
        String htmlContent = "<html><body>"
                + "<h3>Nouveau message de contact</h3>"
                + "<p><strong>Nom:</strong> " + nom + "</p>"
                + "<p><strong>Email:</strong> " + email + "</p>"
                + "<p><strong>Sujet:</strong> " + sujet + "</p>"
                + "<p><strong>Message:</strong></p>"
                + "<p>" + messageContent + "</p>"
                + "<hr>"
                + "<p style='font-size:12px; color:gray;'>EventIA - Tous droits réservés</p>"
                + "</body></html>";

        helper.setFrom("eventia.gha@gmail.com");
        helper.setTo("eventia.gha@gmail.com"); // l’email de l’admin
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

}