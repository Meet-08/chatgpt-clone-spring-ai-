package com.meet.chatgpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.azure.openai.AzureOpenAiImageOptions;
import org.springframework.ai.image.ImageModel;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final ImageModel imageModel;

    public String generateImage(String query) {
        var imageOptions = AzureOpenAiImageOptions.builder()
                .N(1)
                .height(1024)
                .width(1024)
                .build();

        var prompt = new ImagePrompt(query, imageOptions);

        return imageModel.call(prompt)
                .getResult()
                .getOutput()
                .getB64Json();
    }
}
