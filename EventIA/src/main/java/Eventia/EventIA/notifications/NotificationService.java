package Eventia.EventIA.notifications;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class NotificationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String flaskBaseUrl = "http://localhost:5000";

    // Méthode pour appeler l'endpoint Flask de test
    public Object generateNotifications() {
        String url = UriComponentsBuilder.fromHttpUrl(flaskBaseUrl)
                .path("/test_notifications")
                .toUriString();

        return restTemplate.getForObject(url, Object.class);
    }

    // Méthode pour récupérer notifications d'un utilisateur spécifique
    public Object getNotificationsForUser(Long userId) {
        String url = UriComponentsBuilder.fromHttpUrl(flaskBaseUrl)
                .path("/notifications/user/{userId}")
                .buildAndExpand(userId)
                .toUriString();
        return restTemplate.getForObject(url, Object.class);
    }
}
