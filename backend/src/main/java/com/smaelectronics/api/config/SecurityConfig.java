package com.smaelectronics.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Defining the admin user directly here (instead of via application.properties)
    // guarantees the password is actually BCrypt-encoded before it's stored.
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {

        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("SmaAdmin@2026"))
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // This is a stateless JSON API (no browser form/session), so CSRF
            // protection (designed for cookie-based sessions) isn't needed here.
            .csrf(csrf -> csrf.disable())

            // Reuses the CORS rules already defined via @CrossOrigin on the controllers.
            .cors(Customizer.withDefaults())

            .authorizeHttpRequests(auth -> auth
                // Preflight requests must always be allowed through
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Anyone can browse products (the public storefront needs this)
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                // Only logged-in users can create, update, or delete products
                .requestMatchers(HttpMethod.POST, "/api/products/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/products/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").authenticated()

                // Used by the login page to check credentials are valid
                .requestMatchers("/api/admin/**").authenticated()

                // H2 console stays open for local development/debugging
                .requestMatchers("/h2-console/**").permitAll()

                .anyRequest().permitAll()
            )

            // Sends a "Basic" login prompt/response — simple and works well with fetch()
            .httpBasic(Customizer.withDefaults())

            // Needed so the H2 console (which uses frames) still displays correctly
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));

        return http.build();
    }

}
