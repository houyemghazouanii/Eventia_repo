package Eventia.EventIA.User.configuration;

import Eventia.EventIA.User.configuration.jwt.JwtFilter;
import Eventia.EventIA.User.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.List;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            .cors()
            .and()
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/uploads/images/**").permitAll()
                    .requestMatchers("/events/public/**").permitAll()
                    .requestMatchers("/events/types").permitAll()
                    .requestMatchers("/api/contact/**").permitAll()
                    .requestMatchers("/trigger-notifications/**").permitAll()

                    .requestMatchers("/reservations").hasAnyRole("USER")
                    .requestMatchers(HttpMethod.POST, "/reservations/*/pay").hasRole("USER")
                    .requestMatchers(HttpMethod.POST, "/reservations/bulk-pay").hasRole("USER")
                    .requestMatchers(HttpMethod.DELETE, "/reservations/*").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/reservations/*").hasRole("USER")
                    .requestMatchers("/events/**").hasAnyRole("ADMIN", "ORGANIZER", "USER")
                    .requestMatchers(HttpMethod.DELETE, "/events/organizer/events/**").hasRole("ORGANIZER")
                    .requestMatchers("/events/*/archive").hasAnyRole("ADMIN", "ORGANIZER")
                    .requestMatchers("/events/*/cancel").hasAnyRole("ADMIN", "ORGANIZER")
                    .requestMatchers("/events/*/toggle-status").hasAnyRole("ADMIN", "ORGANIZER")
                    .requestMatchers("api/billets/**").hasRole("ORGANIZER")
                    .requestMatchers(HttpMethod.GET, "/api/modeles-billets/**").hasAnyRole("ADMIN", "ORGANIZER")
                    .requestMatchers("/api/modeles-billets/**").hasRole("ADMIN")
                    .requestMatchers("/preferences/**").hasRole("USER")
                    .requestMatchers("/api/recommendations/**").hasRole("USER")
                    .requestMatchers(" /reviews/**").hasAnyRole("USER", "ORGANIZER")


                    .anyRequest().authenticated()
                    
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}


}