package Eventia.EventIA.contact;

import Eventia.EventIA.User.configuration.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin("http://localhost:3000")
public class ContactController {

    @Autowired
    private ContactMessageRepository contactRepo;

    @Autowired
    private EmailService emailService;

    private final String adminEmail = "admin@eventia.com"; // email de l'admin

    @PostMapping("/send")
    public ResponseEntity<?> envoyerMessage(@RequestBody ContactMessageDto dto) {
        try {
            // Enregistrer en base
            ContactMessage msg = new ContactMessage();
            msg.setNom(dto.getNom());
            msg.setEmail(dto.getEmail());
            msg.setSujet(dto.getSujet());
            msg.setMessage(dto.getMessage());
            contactRepo.save(msg);

            // Envoyer email à l’admin
            emailService.sendContactMessage(dto.getNom(), dto.getEmail(), dto.getSujet(), dto.getMessage());

            return ResponseEntity.ok("Message envoyé avec succès !");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Impossible d'envoyer le message.");
        }
    }

    @GetMapping("/all")
    public List<ContactMessage> getAllMessages() {
        return contactRepo.findAllByOrderByDateEnvoiDesc();
    }
}

