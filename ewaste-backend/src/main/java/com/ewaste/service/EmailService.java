// src/main/java/com/ewaste/service/EmailService.java

package com.ewaste.service;

import com.ewaste.entity.EwasteRequest;

public interface EmailService {

    // Define the methods being called in the service layer
    void sendRegistrationNotification(String userEmail);
    void sendSubmissionConfirmation(EwasteRequest request);
    void sendStatusUpdateNotification(EwasteRequest request);

    void sendOtpNotification(String userEmail, String otpCode);
    // NOTE: If you previously had a generic sendNotification(EwasteRequest),
    // we must delete it to resolve the "does not override abstract method" error.
}