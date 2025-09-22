package Eventia.EventIA.User.exception;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException (String message) {
        super(message);
    }
}