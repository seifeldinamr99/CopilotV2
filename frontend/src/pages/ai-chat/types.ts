export type ChatThread = {
  id: string;
  title: string;
  lastMessageAt: string;
  unread?: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};
