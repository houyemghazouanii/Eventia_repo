package Eventia.EventIA.Ticket;


import Eventia.EventIA.event.entity.Event;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TemplateRenderService {
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public String render(String templateHtml, Event event, Map<String, Object> params) {
        if (templateHtml == null) return "";

        Map<String, String> values = new HashMap<>();
        values.put("titre", safe(event.getTitre()));
        values.put("description", safe(event.getDescription()));
        values.put("dateDebut", event.getDateDebut() != null ? event.getDateDebut().format(DATE_FMT) : "");
        values.put("dateFin", event.getDateFin() != null ? event.getDateFin().format(DATE_FMT) : "");
        values.put("heureDebut", event.getHeureDebut() != null ? event.getHeureDebut().format(TIME_FMT) : "");
        values.put("adresse", safe(event.getAdresse()));
        values.put("prix", event.getPrix() != null ? String.format("%.2f", event.getPrix()) : "");
        values.put("image", (event.getImage() != null && !event.getImage().isEmpty())
                ? "data:image/png;base64," + event.getImage()
                : "");
        if (event.getOrganizer() != null) {
            values.put("organizer", safe(event.getOrganizer().getPrenom() + " " + event.getOrganizer().getNom()));
        }

        if (params != null) {
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                values.put(entry.getKey(), entry.getValue() != null ? entry.getValue().toString() : "");
            }
        }
        Pattern p = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}");
        Matcher m = p.matcher(templateHtml);
        StringBuffer sb = new StringBuffer();
        while (m.find()) {
            String key = m.group(1);
            String repl = values.getOrDefault(key, "");
            repl = Matcher.quoteReplacement(repl);
            m.appendReplacement(sb, repl);
        }
        m.appendTail(sb);
        return sb.toString();
    }
    private String safe(String s) {
        return s == null ? "" : s;
    }
}
