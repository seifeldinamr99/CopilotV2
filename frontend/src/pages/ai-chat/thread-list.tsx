import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import type { ChatThread } from "./types";
import { useI18n } from "@/lib/i18n";

type Props = {
  threads: ChatThread[];
  activeThreadId: string | null;
  loading: boolean;
  onNewChat: () => void;
  onSelectThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
};

export function ThreadList({
  threads,
  activeThreadId,
  loading,
  onNewChat,
  onSelectThread,
  onDeleteThread,
}: Props) {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  return (
    <aside
      className={[
        "flex flex-col bg-black/40",
        isRtl ? "border-l border-white/5" : "border-r border-white/5",
      ].join(" ")}
    >
      <div className="border-b border-white/5 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">{t("chat.metaCopilot")}</p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">{t("chat.conversationHistory")}</h2>
        <div
          className={[
            "mt-3 flex items-center gap-2",
            isRtl ? "flex-row-reverse justify-end" : "flex-row justify-start",
          ].join(" ")}
        >
          <Badge variant="secondary" className="bg-white/5 text-muted-foreground">
            {t("chat.autoLanguage")}
          </Badge>
          <Button
            variant="secondary"
            className={[
              "gap-2 border border-white/10",
              isRtl ? "flex-row-reverse" : "flex-row",
            ].join(" ")}
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
            {t("chat.newChat")}
          </Button>
        </div>
      </div>

      <ScrollArea className={`flex-1 px-4 py-4 ${isRtl ? "text-right" : "text-left"}`}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            {t("chat.loadingChats")}
          </div>
        ) : threads.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="text-sm font-medium text-foreground">{t("chat.noConversations")}</p>
            <p className="text-xs text-muted-foreground">{t("chat.noConversationsHint")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={[
                  "w-full rounded-2xl border px-4 py-3 text-sm transition",
                  locale === "ar" ? "text-right" : "text-left",
                  thread.id === activeThreadId
                    ? "border-accent/40 bg-accent/10"
                    : "border-white/5 bg-black/20 hover:border-white/20",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center justify-between gap-2",
                    isRtl ? "flex-row-reverse" : "flex-row",
                  ].join(" ")}
                >
                  <span className="font-medium text-foreground">{thread.title}</span>
                  <span className="flex items-center gap-2">
                    {thread.unread ? (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                        {thread.unread}
                      </span>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                      title={t("chat.deleteConversation")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </span>
                </div>
                <p className={`mt-1 text-xs text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}>
                  {formatTimestamp(thread.lastMessageAt, locale)}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}

function formatTimestamp(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.getDate();
  const localeTag = locale === "ar" ? "ar-EG" : "en-US";
  const month = date.toLocaleString(localeTag, { month: "short" });
  const time = date
    .toLocaleTimeString(localeTag, { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  return `${day} ${month} ${time}`;
}
