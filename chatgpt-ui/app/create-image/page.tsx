"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
    // Upload recorded audio to backend transcription API
    try {
      const formData = new FormData();
      // backend expects a multipart file named 'audioFile' (see Java controller)
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
        setError("Transcription timed out. Please try again.");
      } else {
        console.error("Error transcribing audio:", e?.message || err);
        setError(e?.message || "Failed to transcribe audio.");
      }
    }
  };

  // Image generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const previousObjectUrlRef = useRef<string | null>(null);

  const handleGenerate = async () => {
    const prompt = currentPrompt.trim();
    if (!prompt) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Follow the OpenAPI: POST /api/v1/image/generate with prompt as query param
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(
        `http://localhost:8080/api/v1/image/generate?prompt=${encodeURIComponent(
          prompt
        )}`,
        {
          method: "POST",
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Server returned ${res.status} ${res.statusText} ${
            body ? `- ${body}` : ""
          }`
        );
      }

      // Check response content-type to decide how to handle
      const contentType = (res.headers.get("content-type") || "").toLowerCase();

      // If server returned actual image bytes, treat as blob
      if (contentType.startsWith("image/")) {
        const blob = await res.blob();
        // revoke previous object URL if present
        if (previousObjectUrlRef.current) {
          try {
            URL.revokeObjectURL(previousObjectUrlRef.current);
          } catch {}
          previousObjectUrlRef.current = null;
        }

        const objectUrl = URL.createObjectURL(blob);
        previousObjectUrlRef.current = objectUrl;
        setImageMime(blob.type || "image/png");
        setGeneratedImage(objectUrl);
      } else {
        // Otherwise handle as text (could be a direct URL, data URL, or base64)
        const text = await res.text();

        if (!text) {
          throw new Error("Empty response from image generation API.");
        }

        let imgSrc = text;
        if (text.startsWith("http") || text.startsWith("data:")) {
          imgSrc = text;
        } else {
          let mime = "image/png";
          if (/^\s*\/9j/.test(text)) {
            mime = "image/jpeg";
          } else if (text.startsWith("iVBOR")) {
            mime = "image/png";
          }
          imgSrc = `data:${mime};base64,${text}`;
          setImageMime(mime);
        }

        // If previously we had an object URL, revoke it
        if (previousObjectUrlRef.current) {
          try {
            URL.revokeObjectURL(previousObjectUrlRef.current);
          } catch {}
          previousObjectUrlRef.current = null;
        }

        setGeneratedImage(imgSrc);
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === "AbortError") {
        setError("Image generation timed out. Please try again.");
      } else {
        setError(e?.message || "Failed to generate image.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Clean up any created object URLs on unmount
  useEffect(() => {
    return () => {
      if (previousObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(previousObjectUrlRef.current);
        } catch {}
        previousObjectUrlRef.current = null;
      }
    };
  }, []);

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
              disabled={isGenerating}
              className="w-full px-6 py-4 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating... ✨" : "✨ Generate Image"}
            </button>

            {/* Result / Error area */}
            <div className="mt-6">
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 mb-4">
                  {error}
                </div>
              )}

              {generatedImage && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    {generatedImage.startsWith("blob:") ? (
                      // blob/object URLs — use a plain img tag
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-auto rounded-md mx-auto"
                      />
                    ) : (
                      <Image
                        src={generatedImage}
                        alt="Generated"
                        width={1024}
                        height={1024}
                        className="w-full h-auto rounded-md mx-auto"
                      />
                    )}
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={generatedImage}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
                    >
                      Open in new tab
                    </a>
                    <a
                      href={generatedImage}
                      download={`generated-image.${
                        imageMime
                          ? imageMime.includes("jpeg")
                            ? "jpg"
                            : imageMime.split("/")[1] ?? "png"
                          : "png"
                      }`}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
