import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ModuleTone } from "@/lib/sante-modules";
import { sendJournalMessage, type JournalMessage } from "@/lib/journal-chat";

const GREETING =
  "Bonsoir. Je suis là pour t'écouter un instant. Comment s'est passée ta journée, et comment te sens-tu maintenant ?";

// A few gentle openers to lower the barrier to writing the first message.
const STARTERS = [
  "Journée fatigante…",
  "Plutôt une bonne journée",
  "Je me sens stressé(e)",
  "Je ne sais pas trop",
];

/**
 * Conversational journal companion. The exchange lives only in component state
 * (ephemeral): it resets on reload and nothing is persisted. Each turn sends the
 * full history to the `sendJournalMessage` server function, which calls Claude.
 */
export function JournalChat({ tone }: { tone: ModuleTone }) {
  const [messages, setMessages] = useState<JournalMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;

    const next: JournalMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setError(null);
    setPending(true);

    try {
      // Only send the recent exchange — the server caps it too.
      const { reply } = await sendJournalMessage({ data: { messages: next.slice(-24) } });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("Je n'ai pas pu répondre à l'instant. Réessaie dans un moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
      <div ref={scrollRef} className="max-h-[52vh] overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="flex">
              <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-background border border-border px-3.5 py-2.5 text-sm leading-relaxed">
                {m.content}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p
                className={`max-w-[85%] rounded-2xl rounded-br-md ${tone.solid} text-white px-3.5 py-2.5 text-sm leading-relaxed`}
              >
                {m.content}
              </p>
            </div>
          ),
        )}

        {pending && (
          <div className="flex">
            <div className="rounded-2xl rounded-bl-md bg-background border border-border px-4 py-3">
              <TypingDots tone={tone} />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive px-1">{error}</p>}
      </div>

      {messages.length <= 1 && !pending && (
        <div className="flex flex-wrap gap-2 px-4 pb-1">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs rounded-full border border-border bg-background px-3 py-1.5 text-foreground/70 hover:bg-accent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          rows={1}
          placeholder="Écris ce que tu ressens…"
          className={`flex-1 resize-none bg-background rounded-2xl border border-border px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 ${tone.ring} max-h-32`}
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          aria-label="Envoyer"
          className={`size-10 shrink-0 rounded-2xl ${tone.solid} text-white flex items-center justify-center transition-opacity disabled:opacity-40`}
        >
          <Send className="size-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

function TypingDots({ tone }: { tone: ModuleTone }) {
  return (
    <span className="flex gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className={`size-1.5 rounded-full ${tone.soft} animate-bounce`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
