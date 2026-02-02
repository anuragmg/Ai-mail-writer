package com.email.writer.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.email.writer.service.EmailGeneratorService;
import com.email.writer.app.EmailRequest;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class EmailGenerateController {

    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generateEmail(
            @RequestBody EmailRequest emailRequest) {

        String reply = emailGeneratorService.generateEmailReply(emailRequest);

        // ✅ ALWAYS return JSON
        return ResponseEntity.ok(
                Map.of("reply", reply));
    }
}
