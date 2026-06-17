import { useEffect, useMemo } from "react";
import { Trophy, X } from "lucide-react";

const CONFETTI_COLORS = [
  "var(--clay)",
  "var(--sage)",
  "var(--rose)",
  "var(--sky-pastel)",
  "var(--lavender)",
  "var(--mint)",
  "var(--lavender-accent)",
  "var(--sky-accent)",
];

type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  size: number;
  color: string;
  round: boolean;
};

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.4 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 240,
    rotate: Math.random() * 720,
    size: 7 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    round: Math.random() > 0.5,
  }));
}

export function Celebration({ onClose }: { onClose: () => void }) {
  const pieces = useMemo(() => makeConfetti(120), []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-celebrate-fade"
        onClick={onClose}
      />

      {/* Confetti layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute top-0 block animate-confetti-fall"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * (p.round ? 1 : 1.6)}px`,
              backgroundColor: p.color,
              borderRadius: p.round ? "9999px" : "2px",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              // custom props consumed by the keyframes
              ["--drift" as string]: `${p.drift}px`,
              ["--rot" as string]: `${p.rotate}deg`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-4xl border border-border bg-card p-8 text-center shadow-xl animate-celebrate-pop">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-clay/20 animate-celebrate-badge">
          <Trophy className="size-9 text-clay" strokeWidth={1.75} />
        </div>

        <h2
          id="celebration-title"
          className="font-serif-italic text-3xl leading-tight mb-2"
        >
          Bravo !
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Vous avez accompli{" "}
          <span className="font-semibold text-foreground">tous vos objectifs</span>{" "}
          du jour. Prenez un instant pour savourer ce moment. 🌿
        </p>

        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-clay py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
