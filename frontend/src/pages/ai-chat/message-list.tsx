import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "./types";
import { useI18n } from "@/lib/i18n";

type Props = {
  messages: ChatMessage[];
  loading: boolean;
};

export function MessageList({ messages, loading }: Props) {
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const hasMessages = messages.length > 0;
  return (
    <ScrollArea
      className={`flex-1 min-h-0 h-full px-6 ${hasMessages ? "py-6" : "py-0"} ${
        locale === "ar" ? "text-right" : "text-left"
      }`}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          {t("chat.loadingMessages")}
        </div>
      ) : !hasMessages ? (
        <div className="flex min-h-full items-center justify-center">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center">
          <Sparkles className="h-6 w-6 text-accent" />
          <p className="text-sm font-medium text-foreground">{t("chat.startConversation")}</p>
          <p className="text-xs text-muted-foreground">{t("chat.startConversationHint")}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "bg-accent/20 text-foreground"
                    : "bg-black/30 text-muted-foreground"
                }`}
              >
                <div
                  className="max-w-none text-sm leading-7 text-white/90"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={getMarkdownComponents(isRtl)}
                  >
                    {extractAssistantText(message.content)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

function getMarkdownComponents(isRtl: boolean) {
  return {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-6 text-[13px] font-semibold text-white">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-4 text-[12px] font-semibold text-white/90">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => <p className="mt-2 text-white/80">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul
      className={`mt-2 space-y-2 list-disc list-inside ${
        isRtl ? "pr-2" : "pl-2"
      }`}
    >
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol
      className={`mt-2 space-y-2 list-decimal list-inside ${
        isRtl ? "pr-2" : "pl-2"
      }`}
    >
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-white/80 marker:text-white/40">{children}</li>
  ),
  hr: () => <div className="my-6 h-px w-full bg-white/10" />,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="text-white">{children}</strong>,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
      <table className={`w-full border-collapse text-xs text-white/80 ${isRtl ? "text-right" : "text-left"}`}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-white/5 text-white">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody className="divide-y divide-white/10">{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => <tr className="align-top">{children}</tr>,
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/70">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => <td className="px-3 py-2 text-white/80">{children}</td>,
};
}

function extractAssistantText(raw: string) {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  if (candidate.startsWith("{") && candidate.endsWith("}")) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed?.response) return String(parsed.response);
    } catch {
      // Fall through to raw content.
    }
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.response) return String(parsed.response);
    } catch {
      // Ignore parsing errors.
    }
  }

  return trimmed;
}
