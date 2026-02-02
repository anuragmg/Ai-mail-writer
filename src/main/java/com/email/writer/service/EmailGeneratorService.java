package com.email.writer.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.email.writer.app.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    // 🚨 Fail fast if key is missing
    @PostConstruct
    public void checkKey() {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException(
                    "Gemini API key is missing. Check GEMINI_API_KEY environment variable.");
        }
        System.out.println("Gemini API key loaded successfully");
    }

    public String generateEmailReply(EmailRequest emailRequest) {

        if (emailRequest.getEmailContent() == null ||
                emailRequest.getEmailContent().trim().length() < 10) {
            return "Please provide more detailed email content.";
        }

        String prompt = buildPrompt(emailRequest);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of(
                                "role", "user",
                                "parts", new Object[] {
                                        Map.of("text", prompt)
                                })
                });

        try {
            String response = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractResponseContent(response);

        } catch (WebClientResponseException e) {
            // 🔥 SHOW REAL GEMINI ERROR (never hide it)
            return "Gemini error: " + e.getResponseBodyAsString();

        } catch (Exception e) {
            return "Unexpected server error while generating email.";
        }
    }

    private String extractResponseContent(String response) {
        try {
            JsonNode rootNode = mapper.readTree(response);

            return rootNode
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            return "Error parsing Gemini response.";
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {

        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email. Do not include a subject line. ");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isBlank()) {
            prompt.append("Tone should be ")
                    .append(emailRequest.getTone())
                    .append(". ");
        }

        prompt.append("Email content: ")
                .append(emailRequest.getEmailContent());

        return prompt.toString();
    }
}
