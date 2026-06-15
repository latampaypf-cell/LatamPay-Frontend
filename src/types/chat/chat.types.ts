export type ChatRole = "user" | "model";

export type ChatMessage = {
  role: ChatRole;
  text: string;
};

export type ChatRequest = {
  message: string;
  history?: ChatMessage[];
};

export type ChatResponse = {
  reply: string;
  updatedHistory: ChatMessage[];
};
