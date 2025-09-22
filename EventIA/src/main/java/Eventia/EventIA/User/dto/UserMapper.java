package Eventia.EventIA.User.dto;

import Eventia.EventIA.User.entity.User;

import java.util.List;
import java.util.stream.Collectors;

public class UserMapper {

    public static UserDto toDTO(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setNomSociete(user.getNomSociete());
        dto.setGouvernorat(user.getGouvernorat());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setRole(user.getRole());
        dto.setStatut(user.getStatut());
        dto.setTypeOrganisateur(user.getTypeOrganisateur());
        dto.setPassword(user.getPassword()); // à utiliser uniquement pour création

        /*if (user.getOrganizedEvents() != null) {
            dto.setOrganizedEvents(
                    user.getOrganizedEvents().stream()
                            .map(EventMapper::toDTO)
                            .collect(Collectors.toList())
            );
        } else {
            dto.setOrganizedEvents(List.of());
        }*/

        return dto;
    }

    public static User toEntity(UserDto dto) {
        if (dto == null) return null;

        User user = new User();
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setNomSociete(dto.getNomSociete());
        user.setGouvernorat(dto.getGouvernorat());
        user.setEmail(dto.getEmail());
        user.setTelephone(dto.getTelephone());
        user.setRole(dto.getRole());
        user.setStatut(dto.getStatut());
        user.setTypeOrganisateur(dto.getTypeOrganisateur());
        user.setPassword(dto.getPassword());

        return user;
    }
}
