import { useEffect, useState } from "react";
import { Activity, Dumbbell, Bike, Flame, Timer, Medal } from "lucide-react";

/**
 * Écran de démarrage façon « univers du sport » :
 * piste d'athlétisme qui tourne, badge fréquence-cardiaque qui pulse,
 * icônes sport flottantes, wordmark et barre de progression.
 *
 * Le composant gère son propre minutage puis appelle `onFinish`.
 */
export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 1750);
    const t2 = setTimeout(onFinish, 2150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish]);

  return (
    <div
      role="status"
      aria-label="Chargement de l'application"
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-clay/20 via-background to-sage/25 transition-opacity duration-[400ms] ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Icônes sport flottantes, en fond */}
      <FloatingIcon Icon={Dumbbell} className="left-[12%] top-[18%]" delay="0s" />
      <FloatingIcon Icon={Flame} className="right-[14%] top-[24%]" delay="0.4s" />
      <FloatingIcon Icon={Bike} className="left-[16%] bottom-[20%]" delay="0.8s" />
      <FloatingIcon Icon={Medal} className="right-[16%] bottom-[24%]" delay="0.2s" />
      <FloatingIcon Icon={Timer} className="left-[42%] top-[10%]" delay="0.6s" />

      {/* Piste + badge central */}
      <div className="relative size-40">
        {/* Lanes statiques (piste de stade) */}
        <svg viewBox="0 0 100 100" className="absolute inset-0">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" strokeWidth="2" />
          <circle
            cx="50" cy="50" r="38" fill="none"
            stroke="var(--border)" strokeWidth="2" strokeDasharray="2 5"
          />
        </svg>
        {/* L'athlète qui court : arc qui tourne autour de la piste */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 origin-center -rotate-90 animate-splash-spin"
        >
          <circle
            cx="50" cy="50" r="46" fill="none"
            stroke="var(--clay)" strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray="64 225"
          />
        </svg>
        {/* Badge fréquence cardiaque */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-clay/15 animate-splash-pulse">
            <Activity className="size-9 text-clay animate-splash-bounce" strokeWidth={2.2} />
          </div>
        </div>
      </div>

      {/* Wordmark + accroche */}
      <h1 className="mt-9 text-2xl font-bold uppercase tracking-[0.35em] text-foreground/90 pl-[0.35em]">
        Sereine
      </h1>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-clay">
        Échauffement en cours…
      </p>

      {/* Barre de progression */}
      <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-border/70">
        <div className="h-full w-full origin-left rounded-full bg-clay animate-splash-bar" />
      </div>
    </div>
  );
}

function FloatingIcon({
  Icon,
  className,
  delay,
}: {
  Icon: typeof Activity;
  className: string;
  delay: string;
}) {
  return (
    <span
      className={`pointer-events-none absolute text-clay/25 animate-splash-bounce ${className}`}
      style={{ animationDelay: delay }}
    >
      <Icon className="size-8" strokeWidth={1.75} />
    </span>
  );
}
