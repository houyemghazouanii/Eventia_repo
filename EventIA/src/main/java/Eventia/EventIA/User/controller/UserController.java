package Eventia.EventIA.User.controller;

import Eventia.EventIA.User.dto.ParticipantEventDto;
import Eventia.EventIA.User.dto.ParticipantHistoryDto;
import Eventia.EventIA.User.dto.UserDto;
import Eventia.EventIA.User.dto.UserMapper;
import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.exception.ResourceNotFoundException;
import Eventia.EventIA.User.exception.UserAlreadyExistsException;
import Eventia.EventIA.User.exception.UserNotFoundException;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.User.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin("http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;



    // ✅ Liste de TOUS les utilisateurs (admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> dtos = users.stream()
                .map(UserMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // ✅ Liste des organisateurs uniquement (pour le filtre React)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/organizers")
    public ResponseEntity<List<UserDto>> getAllOrganizers() {
        List<User> organizers = userRepository.findByRole(Role.ORGANIZER);
        List<UserDto> dtos = organizers.stream()
                .map(UserMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // ✅ Récupérer un utilisateur par ID
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserMapper.toDTO(user));
    }

    // ✅ Créer un utilisateur
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        try {
            User user = UserMapper.toEntity(userDto);
            User savedUser = userService.addUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(UserMapper.toDTO(savedUser));
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // ✅ Modifier un utilisateur
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        try {
            User userToUpdate = UserMapper.toEntity(userDto);
            User updatedUser = userService.updateUser(userToUpdate, id);
            return ResponseEntity.ok(UserMapper.toDTO(updatedUser));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // ✅ Supprimer un utilisateur
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Récupérer un organisateur avec ses événements
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/organizers/{organizerId}/events")
    public ResponseEntity<UserDto> getOrganizerWithEvents(@PathVariable Long organizerId) {
        User organizer = userService.getUserById(organizerId);

        if (organizer.getRole() != Role.ORGANIZER) {
            throw new ResourceNotFoundException("Organizer not found with ID: " + organizerId);
        }

        UserDto organizerDto = UserMapper.toDTO(organizer);
        return ResponseEntity.ok(organizerDto);
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // email ou username

        Optional<User> userOptional = userService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        User user = userOptional.get();
        UserDto dto = UserMapper.toDTO(user);
        return ResponseEntity.ok(dto);
    }
    @PreAuthorize("hasAnyRole('USER', 'ORGANIZER')")
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUser(@RequestBody UserDto userDto, Authentication authentication) {
        try {
            String email = authentication.getName(); // récupère l'email du token
            User existingUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

            // met à jour les champs communs
            existingUser.setNom(userDto.getNom());
            existingUser.setPrenom(userDto.getPrenom());
            existingUser.setNomSociete(userDto.getNomSociete());

            existingUser.setTelephone(userDto.getTelephone());
            existingUser.setGouvernorat(userDto.getGouvernorat());

            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(UserMapper.toDTO(updatedUser));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }



    // GET /users/{organizerId}/participants
    @PreAuthorize("hasRole('ORGANIZER')")
    @GetMapping("/{organizerId}/participants")
    public List<ParticipantEventDto> getParticipants(@PathVariable Long organizerId) {
        System.out.println("Requête participants pour organizerId: " + organizerId);
        return userService.getParticipantsByOrganizer(organizerId);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{participantId}/history")
    public ResponseEntity<List<ParticipantHistoryDto>> getHistory(
            @PathVariable Long participantId, Authentication authentication) {

        // Vérifier que l'utilisateur connecté correspond à l'ID ou est ADMIN
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        if (!user.getId().equals(participantId) && !user.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ParticipantHistoryDto> history = userService.getHistoryByParticipant(participantId);
        return ResponseEntity.ok(history);
    }

}
