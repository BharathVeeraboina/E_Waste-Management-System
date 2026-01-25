package com.ewaste.controller;

import com.ewaste.dto.UpdateProfileRequest;
import com.ewaste.entity.User;
import com.ewaste.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            // CRITICAL FIX: Get the email from the custom header sent by the frontend
            @RequestHeader("X-User-Email") String email) {

        Optional<User> userOpt = userService.findByEmail(email);

        if (userOpt.isPresent()) {
            // Returns the User object corresponding to the logged-in email
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found for user: " + email);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            // Also get the email from the header for the update operation
            @RequestHeader("X-User-Email") String email,
            @RequestBody UpdateProfileRequest update) {

        try {
            // Use the dynamic email to update the correct user record
            User updated = userService.updateProfile(email, update.getName(), update.getPhone(), update.getAddress(), update.getProfilePicture());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}