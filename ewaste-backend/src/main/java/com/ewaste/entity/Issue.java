// src/main/java/com/ewaste/entity/Issue.java

package com.ewaste.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The user (Admin, Pickup, or User) who reported the issue

    @Column(nullable = false)
    private String reporterRole; // To easily identify if it came from ADMIN, PICKUP, or USER

    @Column(nullable = false)
    private String issueTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.OPEN;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();
    @Column(columnDefinition = "TEXT")
    private String adminReply;

    public enum IssueStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
}