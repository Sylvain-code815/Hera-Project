import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { MODULES } from "@/lib/sante-modules";

export const Route = createFileRoute("/_app/sante/")({
  head: () => ({
    meta: [
      { title: "Santé — Sereine" },
      { name: "description", content: "Tous vos modules santé en un coup d'œil." },
    ],
  }),
  component: SantePage,
});

function SantePage() {
  return (
    <div className="px-6 pt-12">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
          Votre tableau
        </p>
        <h1 className="font-serif-italic text-3xl">Santé</h1>
      </header>

      <div className="space-y-3">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.id}
              to="/sante/$module"
              params={{ module: m.id }}
              className={`block rounded-[28px] border ${m.bg} p-5 flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-sm`}
            >
              <div className="size-11 bg-card/70 rounded-2xl flex items-center justify-center shrink-0">
                <Icon className="size-5 text-foreground/70" strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-0.5">
                  {m.category}
                </p>
                <h3 className="text-base font-medium">{m.title}</h3>
                <p className="text-xs text-foreground/60 mt-0.5">{m.summary}</p>
              </div>
              <ChevronRight className="size-4 text-foreground/40" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
