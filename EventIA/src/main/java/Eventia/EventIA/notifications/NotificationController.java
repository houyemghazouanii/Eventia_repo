package Eventia.EventIA.notifications;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Endpoint pour générer les notifications (Flask)
    @GetMapping("/trigger-notifications")
    public Object triggerNotifications() {
        return notificationService.generateNotifications();
    }

    // Endpoint pour récupérer les notifications d'un utilisateur
    @GetMapping("/trigger-notifications/user/{userId}")
    public Object getUserNotifications(@PathVariable Long userId) {
        return notificationService.getNotificationsForUser(userId);
    }
}


