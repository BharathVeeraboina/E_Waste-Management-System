package com.ewaste.service;
import java.io.InputStream;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import com.itextpdf.kernel.pdf.PdfPage;


import com.ewaste.dto.RequestSubmission;
import com.ewaste.dto.AdminActionRequest;
import com.ewaste.dto.UserReportData;
import com.ewaste.entity.EwasteRequest;
import com.ewaste.entity.EwasteRequest.RequestStatus;
import com.ewaste.entity.User;
import com.ewaste.repository.EwasteRequestRepository;
import com.ewaste.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import java.io.ByteArrayOutputStream;
import com.ewaste.entity.OtpVerification;
import com.ewaste.repository.OtpVerificationRepository;
import java.util.Random;

// --- iText Imports (ColorConstants import is deliberately omitted to fix compilation) ---
//import com.itextpdf.kernel.pdf.PdfDocument;
//import com.itextpdf.kernel.pdf.PdfWriter;
//import com.itextpdf.layout.Document;
//import com.itextpdf.layout.element.Paragraph;
//import com.itextpdf.layout.properties.TextAlignment;

@Service
public class RequestService {
    private final UserRepository userRepository;
    private final EwasteRequestRepository requestRepository;

    // Inside RequestService class definition (Add this field)
    @Autowired private OtpVerificationRepository otpRepository;
    @Autowired private EmailService emailService;
    private static final int CERTIFICATE_THRESHOLD = 10;

    public RequestService(EwasteRequestRepository requestRepository, UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    // --- Core Submission Logic (M2) ---
    @Transactional
    public EwasteRequest submitRequest(String userEmail, RequestSubmission dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        EwasteRequest request = new EwasteRequest();
        request.setUser(user);
        request.setDeviceType(dto.getDeviceType());
        request.setBrand(dto.getBrand());
        request.setModel(dto.getModel());
        request.setDeviceCondition(dto.getDeviceCondition());
        request.setQuantity(dto.getQuantity());
        request.setPickupAddress(dto.getPickupAddress());
        request.setRemarks(dto.getRemarks());
        request.setImagePaths(dto.getImagePaths());
        request.setCreatedAt(Instant.now());
        request.setUpdatedAt(Instant.now());
        request.setStatus(RequestStatus.PENDING);

        EwasteRequest savedRequest = requestRepository.save(request);
        emailService.sendSubmissionConfirmation(savedRequest);

        return savedRequest;
    }

    // --- Admin Action Logic (M3) ---
    @Transactional
    public EwasteRequest processAdminAction(Long requestId, AdminActionRequest action) {
        EwasteRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with ID: " + requestId));

        request.setStatus(action.getStatus());
        request.setUpdatedAt(Instant.now());

        if (action.getStatus() == RequestStatus.SCHEDULED) {
            java.time.LocalDateTime localDateTime = action.getScheduledAt();
            Instant scheduledInstant = localDateTime.atZone(ZoneId.systemDefault()).toInstant();

            request.setScheduledAt(scheduledInstant);
            request.setPickupPersonnel(action.getPickupPersonnel());
        } else if (action.getStatus() == RequestStatus.REJECTED && action.getRejectionReason() != null) {
            request.setRemarks("REJECTED: " + action.getRejectionReason());
        }

        EwasteRequest updatedRequest = requestRepository.save(request);
        emailService.sendStatusUpdateNotification(updatedRequest);

        return updatedRequest;
    }

    // --- User/Admin View and Reporting Logic ---

    public List<EwasteRequest> getRequestsByUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        return requestRepository.findByUserId(user.getId());
    }

    public List<EwasteRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    public UserReportData generateUserReport(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        List<EwasteRequest> allUserRequests = requestRepository.findByUserId(user.getId());

        long completedCount = allUserRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.APPROVED ||
                        r.getStatus() == RequestStatus.SCHEDULED)
                .count();

        long totalCount = allUserRequests.size();

        boolean isEligibleForCertificate = completedCount >= CERTIFICATE_THRESHOLD;

