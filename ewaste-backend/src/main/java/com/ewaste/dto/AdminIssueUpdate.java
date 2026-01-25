// src/main/java/com/ewaste/dto/AdminIssueUpdate.java

package com.ewaste.dto;

import com.ewaste.entity.Issue.IssueStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminIssueUpdate {
    // New status (e.g., RESOLVED, IN_PROGRESS)
    private IssueStatus status;

    // Admin's public reply message to the user
    private String adminReply;
}