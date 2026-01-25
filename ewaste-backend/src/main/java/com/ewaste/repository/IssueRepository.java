// src/main/java/com/ewaste/repository/IssueRepository.java

package com.ewaste.repository;

import com.ewaste.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    // Custom query to fetch issues, potentially joining user data
    // (We will rely on a service method for complex fetching)
    List<Issue> findByUserId(Long userId);
}