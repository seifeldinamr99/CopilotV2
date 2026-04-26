import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = {
  value: string;
  sending: boolean;
  onChange: (next: string) => void;
  onSend: () => void;
};

export function ChatComposer({ value, sending, onChange, onSend }: Props) {
  const { t } = useI18n();
  return (
    <div className="border-t border-white/5 bg-black/30 px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <textarea
          className="min-h-[96px] flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-accent/60"
          placeholder={t("chat.askPlaceholder")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return;
            event.preventDefault();
            onSend();
          }}
        />
        <Button className="gap-2" disabled={!value.trim() || sending} onClick={onSend}>
          <Send className="h-4 w-4" />
          {sending ? t("chat.sending") : t("chat.send")}
        </Button>
      </div>
    </div>
  );
}
