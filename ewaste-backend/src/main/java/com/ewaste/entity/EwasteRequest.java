// src/main/java/com/ewaste/entity/EwasteRequest.java

package com.ewaste.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "ewaste_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EwasteRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String deviceType;

    private String brand;
    private String model;

    @Column(nullable = false)
    private String deviceCondition;

    @Column(nullable = false)
    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String imagePaths;

    @Column(nullable = false)
    private String pickupAddress;

    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20) // <<< CRITICAL FIX: ADD length = 20
    private RequestStatus status = RequestStatus.PENDING;

    private Instant scheduledAt;
    private String pickupPersonnel;
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    // Enum for Status
    public enum RequestStatus {
        PENDING, APPROVED, REJECTED, SCHEDULED, COMPLETED
    }
}