package Eventia.EventIA.contact;

import lombok.Data;

@Data
public class ContactMessageDto {
    private String nom;
    private String email;
    private String sujet;
    private String message;
}