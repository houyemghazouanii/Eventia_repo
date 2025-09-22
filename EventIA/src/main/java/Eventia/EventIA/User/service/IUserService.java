package Eventia.EventIA.User.service;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.Role;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    User addUser(User user);
    List<User> getUsers();
    User updateUser(User user, Long id);
    User getUserById(Long id);
    void deleteUser(Long id);
    //User registerUser(RegistrationRequest request);
    Optional<User> findByEmail(String email);
   // void saveUserVerificationToken(User theUser, String verificationToken);
    //String validateToken(String theToken);

    List<User> getUsersByRole(Role role); // Nouvelle méthode
}
