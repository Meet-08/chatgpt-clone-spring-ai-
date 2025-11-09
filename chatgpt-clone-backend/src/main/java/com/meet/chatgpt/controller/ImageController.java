package com.meet.chatgpt.controller;

import com.meet.chatgpt.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/image")
@CrossOrigin
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateImage(@RequestParam String prompt) {
        return ResponseEntity.ok().body(imageService.generateImage(prompt));
    }
}
