package com.ewaste.service;

import com.ewaste.entity.User;
import com.ewaste.entity.Role;
import com.ewaste.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PickupInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    // Hardcoded Pickup Personnel Credentials
    private final String PICKUP_EMAIL = "pickup@ewaste.com";
    private final String PICKUP_PASSWORD = "pickup"; // Simple fixed password

    public PickupInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail(PICKUP_EMAIL)) {

            User pickupUser = new User();
            pickupUser.setEmail(PICKUP_EMAIL);
            pickupUser.setPassword(PICKUP_PASSWORD); // Saving PLAIN TEXT password
            pickupUser.setName("Pickup Dispatcher");
            pickupUser.setPhone("1111111111");
            pickupUser.setAddress("Logistics Hub");
            pickupUser.setRole(Role.ROLE_PICKUP); // Assign the correct role

            userRepository.save(pickupUser);
            System.out.println("--- Pickup Personnel user 'pickup@ewaste.com' created with password 'pickup' ---");
        }
    }
}