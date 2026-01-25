package com.ewaste.service;

import com.ewaste.dto.RegisterRequest; // Assuming this DTO is used by the management controller
import com.ewaste.dto.UpdateProfileRequest;
import com.ewaste.entity.User;
import com.ewaste.entity.Role; // Import Role enum
import com.ewaste.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // --- User Profile Update Logic (M1) ---
    @Transactional
    public User updateProfile(String email, String name, String phone, String address, String profilePicture) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (name != null) user.setName(name);
        if (phone != null) user.setPhone(phone);
        if (address != null) user.setAddress(address);
        if (profilePicture != null) user.setProfilePicture(profilePicture);
        user.setUpdatedAt(java.time.Instant.now());
        return userRepository.save(user);
    }

    // --- Admin Management Logic (M4) ---
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User registerNewStaff(String name, String email, String password, String phone, String address, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists.");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setPhone(phone);
        user.setAddress(address);
        user.setRole(role); // Set the specific role (ROLE_PICKUP or ROLE_ADMIN)
        return userRepository.save(user);
    }
}