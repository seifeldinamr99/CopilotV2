import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { ThreadList } from "./thread-list";
import { MessageList } from "./message-list";
import { ChatComposer } from "./chat-composer";
import { createSession, deleteSession, fetchMessages, fetchSessions, sendChat } from "./api";
import type { ChatMessage, ChatThread } from "./types";
import { useI18n } from "@/lib/i18n";

type CreateResult = { session?: ChatThread };

type ChatResponse = {
  userMessage?: ChatMessage;
  assistantMessage?: ChatMessage;
};

const emptyThreads: ChatThread[] = [];
const emptyMessages: ChatMessage[] = [];

export function AiChatPage() {
  const session = useAuthStore((s) => s.session);
  const accessToken = session?.access_token ?? null;
  const { t, locale } = useI18n();

  const [threads, setThreads] = useState<ChatThread[]>(emptyThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(emptyMessages);
  const [input, setInput] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads]
  );

  useEffect(() => {
    if (!accessToken) return;
    let canceled = false;
    setLoadingThreads(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchSessions(accessToken);
        const list = Array.isArray(data.sessions) ? data.sessions : [];
        if (!canceled) {
          setThreads(list);
          if (!activeThreadId && list.length > 0) setActiveThreadId(list[0].id);
        }
      } catch (err) {
        if (!canceled) setError(err instanceof Error ? err.message : "Failed to load chat sessions.");
      } finally {
        if (!canceled) setLoadingThreads(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !activeThreadId) {
      setMessages([]);
      return;
    }
    let canceled = false;
    setLoadingMessages(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchMessages(accessToken, activeThreadId);
        if (!canceled) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch (err) {
        if (!canceled) setError(err instanceof Error ? err.message : "Failed to load messages.");
      } finally {
        if (!canceled) setLoadingMessages(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [accessToken, activeThreadId]);

  const handleNewChat = async () => {
    if (!accessToken) return;
    setError(null);
    try {
      const data = (await createSession(accessToken, t("chat.newConversation"))) as CreateResult;
      if (data.session) {
        setThreads((prev) => [data.session as ChatThread, ...prev]);
        setActiveThreadId(data.session.id);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat session.");
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!accessToken) return;
    setError(null);
    try {
      await deleteSession(accessToken, threadId);
      setThreads((prev) => prev.filter((item) => item.id !== threadId));
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session.");
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !accessToken) return;
    setSending(true);
    setError(null);

    try {
      let sessionId = activeThreadId;
      if (!sessionId) {
        const data = (await createSession(accessToken, t("chat.newConversation"))) as CreateResult;
        sessionId = data.session?.id ?? null;
        if (!sessionId) throw new Error("Failed to create chat session.");
        setThreads((prev) => [data.session as ChatThread, ...prev]);
        setActiveThreadId(sessionId);
        setMessages([]);
      }

      const data = (await sendChat(accessToken, sessionId, trimmed)) as ChatResponse;
      if (data.userMessage || data.assistantMessage) {
        setMessages((prev) =>
          [...prev, data.userMessage, data.assistantMessage].filter(Boolean) as ChatMessage[],
        );
        setInput("");
        const nextTime = data.assistantMessage?.createdAt ?? data.userMessage?.createdAt;
        if (nextTime) {
          setThreads((prev) =>
            prev.map((thread) =>
              thread.id === sessionId ? { ...thread, lastMessageAt: nextTime } : thread,
            ),
          );
        }
        if (data.userMessage?.content) {
          setThreads((prev) =>
            prev.map((thread) =>
              thread.id === sessionId
                ? { ...thread, title: data.userMessage.content.slice(0, 80) }
                : thread,
            ),
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] pt-6">
      <div className="relative grid h-full gap-0 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0a0f1f] via-[#0a0f17] to-[#05070d] lg:grid-cols-[320px_1fr]">
        <ThreadList
          threads={threads}
          activeThreadId={activeThreadId}
          loading={loadingThreads}
          onNewChat={handleNewChat}
          onSelectThread={setActiveThreadId}
          onDeleteThread={handleDeleteThread}
        />

        <section className={`flex h-full flex-col overflow-hidden ${locale === "ar" ? "text-right" : "text-left"}`}>
          <MessageList messages={messages} loading={loadingMessages} />
          <ChatComposer value={input} sending={sending} onChange={setInput} onSend={handleSend} />
        </section>
      </div>
      {error && (
        <Card className="mt-4 border border-white/5 bg-card/90">
          <div className="py-3 text-center text-xs text-red-300">{error}</div>
        </Card>
      )}
    </div>
  );
}
