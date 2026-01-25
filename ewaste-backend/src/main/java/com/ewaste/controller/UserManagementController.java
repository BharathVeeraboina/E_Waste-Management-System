package com.ewaste.controller;

import com.ewaste.dto.RegisterRequest;
import com.ewaste.entity.User;
import com.ewaste.entity.Role;
import com.ewaste.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    private final UserService userService;

    public UserManagementController(UserService userService) {
        this.userService = userService;
    }

    // 1. View ALL Users (Admin only)
    @GetMapping("/all")
    // NOTE: This endpoint needs to be called by the frontend UserManagementPage.jsx
    public ResponseEntity<List<User>> getAllUsers() {
        // This relies on the service calling findAll() and the User entity having @JsonIgnoreProperties
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    // 2. Register New Pickup Personnel Account
    @PostMapping("/pickup")
    public ResponseEntity<String> registerPickupPersonnel(@Valid @RequestBody RegisterRequest req) {
        try {
            // The service handles creating the user with ROLE_PICKUP
            userService.registerNewStaff(req.getName(), req.getEmail(), req.getPassword(), req.getPhone(), req.getAddress(), Role.ROLE_PICKUP);
            return ResponseEntity.status(HttpStatus.CREATED).body("Pickup Personnel registered successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}