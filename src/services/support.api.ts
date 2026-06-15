import { authStorage } from "./authStorage";
import type { ChatRequest, ChatResponse } from "../types/chat/chat.types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

type ApiEnvelope<T> = {
  status?: string;
  message?: string;
  data?: T;
};

async function postJson<T>(
  path: string,
  body: unknown,
  fallback: string,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok) throw new Error(json?.message ?? fallback);
  if (!json || json.data === undefined) {
    throw new Error(json?.message ?? fallback);
  }
  return json.data;
}

export const apiPublicChat = (payload: ChatRequest): Promise<ChatResponse> =>
  postJson<ChatResponse>(
    "/api/support/info",
    payload,
    "No pudimos contactar al asistente.",
  );

export const apiUserChat = (payload: ChatRequest): Promise<ChatResponse> =>
  postJson<ChatResponse>(
    "/api/support/chat",
    payload,
    "No pudimos contactar al asistente.",
    authStorage.getToken(),
  );
