package com.meet.chatgpt.controller;

import com.meet.chatgpt.service.AudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/audio")
@CrossOrigin
@RequiredArgsConstructor
public class AudioController {

    private final AudioService audioService;

    @PostMapping("/transcribe")
    public ResponseEntity<String> transcribeAudio(@RequestBody MultipartFile audioFile) {
        String transcription = audioService.transcribeAudio(audioFile);
        System.out.println("Transcription: " + transcription);
        return ResponseEntity.ok(transcription);
    }

}
