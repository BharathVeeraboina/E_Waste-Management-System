// src/main/java/com/ewaste/service/IssueService.java

package com.ewaste.service;

import com.ewaste.dto.IssueReportRequest; // New DTO for input
import com.ewaste.entity.Issue;
import com.ewaste.entity.User;
import com.ewaste.repository.IssueRepository;
import com.ewaste.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import com.ewaste.dto.AdminIssueUpdate;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public IssueService(IssueRepository issueRepository, UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Issue reportNewIssue(String userEmail, IssueReportRequest dto) {
        // Find the User based on the email sent from the frontend header
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Reporting user not found: " + userEmail));

        Issue issue = new Issue();
        issue.setUser(user);
        issue.setReporterRole(user.getRole().name()); // Automatically record role
        issue.setIssueTitle(dto.getIssueTitle());
        issue.setDescription(dto.getDescription());
        issue.setCreatedAt(Instant.now());

        return issueRepository.save(issue);
    }

    // Admin function to view all open issues
    public List<Issue> getAllIssues() {
        // NOTE: In production, you would fetch and eagerly load user details here.
        return issueRepository.findAll();
    }

    public Issue getIssueById(Long issueId) {
        // Find the issue by ID. Ensure this loads the user data correctly.
        return issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found with ID: " + issueId));
    }

    @Transactional
    public Issue updateIssueStatus(Long issueId, AdminIssueUpdate dto) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found with ID: " + issueId));

        // 1. Update status if provided
        if (dto.getStatus() != null) {
            issue.setStatus(dto.getStatus());
        }

        // 2. Save the reply message from the Admin
        if (dto.getAdminReply() != null && !dto.getAdminReply().isBlank()) {
            issue.setAdminReply(dto.getAdminReply());
        }

        issue.setUpdatedAt(java.time.Instant.now());
        return issueRepository.save(issue);
    }

    // Inside IssueService.java
// Requires IssueRepository.findByUserEmail(String email) to be defined (or similar logic)
    public List<Issue> getIssuesByUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Reporting user not found."));
        return issueRepository.findByUserId(user.getId());     // Assuming you have findByUserId
    }
}