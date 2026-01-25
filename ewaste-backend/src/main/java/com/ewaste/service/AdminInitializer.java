package com.ewaste.service;

import com.ewaste.entity.User;
import com.ewaste.entity.Role;
import com.ewaste.repository.UserRepository;
import org.springframework.boot.CommandLineRunner; // Runs code after application startup
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    // Hardcoded Admin Credentials (Must match RequestController)
    private final String ADMIN_EMAIL = "admin@ewaste.com";
    private final String ADMIN_PASSWORD = "adminpass";

    public AdminInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Check if Admin already exists
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {

            // 2. Create and save the Admin user
            User admin = new User();
            admin.setEmail(ADMIN_EMAIL);
            admin.setPassword(ADMIN_PASSWORD); // Saving PLAIN TEXT password
            admin.setName("System Admin");
            admin.setPhone("0000000000");
            admin.setAddress("Headquarters");
            admin.setRole(Role.ROLE_ADMIN); // Assign the ADMIN role

            userRepository.save(admin);
            System.out.println("--- Admin user 'admin@ewaste.com' created with password 'adminpass' ---");
        }
    }
}