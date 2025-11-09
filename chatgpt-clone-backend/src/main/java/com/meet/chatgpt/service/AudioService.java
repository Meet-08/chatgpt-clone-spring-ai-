package com.meet.chatgpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.azure.openai.AzureOpenAiAudioTranscriptionModel;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AudioService {

    private final AzureOpenAiAudioTranscriptionModel transcriptionModel;

    public String transcribeAudio(MultipartFile audioFile) {
        return transcriptionModel.call(audioFile.getResource());
    }
}
