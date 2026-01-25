package com.ewaste.repository;

import com.ewaste.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    // Find a verification record by the request ID (used for checking active OTP)
    Optional<OtpVerification> findByRequestId(Long requestId);

    // Find a verification record by request ID AND user email (optional secondary check)
    Optional<OtpVerification> findByRequestIdAndUserEmail(Long requestId, String userEmail);

    // Find a verification record by the user's email
    Optional<OtpVerification> findByUserEmail(String userEmail);
}