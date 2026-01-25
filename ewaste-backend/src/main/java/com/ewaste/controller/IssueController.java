// src/main/java/com/ewaste/controller/IssueController.java

package com.ewaste.controller;

import com.ewaste.dto.IssueReportRequest;
import com.ewaste.entity.Issue;
import com.ewaste.service.IssueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.ewaste.dto.IssueReportRequest;
import com.ewaste.dto.AdminActionRequest; // Existing DTO
import com.ewaste.dto.AdminIssueUpdate; // <<< CRITICAL FIX: ADD THIS IMPORT

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    // 1. Endpoint for users (all roles) to submit an issue (POST /api/issues/report)
    @PostMapping("/report")
    public ResponseEntity<Issue> reportIssue(
            @RequestHeader("X-User-Email") String userEmail,
            @Valid @RequestBody IssueReportRequest dto) {
        try {
            Issue newIssue = issueService.reportNewIssue(userEmail, dto);
            return new ResponseEntity<>(newIssue, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 🟢 CRITICAL FIX: Endpoint for Admin to view all issues (GET /api/issues/admin/all)
    @GetMapping("/admin/all")
    public ResponseEntity<List<Issue>> getAllIssues() {
        List<Issue> issues = issueService.getAllIssues();
        return ResponseEntity.ok(issues);
    }

    // 🟢 CRITICAL FIX: Get Single Issue Details by ID
    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssueById(@PathVariable Long id) {
        try {
            // Requires a service method (IssueService.getIssueById)
            Issue issue = issueService.getIssueById(id);
            return ResponseEntity.ok(issue);
        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{issueId}/update")
    public ResponseEntity<Issue> updateIssueStatus(@PathVariable Long issueId, @RequestBody AdminIssueUpdate dto) {
        try {
            // This relies on the new processAdminAction method in IssueService
            Issue updatedIssue = issueService.updateIssueStatus(issueId, dto);
            return ResponseEntity.ok(updatedIssue);
        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/my-issues") // Matches the frontend call
    public ResponseEntity<List<Issue>> getMyReportedIssues(@RequestHeader("X-User-Email") String userEmail) {
        // Calls the service method
        List<Issue> issues = issueService.getIssuesByUserEmail(userEmail);
        return ResponseEntity.ok(issues);
    }
}