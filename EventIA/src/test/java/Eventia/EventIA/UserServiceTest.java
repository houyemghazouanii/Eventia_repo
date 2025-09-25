package Eventia.EventIA;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.exception.UserAlreadyExistsException;
import Eventia.EventIA.User.exception.UserNotFoundException;
import Eventia.EventIA.User.repository.UserRepository;
import Eventia.EventIA.User.service.UserService;
import Eventia.EventIA.reservation.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setNom("John");
        sampleUser.setPrenom("Doe");
        sampleUser.setEmail("john@example.com");
        sampleUser.setPassword("password");
        sampleUser.setRole(Role.USER);
    }

    @Test
    void testAddUserSuccess() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        User result = userService.addUser(sampleUser);
        assertEquals("John", result.getNom());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testAddUserAlreadyExists() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        assertThrows(UserAlreadyExistsException.class, () -> userService.addUser(sampleUser));
        verify(userRepository, never()).save(sampleUser);
    }

    @Test
    void testGetUsers() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));
        List<User> users = userService.getUsers();
        assertEquals(1, users.size());
    }

    @Test
    void testGetUserByIdFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        User result = userService.getUserById(1L);
        assertEquals("John", result.getNom());
    }

    @Test
    void testGetUserByIdNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> userService.getUserById(1L));
    }

    @Test
    void testDeleteUserSuccess() {
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1L);

        userService.deleteUser(1L);
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteUserNotFound() {
        when(userRepository.existsById(1L)).thenReturn(false);
        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(1L));
    }

    @Test
    void testFindByEmail() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        Optional<User> result = userService.findByEmail("john@example.com");
        assertTrue(result.isPresent());
    }
}
