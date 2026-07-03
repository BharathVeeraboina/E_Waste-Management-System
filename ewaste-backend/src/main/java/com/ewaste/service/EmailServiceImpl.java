// src/main/java/com/ewaste/service/EmailServiceImpl.java

package com.ewaste.service;

import com.ewaste.entity.EwasteRequest;
import com.ewaste.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    // --- Helper Method for Sending ---
    private void sendSimpleEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("bharathyadaw74@gmail.com");
            message.setTo(toEmail);
            message.setText(body);
            message.setSubject(subject);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Mail sending failed to " + toEmail + ". Continuing application flow. Error: " + e.getMessage());
        }
    }

    // --- Interface Method Implementations ---

    @Override
    public void sendRegistrationNotification(String userEmail) {
        String subject = "Welcome to EcoWaste!";
        String body = "Thank you for registering! Your account is now active. You can log in and submit your first E-Waste request.";
        sendSimpleEmail(userEmail, subject, body);
    }

    @Override
    public void sendSubmissionConfirmation(EwasteRequest request) {
        String userEmail = request.getUser().getEmail();
        String subject = "E-Waste Request Submitted (ID: " + request.getId() + ")";
        String body = "Your request for " + request.getDeviceType() + " has been successfully submitted and is currently PENDING review by the administration.\n\n" +
                "We will notify you upon approval and scheduling.";
        sendSimpleEmail(userEmail, subject, body);
    }

    @Override
    public void sendStatusUpdateNotification(EwasteRequest request) {
        String userEmail = request.getUser().getEmail();
        String status = request.getStatus().name();
        String subject = "E-Waste Request Status Updated (ID: " + request.getId() + ")";
        String body;

        if (status.equals("SCHEDULED")) {
            body = "Your request has been APPROVED and SCHEDULED!\n\n" +
                    "Pickup Details:\n" +
                    "Date/Time: " + request.getScheduledAt() + "\n" +
                    "Personnel: " + request.getPickupPersonnel() + "\n" +
                    "Address: " + request.getPickupAddress();
        } else if (status.equals("APPROVED")) {
            body = "Your request for " + request.getDeviceType() + " has been APPROVED. The next step is scheduling the pickup.";
        } else if (status.equals("REJECTED")) {
            body = "We regret to inform you that your request has been REJECTED.\nReason: " + request.getRemarks();
        } else {
            body = "Your request status is now: " + status;
        }

        sendSimpleEmail(userEmail, subject, body);
    }

    public void sendOtpNotification(String userEmail, String otpCode) {
        String subject = "EcoWaste Pickup Verification Code";
        String body = "Your one-time verification code for confirming your E-Waste pickup is: " + otpCode +
                "\n\nPlease provide this code to the Pickup Personnel to finalize the collection. This code expires in 5 minutes.";
        sendSimpleEmail(userEmail, subject, body);
    }
}