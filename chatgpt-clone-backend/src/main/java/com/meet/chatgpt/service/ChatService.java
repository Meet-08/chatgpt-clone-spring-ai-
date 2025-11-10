package com.meet.chatgpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final TokenTextSplitter tokenTextSplitter;

    public String getChatResponse(String query, List<MultipartFile> files) {
        if (files != null && !files.isEmpty()) {
            var newQuery = new StringBuilder(query);
            newQuery.append("\n\nThe following files were provided:\n");
            for (var file : files) {
                try {
                    var reader = new PagePdfDocumentReader(file.getResource());
                    var pages = reader.read();
                    var splitDocs = tokenTextSplitter.split(pages);
                    vectorStore.add(splitDocs);
                    newQuery.append("- ").append(file.getOriginalFilename()).append("\n");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            query = newQuery.toString();
        }

        var promptTemplate = new PromptTemplate("""
                {query}
                
                Context information is below, surrounded by ---------------------
                
                ---------------------
                {question_answer_context}
                ---------------------
                
                Given the context and provided history information and not prior knowledge,
                reply to the user accordingly. Even if the context contains
                irrelevant information, try to answer the question as best as possible.
                """);

        var questionAdvisor = QuestionAnswerAdvisor
                .builder(vectorStore)
                .promptTemplate(promptTemplate)
                .build();

        return chatClient.
                prompt(query)
                .advisors(questionAdvisor)
                .call()
                .content();
    }

}
