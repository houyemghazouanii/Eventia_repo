package Eventia.EventIA.Ticket;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/modeles-billets")
public class TicketTemplateController {

    private final TicketTemplateRepository repo;
    private final ObjectMapper objectMapper;


    public TicketTemplateController(TicketTemplateRepository repo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    // Liste des modèles (accessible aussi aux organisateurs)
    @GetMapping
    public List<TicketTemplate> getAllTemplates() {
        return repo.findAll();
    }

    // Création modèle (admin uniquement)

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketTemplate> createTemplate(
            @RequestPart("template") String templateJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {

        // Convertir JSON en objet TicketTemplate
        TicketTemplate template = objectMapper.readValue(templateJson, TicketTemplate.class);

        // Sauvegarder le fichier image sur disque
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();

            // Crée le dossier uploads/images s'il n'existe pas
            Path path = Paths.get("uploads/images/" + fileName);
            Files.createDirectories(path.getParent());

            // Écrire le fichier sur disque
            Files.write(path, imageFile.getBytes());

            // Stocker le nom du fichier dans la propriété adéquate de TicketTemplate
            template.setThumbnailBase64(fileName);
        }

        // Sauvegarde l'objet dans la base
        TicketTemplate saved = repo.save(template);

        return ResponseEntity.ok(saved);
    }

    // Modification modèle (admin)
    @PutMapping("/{id}")
    public ResponseEntity<TicketTemplate> updateTemplate(@PathVariable Long id,
                                                         @Valid @RequestBody TicketTemplate updated) {
        return repo.findById(id).map(existing -> {
            existing.setNom(updated.getNom());
            existing.setTemplateHtml(updated.getTemplateHtml());
            existing.setThumbnailBase64(updated.getThumbnailBase64());
            existing.setDefaultParamsJson(updated.getDefaultParamsJson());

            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Suppression modèle (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
