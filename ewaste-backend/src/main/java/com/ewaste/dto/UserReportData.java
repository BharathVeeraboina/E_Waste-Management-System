// src/main/java/com/ewaste/dto/UserReportData.java

package com.ewaste.dto;

import com.ewaste.entity.EwasteRequest;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class UserReportData {
    private String userName;
    private long totalSubmissions;
    private long completedSubmissions; // <<< FIELD NAME
    private boolean eligibleForCertificate;
    private List<EwasteRequest> requestHistory;

    // FIX: Correct the constructor body to match the parameter name
    public UserReportData(String userName, long totalSubmissions, long completedSubmissions,
                          boolean eligibleForCertificate, List<EwasteRequest> requestHistory) {
        this.userName = userName;
        this.totalSubmissions = totalSubmissions;
        this.completedSubmissions = completedSubmissions; // <<< CRITICAL: ASSIGNMENT FIXED HERE
        this.eligibleForCertificate = eligibleForCertificate;
        this.requestHistory = requestHistory;
    }
}