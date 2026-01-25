package com.ewaste.controller;

import com.ewaste.dto.RequestSubmission;
import com.ewaste.dto.AdminActionRequest;
import com.ewaste.dto.OtpVerificationRequest; // Imported DTO for completion
import com.ewaste.entity.EwasteRequest;
import com.ewaste.service.RequestService;
import com.ewaste.service.FileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.ewaste.dto.UserReportData;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService requestService;
    private final FileService fileService;

    public RequestController(RequestService requestService, FileService fileService) {
        this.requestService = requestService;
        this.fileService = fileService;
    }

    // 1. E-WASTE SUBMISSION ENDPOINT
    @PostMapping("/submit")
    public ResponseEntity<EwasteRequest> submitRequest(
            @RequestPart("data") @Valid RequestSubmission dto,
            @RequestPart(value = "image_top", required = false) MultipartFile imageTop,
            @RequestPart(value = "image_front", required = false) MultipartFile imageFront,
            @RequestPart(value = "image_right", required = false) MultipartFile imageRight,
            @RequestPart(value = "image_back", required = false) MultipartFile imageBack,
            @RequestPart(value = "image_other", required = false) MultipartFile imageOther,
            Principal principal,
            @RequestHeader("X-User-Email") String userEmail) {

        try {
            List<MultipartFile> files = Arrays.asList(imageTop, imageFront, imageRight, imageBack, imageOther);
            List<String> paths = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    paths.add(fileService.saveFile(file));
                }
            }

            if (!paths.isEmpty()) {
                dto.setImagePaths(String.join(",", paths));
            }

            EwasteRequest submittedRequest = requestService.submitRequest(userEmail, dto);
            return new ResponseEntity<>(submittedRequest, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 2. USER TRACKING ENDPOINT
    @GetMapping("/my-requests")
    public ResponseEntity<List<EwasteRequest>> getMyRequests(
            @RequestHeader("X-User-Email") String userEmail) {

        List<EwasteRequest> requests = requestService.getRequestsByUserEmail(userEmail);
        return ResponseEntity.ok(requests);
    }

    // 3. ADMIN VIEW ENDPOINT
    @GetMapping("/admin/all")
    public ResponseEntity<List<EwasteRequest>> getAllRequests() {
        List<EwasteRequest> allRequests = requestService.getAllRequests();
        return ResponseEntity.ok(allRequests);
    }

    // 4. ADMIN STATUS UPDATE ENDPOINT
    @PutMapping("/admin/status/{requestId}")
    public ResponseEntity<EwasteRequest> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestBody AdminActionRequest action) {

        try {
            EwasteRequest updatedRequest = requestService.processAdminAction(requestId, action);

            return ResponseEntity.ok(updatedRequest);

        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // 5. PICKUP PERSONNEL OTP ENDPOINTS (CRITICAL FIXES HERE)

    // 🟢 FIX 1: Initiate OTP and send email (Service requires only the ID)
    @PostMapping("/pickup/verify/initiate/{requestId}")
    public ResponseEntity<Void> initiatePickupVerification(
            @PathVariable Long requestId,
            @RequestHeader("X-User-Email") String pickupPersonnelEmail) { // Retaining email for security context
        try {
            // Service method is called with ONLY the request ID
            requestService.initiatePickupVerification(requestId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // 🟢 FIX 2: Final Verification and Completion (Service requires ID and OTP string)
    @PutMapping("/pickup/verify/complete/{requestId}")
    public ResponseEntity<Void> completePickupTask(
            @PathVariable Long requestId,
            @Valid @RequestBody OtpVerificationRequest dto) { // Accepts OTP DTO
        try {
            // CRITICAL FIX: Pass BOTH requestId and the submitted OTP string
            requestService.completePickupTask(requestId, dto.getOtp());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // 6. OTHER ENDPOINTS

    @GetMapping("/{id}")
    public ResponseEntity<EwasteRequest> getRequestById(@PathVariable Long id) {

        try {
            EwasteRequest request = requestService.getRequestById(id);

            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/pickup/my-tasks")
    public ResponseEntity<List<EwasteRequest>> getPickupTasks(
            @RequestHeader("X-User-Email") String personnelEmail) {

        List<EwasteRequest> tasks = requestService.getAssignedRequests(personnelEmail);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/report")
    public ResponseEntity<UserReportData> generateReport(
            @RequestHeader("X-User-Email") String userEmail) {

        UserReportData reportData = requestService.generateUserReport(userEmail);
        return ResponseEntity.ok(reportData);
    }

    @GetMapping("/report/certificate")
    public ResponseEntity<Resource> downloadCertificate(
            @RequestHeader("X-User-Email") String userEmail) {

        try {
            Resource certificateFile = requestService.generateCertificatePdf(userEmail);

            String filename = "EcoWaste_Certificate_" + userEmail.split("@")[0] + ".pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(certificateFile);

        } catch (RuntimeException e) {
            System.err.println("Certificate generation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}