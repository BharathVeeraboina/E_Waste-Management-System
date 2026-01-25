// src/main/java/com/ewaste/entity/User.java

package com.ewaste.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter; // Added for completeness
import lombok.Setter; // Added for completeness
import lombok.NoArgsConstructor; // Added for completeness
import lombok.AllArgsConstructor; // Added for completeness
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter // Make sure this is present or manually coded
@Setter // Make sure this is present or manually coded
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String password;
    private String address;
    private String profilePicture;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Role role;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();


}