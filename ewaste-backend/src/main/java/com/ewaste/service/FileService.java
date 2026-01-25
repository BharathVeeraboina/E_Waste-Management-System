// src/main/java/com/ewaste/service/FileService.java

package com.ewaste.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {

    // Define the upload directory relative to the project root
    private final Path uploadDir = Paths.get("uploads");

    public FileService() throws IOException {
        // Ensure the directory exists when the service starts
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
    }

    public String saveFile(MultipartFile file) {
        try {
            // Generate a unique file name to prevent conflicts
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            Path filePath = this.uploadDir.resolve(uniqueFileName);

            // Write the file to the local disk
            Files.copy(file.getInputStream(), filePath);

            // Return the unique file path relative to the application
            return "/uploads/" + uniqueFileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }
}