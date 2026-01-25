package com.ewaste.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate; // Use Spring's HTTP client
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    // Store history in a simple list of Maps (Stateful Service)
    private List<Map<String, Object>> conversationHistory = new ArrayList<>();

    @PostConstruct
    public void init() {
        System.out.println("Chatbot Service Initialized. Key available: " + !geminiApiKey.isEmpty());
        // Initialize history with a system message
        conversationHistory.add(Map.of("role", "user", "parts", List.of(Map.of("text", "You are the EcoWaste Management Assistant. Keep your answers brief, informative, and focused on e-waste guidelines or support.")))
        );
        // Add an initial bot greeting
        conversationHistory.add(Map.of("role", "model", "parts", List.of(Map.of("text", "Hello! I am your EcoWaste Assistant. How can I help you today?")))
        );
    }

    public String sendMessage(String userMessage) {
        try {
            // 1. Add the user's message to history
            conversationHistory.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));

            // 2. Build the request body with the entire history
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", conversationHistory);
            requestBody.put("safetySettings", List.of(
                    Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_LOW_AND_ABOVE")
            ));

            // 3. Set headers (Authorization via API Key in URL param)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String fullUrl = GEMINI_API_URL + "?key=" + geminiApiKey;

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // 4. Send the request
            ResponseEntity<Map> response = restTemplate.exchange(
                    fullUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            // 5. Extract the response text
            String botResponseText = "";
            if (response.getBody() != null && response.getBody().containsKey("candidates")) {
                List<Map> candidates = (List<Map>) response.getBody().get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    List<Map> parts = (List<Map>) content.get("parts");
                    if (!parts.isEmpty()) {
                        botResponseText = (String) parts.get(0).get("text");
                    }
                }
            }

            // 6. Add the model's response to history
            conversationHistory.add(Map.of("role", "model", "parts", List.of(Map.of("text", botResponseText))));

            return botResponseText;

        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            return "I sincerely apologize, but I encountered a network error while processing your request.";
        }
    }
}