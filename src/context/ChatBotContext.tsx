import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiPublicChat, apiUserChat } from "../services/support.api";
import type { ChatMessage } from "../types/chat/chat.types";

export type ChatBotContextValue = {
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sendMessage: (text: string) => Promise<boolean>;
  reset: () => void;
};

const ChatBotContext = createContext<ChatBotContextValue | null>(null);

type ChatBotProviderProps = {
  children: ReactNode;
};

export function ChatBotProvider({ children }: ChatBotProviderProps) {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si cambia el estado de auth, reiniciamos para evitar mezclar contextos.
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [isAuthenticated]);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return false;

      setError(null);
      const optimisticUserMsg: ChatMessage = { role: "user", text: trimmed };
      const baseHistory = messages;
      setMessages([...baseHistory, optimisticUserMsg]);
      setIsSending(true);

      try {
        const payload = { message: trimmed, history: baseHistory };
        const { updatedHistory } = isAuthenticated
          ? await apiUserChat(payload)
          : await apiPublicChat(payload);
        setMessages(updatedHistory);
        return true;
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : "No pudimos contactar al asistente.";
        setError(message);
        // Revertimos el mensaje optimista para evitar conversación rota.
        setMessages(baseHistory);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [isAuthenticated, isSending, messages],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const value = useMemo<ChatBotContextValue>(
    () => ({
      messages,
      isSending,
      error,
      isAuthenticated,
      sendMessage,
      reset,
    }),
    [messages, isSending, error, isAuthenticated, sendMessage, reset],
  );

  return (
    <ChatBotContext.Provider value={value}>{children}</ChatBotContext.Provider>
  );
}

export function useChatBot(): ChatBotContextValue {
  const ctx = useContext(ChatBotContext);
  if (!ctx) {
    throw new Error("useChatBot debe usarse dentro de un <ChatBotProvider>.");
  }
  return ctx;
}
