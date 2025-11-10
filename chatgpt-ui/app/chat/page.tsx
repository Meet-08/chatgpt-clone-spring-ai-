"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Bot,
  Mic,
  MicOff,
  Paperclip,
  Send,
  User,
} from "lucide-react";
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
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = async () => {
    if (!currentPrompt.trim() && selectedFiles.length === 0) return;

    setIsSending(true);
    addMessage({ role: "user", content: currentPrompt, files: selectedFiles });

    const form = new FormData();
    form.append("query", currentPrompt);
    selectedFiles.forEach((f) => form.append("files", f)); // name "files" matches @RequestPart

    setCurrentPrompt("");
    setSelectedFiles([]);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("http://localhost:8080/api/v1/chat/message", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!res.ok) throw new Error(await res.text().catch(() => "Chat failed"));

      const text = await res.text();
      addMessage({ role: "assistant", content: text });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      addMessage({
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Bot className="h-6 w-6" />
              AI Chat
            </CardTitle>
            <div></div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-xl">Start a conversation with AI</p>
                <p className="text-sm mt-2">
                  Ask questions, upload files, or use voice input
                </p>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-start gap-3 max-w-xs lg:max-w-md">
                    {msg.role === "assistant" && (
                      <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.files && msg.files.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.files.map((file, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              <Paperclip className="h-3 w-3 mr-1" />
                              {file.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Paperclip className="h-3 w-3" />
                      {file.name}
                      <button
                        onClick={() =>
                          setSelectedFiles((files) =>
                            files.filter((_, idx) => idx !== i)
                          )
                        }
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                    className="min-h-[60px] resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={1}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                  />
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className={`transition-all duration-300 ${
                      isRecording ? "animate-pulse" : ""
                    }`}
                    title={isRecording ? "Stop Recording" : "Start Voice Input"}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="icon"
                    title="Attach Files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={
                      (!currentPrompt.trim() && selectedFiles.length === 0) ||
                      isSending
                    }
                    size="icon"
                    title="Send Message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
