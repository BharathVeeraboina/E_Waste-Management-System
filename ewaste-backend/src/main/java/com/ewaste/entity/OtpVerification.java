// src/main/java/com/ewaste/entity/OtpVerification.java

package com.ewaste.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "otp_verification")
@Getter
@Setter
@NoArgsConstructor
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail; // Email of the user receiving the OTP

    @Column(nullable = false)
    private String otpCode; // The generated 6-digit code

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private EwasteRequest request; // The request this OTP belongs to

    @Column(nullable = false)
    private Instant expiryTime = Instant.now().plusSeconds(300); // 5 minutes expiry

    private Instant createdAt = Instant.now();
}