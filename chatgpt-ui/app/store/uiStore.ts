import { create } from "zustand";

interface Message {
  role: "user" | "assistant";
  content: string;
  files?: File[];
}

interface UIState {
  currentPrompt: string;
  isRecording: boolean;
  messages: Message[];
  setCurrentPrompt: (prompt: string) => void;
  setIsRecording: (recording: boolean) => void;
  appendToPrompt: (text: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPrompt: "",
  isRecording: false,
  messages: [],
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  appendToPrompt: (text) =>
    set((state) => ({ currentPrompt: state.currentPrompt + text })),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
