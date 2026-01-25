package com.ewaste.service;

import com.ewaste.dto.LoginRequest;
import com.ewaste.dto.RegisterRequest;
import com.ewaste.dto.JwtResponse;
import com.ewaste.entity.User;
import com.ewaste.entity.Role;
import com.ewaste.repository.UserRepository;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    @Autowired private EmailService emailService;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public String register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPassword(req.getPassword());
        user.setAddress(req.getAddress());
        user.setRole(Role.ROLE_USER);
        userRepository.save(user);
        emailService.sendRegistrationNotification(user.getEmail());
        return "User registered successfully";
    }

    public JwtResponse login(LoginRequest req) {
        Optional<User> opt = userRepository.findByEmail(req.getEmail());
        if (opt.isEmpty()) throw new RuntimeException("Invalid credentials");
        User user = opt.get();

        if (!req.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String dummyToken = "dummy-access-token-for-" + user.getEmail();

        // CRITICAL: Ensure the User's actual email is sent in the response DTO
        return new JwtResponse(dummyToken, "dummy-refresh-token", "Bearer", user.getRole().name(), user.getEmail()); // The JwtResponse DTO must accept 5 arguments now (token, refresh, type, role, email)
    }
}