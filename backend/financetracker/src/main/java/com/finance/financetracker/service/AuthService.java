package com.finance.financetracker.service;

import com.finance.financetracker.config.JwtUtil;
import com.finance.financetracker.model.User;
import com.finance.financetracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER
    public String register(String name, String email, String password) {

        // check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);

        return "User registered successfully";
    }

    // ✅ LOGIN
    public String login(String email, String password) {

        System.out.println("LOGIN EMAIL: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("USER NOT FOUND ❌");
                    return new RuntimeException("User not found");
                });

        System.out.println("DB PASSWORD: " + user.getPassword());
        System.out.println("RAW PASSWORD: " + password);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("PASSWORD NOT MATCHING ❌");
            throw new RuntimeException("Invalid credentials");
        }

        System.out.println("PASSWORD MATCHED ✅");

        return jwtUtil.generateToken(email);
    }
}