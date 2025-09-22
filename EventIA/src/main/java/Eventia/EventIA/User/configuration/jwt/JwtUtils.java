package Eventia.EventIA.User.configuration.jwt;

import Eventia.EventIA.User.entity.User;
import Eventia.EventIA.User.enums.TypeOrganisateur;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 🔧 ✅ Nouvelle version : on passe un User complet
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("nom", user.getNom());
        claims.put("prenom", user.getPrenom());
        claims.put("role", user.getRole().name());
        claims.put("typeOrganisateur", user.getTypeOrganisateur());

        if (user.getTypeOrganisateur() == TypeOrganisateur.SOCIETE) {
            claims.put("nomSociete", user.getNomSociete());
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail()) // le login = email
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractNom(String token) {
        return extractAllClaims(token).get("nom", String.class);
    }

    public String extractPrenom(String token) {
        return extractAllClaims(token).get("prenom", String.class);
    }

    public String extractNomSociete(String token) {
        return extractAllClaims(token).get("nomSociete", String.class);
    }

    public String extractTypeOrganisateur(String token) {
        return extractAllClaims(token).get("typeOrganisateur", String.class);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
