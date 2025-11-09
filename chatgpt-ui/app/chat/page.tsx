"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useUIStore } from "../store/uiStore";

export default function Chat() {
  const {
    currentPrompt,
    setCurrentPrompt,
    appendToPrompt,
    messages,
    addMessage,
  } = useUIStore();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        await sendToBackend(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const sendToBackend = async (audioBlob: Blob) => {
    // Upload recorded audio to backend transcription API
    try {
      const formData = new FormData();
      // backend expects a multipart file named 'audioFile'
      formData.append("audioFile", audioBlob, "recording.webm");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s

      const res = await fetch("http://localhost:8080/api/v1/audio/transcribe", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Transcription failed: ${res.status} ${res.statusText} ${
            body ? `- ${body}` : ""
          }`
        );
      }

      const transcript = await res.text();
      if (transcript) {
        appendToPrompt(transcript);
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === "AbortError") {
        console.error("Transcription request timed out");
      } else {
        console.error("Error transcribing audio:", e?.message || err);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleSend = () => {
    if (currentPrompt.trim() || selectedFiles.length > 0) {
      addMessage({
        role: "user",
        content: currentPrompt,
        files: selectedFiles,
      });
      setCurrentPrompt("");
      setSelectedFiles([]);

      // Mock AI response
      setTimeout(() => {
        addMessage({
          role: "assistant",
          content: "This is a mock response from the AI.",
        });
      }, 1000);

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700 inline-flex items-center transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            💬 AI Chat
          </h1>
          <div></div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-xl">Start a conversation with AI</p>
                <p className="text-sm mt-2">
                  Ask questions, upload files, or use voice input
                </p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.files && msg.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.files.map((file, i) => (
                        <div
                          key={i}
                          className="text-xs opacity-75 flex items-center gap-1"
                        >
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      📎 {file.name}
                      <button
                        onClick={() =>
                          setSelectedFiles((files) =>
                            files.filter((_, idx) => idx !== i)
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message... (Press Enter to send)"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={1}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse"
                        : "bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl"
                    }`}
                    title={isRecording ? "Stop Recording" : "Start Voice Input"}
                  >
                    {isRecording ? "⏹️" : "🎤"}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Attach Files"
                  >
                    📎
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={
                      !currentPrompt.trim() && selectedFiles.length === 0
                    }
                    className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Send Message"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
