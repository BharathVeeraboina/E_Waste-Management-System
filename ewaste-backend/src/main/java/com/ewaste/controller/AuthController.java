package com.ewaste.controller;

import com.ewaste.dto.LoginRequest;
import com.ewaste.dto.RegisterRequest;
import com.ewaste.dto.JwtResponse;
import com.ewaste.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus; // NEW IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            String res = authService.register(req);
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            // FIX: Return a 409 Conflict if email exists, instead of a generic 500 error
            if (e.getMessage().contains("Email already registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            // Return generic server error for other unexpected exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            JwtResponse jwt = authService.login(req);
            return ResponseEntity.ok(jwt);
        } catch (RuntimeException e) {
            // Return 401 Unauthorized for login failures
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value="Authorization", required=false) String authHeader) {
        return ResponseEntity.ok("Logged out (client must remove tokens).");
    }
}