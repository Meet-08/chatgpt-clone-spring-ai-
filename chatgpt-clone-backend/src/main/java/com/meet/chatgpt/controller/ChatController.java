package com.meet.chatgpt.controller;

import com.meet.chatgpt.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<String> getChatResponse(
            @RequestPart String query,
            @RequestPart(required = false) List<MultipartFile> files
    ) {
        var response = chatService.getChatResponse(query, files);

        return ResponseEntity.ok(response);
    }
}
