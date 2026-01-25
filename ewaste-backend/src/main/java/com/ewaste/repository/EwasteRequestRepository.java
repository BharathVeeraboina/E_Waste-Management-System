// src/main/java/com/ewaste/repository/EwasteRequestRepository.java

package com.ewaste.repository;

import com.ewaste.entity.EwasteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // NEW IMPORT
import java.util.List;

public interface EwasteRequestRepository extends JpaRepository<EwasteRequest, Long> {
    List<EwasteRequest> findByUserId(Long userId);

    // 🟢 FIX: Custom query to EAGERLY fetch the User entity along with the request
    @Query("SELECT r FROM EwasteRequest r JOIN FETCH r.user")
    List<EwasteRequest> findAllWithUser();

    List<EwasteRequest> findByStatusAndPickupPersonnel(
            EwasteRequest.RequestStatus status,
            String pickupPersonnel
    );
}