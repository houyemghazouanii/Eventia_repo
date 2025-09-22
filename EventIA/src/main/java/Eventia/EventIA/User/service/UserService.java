package Eventia.EventIA.User.service;

import Eventia.EventIA.User.dto.ParticipantEventDto;
import Eventia.EventIA.User.dto.ParticipantHistoryDto;
import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.enums.TypeOrganisateur;
import Eventia.EventIA.User.exception.UserAlreadyExistsException;
import Eventia.EventIA.User.exception.UserNotFoundException;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.event.entity.Event;
import Eventia.EventIA.reservation.Reservation;
import Eventia.EventIA.reservation.ReservationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    //private final VerificationTokenRepository tokenRepository;

    private final ReservationRepository reservationRepository;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, ReservationRepository reservationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.reservationRepository = reservationRepository;
    }
    @Override
    public User addUser(User user) {
        if (userAlreadyExists(user.getEmail())) {
            throw new UserAlreadyExistsException(user.getEmail() + " already exists!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    private boolean userAlreadyExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(User user, Long id) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setNom(user.getNom());
            existingUser.setPrenom(user.getPrenom());
            existingUser.setEmail(user.getEmail());
            existingUser.setTelephone(user.getTelephone());
            existingUser.setGouvernorat(user.getGouvernorat());
            existingUser.setRole(user.getRole());
            existingUser.setStatut(user.getStatut());
            existingUser.setNomSociete(user.getNomSociete());
            existingUser.setOrganizedEvents(user.getOrganizedEvents());
            return userRepository.save(existingUser);
        }).orElseThrow(() -> new UserNotFoundException("Sorry, this user could not be found"));
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Sorry, no user found with the id: " + id));
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("Sorry, user not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    // Méthode d'inscription à partir d'une requête d'enregistrement


    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }



    public List<ParticipantEventDto> getParticipantsByOrganizer(Long organizerId) {
        return reservationRepository.findParticipantsByOrganizer(organizerId);
    }

    // Retourne l'historique d'un participant
    public List<ParticipantHistoryDto> getHistoryByParticipant(Long participantId) {
        List<Reservation> reservations = reservationRepository.findByParticipantId(participantId);
        List<ParticipantHistoryDto> historyDtos = new ArrayList<>();

        for (Reservation r : reservations) {
            ParticipantHistoryDto dto = new ParticipantHistoryDto();
            dto.setTitre(r.getEvent().getTitre());

            User organizer = r.getEvent().getOrganizer();
            if (organizer != null) {
                if (organizer.getTypeOrganisateur() == TypeOrganisateur.PERSONNE) {
                    dto.setOrganizerName(organizer.getNom() + " " + organizer.getPrenom());
                } else if (organizer.getTypeOrganisateur() == TypeOrganisateur.SOCIETE) {
                    dto.setOrganizerName(organizer.getNomSociete());
                } else {
                    dto.setOrganizerName(null);
                }
            } else {
                dto.setOrganizerName(null);
            }

            dto.setDateDebut(r.getEvent().getDateDebut());
            dto.setDateReservation(r.getDateReservation());
            dto.setStatut(r.getStatut().name());

            historyDtos.add(dto);
        }

        return historyDtos;
    }

}

