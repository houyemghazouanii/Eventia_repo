package Eventia.EventIA.User.dto;

import Eventia.EventIA.User.enums.Role;
import Eventia.EventIA.User.enums.Statut;
import Eventia.EventIA.User.enums.TypeOrganisateur;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String nom;
    private String prenom;
    private String nomSociete;
    private String gouvernorat;
    private String email;
    private String password;

    private String telephone;
    private Role role;
    private Statut statut;
    private TypeOrganisateur typeOrganisateur;

    //private List<EventDto> organizedEvents;

}