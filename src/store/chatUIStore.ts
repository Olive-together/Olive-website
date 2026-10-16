import { create } from 'zustand';

interface ChatUIState {
  activeConversationId: string | null;
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  setActiveConversationId: (id: string | null) => void;
  setIsKeyboardOpen: (open: boolean, height?: number) => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  activeConversationId: null,
  isKeyboardOpen: false,
  keyboardHeight: 0,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setIsKeyboardOpen: (isKeyboardOpen, keyboardHeight = 0) =>
    set({ isKeyboardOpen, keyboardHeight }),
}));
