package Eventia.EventIA.User.repository;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    //@EntityGraph(attributePaths = "organizedEvents")
    List<User> findByRole(Role role);

    //@EntityGraph(attributePaths = "organizedEvents")
    Optional<User> findById(Long id);

    // --- NEW: Add @EntityGraph to findAll() ---
    //@Override // It's good practice to mark overridden methods
    //@EntityGraph(attributePaths = "organizedEvents")
    List<User> findAll(); // This will now eagerly fetch organizedEvents for all users

    Optional<User> findByVerificationToken(String verificationToken);

    // Nombre total d'utilisateurs non-admin
    @Query("SELECT COUNT(u) FROM User u WHERE u.role != 'ADMIN'")
    long countNonAdminUsers();

    // Nombre d'organisateurs
    long countByRole(Role role);

}
