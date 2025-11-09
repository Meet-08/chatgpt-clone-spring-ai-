"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useUIStore } from "../store/uiStore";

export default function CreateImage() {
  const { currentPrompt, setCurrentPrompt, appendToPrompt } = useUIStore();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    // Mock API call
    const formData = new FormData();
    formData.append("audio", audioBlob);

    // Simulate API response
    setTimeout(() => {
      const mockTranscript = "This is a mock transcript from the audio.";
      appendToPrompt(mockTranscript);
    }, 2000);
  };

  const handleGenerate = () => {
    // Mock generate image
    alert(`Generating image with prompt: ${currentPrompt}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-700 mb-6 inline-flex items-center transition-colors"
        >
          ← Back to Home
        </Link>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-linear-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            🎨 Create Image
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your image
              </label>
              <textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder="A beautiful sunset over mountains..."
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {isRecording ? "⏹️ Stop Recording" : "🎤 Start Recording"}
              </button>
              {isRecording && (
                <span className="text-red-500 font-medium animate-pulse">
                  Recording...
                </span>
              )}
            </div>
            <button
              onClick={handleGenerate}
              className="w-full px-6 py-4 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              ✨ Generate Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