        return new UserReportData(
                user.getName(),
                totalCount,
                completedCount,
                isEligibleForCertificate,
                allUserRequests
        );
    }


    /**
     * CRITICAL METHOD: Generates a PDF Certificate if the user is eligible.
     */



    // --- Detail View Logic (M3) ---
    public EwasteRequest getRequestById(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with ID: " + requestId));
    }

    // --- Pickup Personnel Logic (M3) ---
    public List<EwasteRequest> getAssignedRequests(String personnelEmail) {
        return requestRepository.findByStatusAndPickupPersonnel(
                EwasteRequest.RequestStatus.SCHEDULED, personnelEmail
        );
    }

    public Resource generateCertificatePdf(String userEmail) {
        UserReportData reportData = generateUserReport(userEmail);

        if (!reportData.isEligibleForCertificate()) {
            throw new RuntimeException("User is not eligible for a contribution certificate.");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            PdfPage page = pdf.addNewPage(PageSize.A4);

            // Fonts
            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont fontItalic = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            float W = PageSize.A4.getWidth();
            float H = PageSize.A4.getHeight();

            // Size of the small certificate rectangle (width x height)
            // Adjust these values if you want a larger/smaller rectangle
            final float certW = 520f;   // approx half to two-thirds of A4 width
            final float certH = 320f;   // compact height
            final float certX = (W - certW) / 2f;
            final float certY = (H - certH) / 2f;

            PdfCanvas canvas = new PdfCanvas(page);

            // Draw outer subtle border rectangle for the small certificate
            canvas.setLineWidth(1.2f)
                    .setStrokeColor(new DeviceRgb(100, 100, 100))
                    .rectangle(certX, certY, certW, certH)
                    .stroke();

            // Thin green accent line at top inside the rectangle
            float accentHeight = 6f;
            canvas.setFillColor(new DeviceRgb(14, 110, 67))
                    .rectangle(certX + 10f, certY + certH - 18f, certW - 20f, accentHeight)
                    .fill();

            // Create a Canvas scoped to the rectangle for flow content
            Canvas certCanvas = new Canvas(canvas, new Rectangle(certX + 14f, certY + 14f, certW - 28f, certH - 28f));

            // Top row: organization name (small) centered
            certCanvas.add(new Paragraph("E-WASTE MANAGEMENT")
                    .setFont(fontBold)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(8f)
                    .setMarginBottom(6f));

            // Title
            certCanvas.add(new Paragraph("Certificate of Contribution")
                    .setFont(fontBold)
                    .setFontSize(16)
                    .setFontColor(new DeviceRgb(0, 85, 45))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(8f));

            // Intro line
            certCanvas.add(new Paragraph("This certificate is hereby presented to")
                    .setFont(font)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(6f));

            // Recipient name (dynamic) — prominent
            certCanvas.add(new Paragraph(reportData.getUserName())
                    .setFont(fontBold)
                    .setFontSize(26)
                    .setFontColor(new DeviceRgb(0, 70, 35))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(8f));

            // Description and contributions
            certCanvas.add(new Paragraph("In recognition of exemplary participation in e-waste collection, responsible disposal and recycling.")
                    .setFont(font)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(6f));

            certCanvas.add(new Paragraph("Validated Contributions: " + reportData.getCompletedSubmissions())
                    .setFont(font)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10f));

            certCanvas.add(new Paragraph("\"Thank you for helping keep electronics out of landfills and giving them a second life.\"")
                    .setFont(fontItalic)
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(6f));

            // Bottom metadata row inside rectangle: date left, verification id right
            String issuedOn = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
            String verificationCode = "EVT-" + Long.toHexString(Math.abs(reportData.getUserName().hashCode())).toUpperCase();

            // Use a small table with two columns for alignment
            com.itextpdf.layout.element.Table metaTable = new com.itextpdf.layout.element.Table(new float[]{1, 1});
            metaTable.setWidth(certW - 28f);
            metaTable.setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);

            metaTable.addCell(new com.itextpdf.layout.element.Cell()
                    .add(new Paragraph("Date Issued: " + issuedOn).setFont(font).setFontSize(9))
                    .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.LEFT));

            metaTable.addCell(new com.itextpdf.layout.element.Cell()
                    .add(new Paragraph("Verification ID: " + verificationCode).setFont(font).setFontSize(9))
                    .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT));

            metaTable.setMarginTop(6f);
            certCanvas.add(metaTable);

            // Single small website line centered below metadata (still inside rectangle)
            certCanvas.add(new Paragraph("www.ewastemanagement.example")
                    .setFont(font)
                    .setFontSize(9)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(6f));

            // Close the cert canvas so nothing else is printed below
            certCanvas.close();

            // finalize pdf
            pdf.close();

            return new ByteArrayResource(baos.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF certificate: " + e.getMessage(), e);
        }
    }



    // Helper method to generate a new 6-digit OTP
    private String generateNewOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    /**
     * Step 1: Generates and sends OTP to the user for verification.
     */
    @Transactional
    public void initiatePickupVerification(Long requestId) {
        EwasteRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));

        if (request.getStatus() != RequestStatus.SCHEDULED) {
            throw new RuntimeException("Pickup must be scheduled to start verification.");
        }

        // 1. Generate and Save OTP
        String otpCode = generateNewOtp();
        OtpVerification verification = new OtpVerification();
        verification.setUserEmail(request.getUser().getEmail());
        verification.setOtpCode(otpCode);
        verification.setRequest(request);

        // Assuming findByRequestId exists in OtpVerificationRepository
        otpRepository.findByRequestId(requestId).ifPresent(otpRepository::delete);
        otpRepository.save(verification);

        // 2. Send OTP to User
        emailService.sendOtpNotification(request.getUser().getEmail(), otpCode);
    }

    /**
     * Step 2: Final Verification and Completion of Pickup Task.
     */
    @Transactional
    public void completePickupTask(Long requestId, String submittedOtp) {
        EwasteRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found."));

        // 1. Find the active OTP for this request
        // NOTE: This relies on OtpVerificationRepository.findByRequestIdAndUserEmail(Long, String)
        // Ensure you define this method in your OtpVerificationRepository interface.
        OtpVerification verification = otpRepository.findByRequestIdAndUserEmail(requestId, request.getUser().getEmail())
                .orElseThrow(() -> new RuntimeException("Verification code required."));

        // 2. Check Expiry and Code
        if (verification.getExpiryTime().isBefore(Instant.now())) {
            throw new RuntimeException("OTP has expired. Please request a new code.");
        }
        if (!verification.getOtpCode().equals(submittedOtp)) {
            throw new RuntimeException("Invalid OTP provided.");
        }

        // 3. Mark as Completed
        request.setStatus(RequestStatus.COMPLETED);
        request.setUpdatedAt(Instant.now());
        requestRepository.save(request);

        // 4. Delete OTP record
        otpRepository.delete(verification);
    }

}