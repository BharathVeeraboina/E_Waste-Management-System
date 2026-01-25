// src/main/java/com/ewaste/dto/AdminActionRequest.java

package com.ewaste.dto;

import com.ewaste.entity.EwasteRequest.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Getter
@Setter
public class AdminActionRequest {

    private RequestStatus status; // The new status (APPROVED, REJECTED, SCHEDULED)

    // Required if rejecting
    private String rejectionReason;

    // Required if scheduling
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    @NotNull // Ensure this is not null if the status is SCHEDULED
    private LocalDateTime scheduledAt;
    private String pickupPersonnel;
}