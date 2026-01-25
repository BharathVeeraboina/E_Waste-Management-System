// src/main/java/com/ewaste/dto/IssueReportRequest.java
package com.ewaste.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class IssueReportRequest {
    @NotBlank private String issueTitle;
    @NotBlank private String description;
    // The email and role are passed via headers and handled in the service
}