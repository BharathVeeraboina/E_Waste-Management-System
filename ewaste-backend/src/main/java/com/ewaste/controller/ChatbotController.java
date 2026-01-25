package com.ewaste.controller;

import com.ewaste.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    // DTO for simple message exchange (must be defined or imported)
    static class ChatMessage {
        public String message;

        // Getters/Setters/Constructors would be added here or via Lombok
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    // Secure endpoint called by the React frontend
    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody ChatMessage chatMessage) {
        try {
            // Service handles secure call to Gemini API
            String response = chatbotService.sendMessage(chatMessage.getMessage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Chatbot API Call Failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Chat service is temporarily unavailable.");
        }
    }
}