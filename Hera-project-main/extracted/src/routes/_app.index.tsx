import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import {
  generateSuggestion,
  generateTasks,
  loadProfile,
  type GeneratedTask,
  type Profile,
} from "@/lib/profile";
import { Celebration } from "@/components/celebration";

export const Route = createFileRoute("/_app/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Aujourd'hui — Sereine" },
      { name: "description", content: "Votre tableau de bord bien-être quotidien." },
    ],
  }),
  component: TodayPage,
});

type TaskState = GeneratedTask & { done?: boolean };

function TodayPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<TaskState[]>([]);
  const [ready, setReady] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletion = useRef(0);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    setProfile(p);
    setTasks(generateTasks(p));
    setReady(true);
  }, [navigate]);

  const completion = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  // Fire the celebration when the user reaches 100% (transition only).
  useEffect(() => {
    if (completion === 100 && prevCompletion.current < 100 && tasks.length > 0) {
      setShowCelebration(true);
    }
    prevCompletion.current = completion;
  }, [completion, tasks.length]);

  const today = new Date();
  const dateLong = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const weekDays = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 2);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready || !profile) return null;

  const suggestion = generateSuggestion(profile);

  return (
    <div className="px-6 pt-12 overflow-x-clip">
      {showCelebration && <Celebration onClose={() => setShowCelebration(false)} />}

      <header className="mb-6">
        <h1 className="font-serif-italic text-3xl mb-1">
          Bonjour, {profile.prenom}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">{dateLong}</p>
      </header>

      <div className="flex gap-2 mb-8">
        {weekDays.map((d) => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div
              key={d.toISOString()}
              className={`flex-1 min-w-0 flex flex-col items-center gap-2 px-1 py-3 rounded-2xl border ${
                isToday
                  ? "bg-clay text-white border-transparent"
                  : "bg-card border-border text-foreground"
              }`}
            >
              <span
                className={`text-[10px] font-medium uppercase tracking-wider ${
                  isToday ? "" : "text-muted-foreground"
                }`}
              >
                {d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3)}
              </span>
              <span className="text-sm font-semibold">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div className="mb-8 animate-slide-up">
        <div className="relative aspect-square w-44 mx-auto">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--card)" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="44" fill="none" stroke="var(--clay)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(completion / 100) * 276.5} 276.5`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-semibold tracking-tight">{completion}%</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              Objectif du jour
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Vos objectifs</h2>
          <span className="text-xs text-muted-foreground font-mono">
            {tasks.filter((t) => t.done).length}/{tasks.length}
          </span>
        </div>
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun objectif. <Link to="/profil" className="text-clay underline">Choisir →</Link>
          </p>
        )}
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() =>
              setTasks((prev) =>
                prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
              )
            }
            className={`w-full text-left p-4 rounded-3xl border flex items-center gap-4 transition-colors ${
              t.done
                ? "bg-sage/30 border-sage/50"
                : "bg-card border-border hover:border-clay/40"
            }`}
          >
            <span
              className={`size-6 rounded-full flex items-center justify-center shrink-0 ${
                t.done ? "bg-clay" : "border-2 border-clay"
              }`}
            >
              {t.done && <Check className="size-3.5 text-white" strokeWidth={3} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${t.done ? "line-through opacity-50" : ""}`}>
                {t.label}
              </p>
              <p className="text-xs text-muted-foreground">{t.meta}</p>
            </div>
            {t.time && (
              <span className="text-xs font-mono text-clay shrink-0">{t.time}</span>
            )}
          </button>
        ))}
      </section>

      <div className="p-5 bg-sky-pastel/50 rounded-3xl border border-sky-pastel mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-3.5 text-clay" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
            Conseil personnalisé
          </span>
        </div>
        <p className="font-serif-italic text-base leading-snug text-foreground/85">
          « {suggestion} »
        </p>
      </div>

      <Link
        to="/sante"
        className="block text-center py-4 text-sm font-medium text-clay underline-offset-4 hover:underline"
      >
        Explorer votre santé →
      </Link>
    </div>
  );
}
