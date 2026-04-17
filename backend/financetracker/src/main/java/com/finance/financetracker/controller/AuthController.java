package com.finance.financetracker.controller;

import com.finance.financetracker.dto.AuthRequest;
import com.finance.financetracker.dto.AuthResponse;
import com.finance.financetracker.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {

        String response = authService.register(
                request.getName(),     // ⚠️ requires name in DTO
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(response);
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {

        System.out.println("LOGIN API HIT");

        String token = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(new AuthResponse(token));
    }
}