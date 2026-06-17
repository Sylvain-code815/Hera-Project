import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { getModule, type ModuleId, type ModuleTone } from "@/lib/sante-modules";
import { JournalChat } from "@/components/journal-chat";

export const Route = createFileRoute("/_app/sante/$module")({
  head: ({ params }) => {
    const m = getModule(params.module);
    return {
      meta: [
        { title: `${m?.title ?? "Module"} — Sereine` },
        { name: "description", content: m?.tagline ?? "Détail du module santé." },
      ],
    };
  },
  component: ModuleDetailPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Module introuvable.</div>
  ),
});

function ModuleDetailPage() {
  const { module: id } = Route.useParams();
  const m = getModule(id);
  if (!m) throw notFound();
  const Icon = m.icon;

  return (
    <div className="pb-12">
      <div className={`${m.bg} border-b px-6 pt-12 pb-8`}>
        <Link
          to="/sante"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground bg-card/90 rounded-full pl-2.5 pr-4 py-2 mb-6 shadow-sm hover:bg-card transition-colors"
        >
          <ChevronLeft className="size-5" strokeWidth={2.2} />
          Retour
        </Link>
        <div className="flex items-start gap-4">
          <div className="size-14 bg-card/80 rounded-2xl flex items-center justify-center shrink-0">
            <Icon className="size-6 text-foreground/70" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
              {m.category}
            </p>
            <h1 className="font-semibold text-3xl leading-tight">{m.title}</h1>
            <p className="text-sm text-foreground/60 mt-2">{m.tagline}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-4">
        <Detail id={m.id} tone={m.tone} />
        <Conseil id={m.id} tone={m.tone} />
      </div>
    </div>
  );
}

function Detail({ id, tone }: { id: ModuleId; tone: ModuleTone }) {
  const card = "bg-card rounded-2xl p-5 border border-border";
  switch (id) {
    case "physique":
      return (
        <div className="space-y-4">
          <div className={card}>
            <div className="flex justify-between items-baseline mb-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight">5 230</p>
                <p className="text-xs text-muted-foreground">pas aujourd'hui · objectif 8 000</p>
              </div>
              <span className={`text-xs font-mono ${tone.text}`}>+12% / hier</span>
            </div>
            <BarChart values={[40, 60, 55, 85, 45, 70, 65]} accentIndex={3} tone={tone} />
            <div className="mt-4 flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
              <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Cette semaine</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Distance" value="18.2" sub="km" />
              <Stat label="Calories" value="2 140" sub="kcal" />
              <Stat label="Actif" value="4h 12" sub="min" />
            </div>
          </div>
        </div>
      );
    case "sommeil":
      return (
        <div className="space-y-4">
          <div className={card}>
            <div className="flex justify-between items-baseline mb-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight">7h 24m</p>
                <p className="text-xs text-muted-foreground">moyenne 7 derniers jours</p>
              </div>
              <span className={`text-xs font-mono ${tone.text}`}>Qualité 84%</span>
            </div>
            <BarChart values={[65, 55, 80, 70, 60, 85, 75]} accentIndex={5} tone={tone} />
            <p className="mt-4 text-xs text-muted-foreground font-serif-italic">
              « Vos heures de coucher sont régulières. Continuez. »
            </p>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Phases</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Profond" value="1h 45" sub="24%" />
              <Stat label="Léger" value="4h 12" sub="56%" />
              <Stat label="Paradoxal" value="1h 27" sub="20%" />
            </div>
          </div>
        </div>
      );
    case "nutrition":
      return (
        <div className="space-y-4">
          <div className={card}>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Stat label="Eau" value="1.2L" sub="/ 2L" />
              <Stat label="Calories" value="1 240" sub="/ 1 800" />
              <Stat label="Fibres" value="18g" sub="stable" />
            </div>
            <button className={`w-full py-3 ${tone.solid} text-white rounded-2xl text-sm font-medium`}>
              + Ajouter un repas
            </button>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Aujourd'hui</p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>Petit-déjeuner</span><span className="text-muted-foreground font-mono text-xs">420 kcal</span></li>
              <li className="flex justify-between"><span>Déjeuner</span><span className="text-muted-foreground font-mono text-xs">620 kcal</span></li>
              <li className="flex justify-between text-muted-foreground"><span>Dîner</span><span className="font-mono text-xs">à venir</span></li>
            </ul>
          </div>
        </div>
      );
    case "mentale": {
      const moods = ["☁︎", "⌃", "✦", "☼", "♡"];
      return (
        <div className="space-y-4">
          <div className={card}>
            <p className="text-xs text-muted-foreground mb-3">Comment vous sentez-vous ?</p>
            <div className="flex justify-between gap-2">
              {moods.map((m, i) => (
                <button
                  key={i}
                  className={`flex-1 aspect-square rounded-2xl text-xl flex items-center justify-center border ${
                    i === 2 ? `${tone.solid} text-white border-transparent` : "bg-background border-border"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className={card}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Séances</p>
            <div className="space-y-2">
              <button className="w-full py-3 bg-lavender/60 rounded-2xl text-sm font-medium">Respiration guidée · 5 min</button>
              <button className="w-full py-3 bg-sky-pastel/60 rounded-2xl text-sm font-medium">Méditation du soir · 10 min</button>
              <button className="w-full py-3 bg-mint/60 rounded-2xl text-sm font-medium">Scan corporel · 8 min</button>
            </div>
          </div>
        </div>
      );
    }
    case "journal":
      return (
        <div className="space-y-4">
          <p className="font-serif-italic text-base text-foreground/80 px-1">
            Prends un instant pour déposer tes pensées. Sereine est là pour t'écouter.
          </p>
          <JournalChat tone={tone} />
          <div className={card}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Cette semaine</p>
            <ul className="space-y-3 text-sm">
              <li><p className="text-xs text-muted-foreground font-mono">Lun</p><p className="font-serif-italic">« Belle balade au parc. »</p></li>
              <li><p className="text-xs text-muted-foreground font-mono">Mer</p><p className="font-serif-italic">« Journée intense mais riche. »</p></li>
              <li><p className="text-xs text-muted-foreground font-mono">Ven</p><p className="font-serif-italic">« Soirée en famille, douce. »</p></li>
            </ul>
          </div>
        </div>
      );
    case "habitudes": {
      const habits = [
        { name: "Lire 20 minutes", streak: 12 },
        { name: "Méditer", streak: 7 },
        { name: "Boire de l'eau", streak: 23 },
        { name: "Faire du sport", streak: 4 },
      ];
      return (
        <div className="space-y-2">
          {habits.map((h) => (
            <div key={h.name} className="flex justify-between items-center p-4 bg-card rounded-2xl border border-border">
              <span className="text-sm font-medium">{h.name}</span>
              <span className={`text-xs font-mono ${tone.text}`}>🔥 {h.streak}j</span>
            </div>
          ))}
          <button className={`w-full mt-3 py-3 ${tone.solid} text-white rounded-2xl text-sm font-medium`}>
            + Nouvelle habitude
          </button>
        </div>
      );
    }
  }
}

/**
 * Conseil contextuel affiché en bas de la page détaillée. Le message est
 * dérivé des résultats du module (progression vs objectif, qualité, séries…)
 * de sorte que le conseil reflète réellement les chiffres présentés au-dessus.
 */
function getAdvice(id: ModuleId): { title: string; text: string } {
  switch (id) {
    case "physique": {
      const steps = 5230;
      const goal = 8000;
      const remaining = goal - steps;
      return {
        title: "Encore un petit effort",
        text: `Vous êtes à ${Math.round((steps / goal) * 100)} % de votre objectif. Une marche d'environ ${Math.round(
          remaining / 110,
        )} minutes suffirait à atteindre les ${goal.toLocaleString("fr-FR")} pas aujourd'hui.`,
      };
    }
    case "sommeil":
      return {
        title: "Un sommeil de qualité",
        text: "Avec 7h24 de moyenne et une qualité de 84 %, vos nuits sont solides. Gardez des horaires de coucher réguliers pour préserver votre sommeil profond.",
      };
    case "nutrition":
      return {
        title: "Pensez à vous hydrater",
        text: "Il vous reste 0,8 L d'eau et environ 560 kcal avant vos objectifs du jour. Un grand verre d'eau maintenant vous remettra sur la bonne voie.",
      };
    case "mentale":
      return {
        title: "Une parenthèse pour vous",
        text: "Votre humeur est stable et votre stress faible. Une respiration guidée de 5 minutes aiderait à entretenir cet équilibre avant la fin de journée.",
      };
    case "journal":
      return {
        title: "Continuez sur votre lancée",
        text: "3 entrées cette semaine, c'est un beau rythme. Écrire ne serait-ce que deux lignes chaque soir ancre durablement l'habitude.",
      };
    case "habitudes":
      return {
        title: "Vos séries portent leurs fruits",
        text: "« Boire de l'eau » tient depuis 23 jours, bravo ! « Faire du sport » n'est qu'à 4 jours : une séance aujourd'hui la consoliderait.",
      };
  }
}

function Conseil({ id, tone }: { id: ModuleId; tone: ModuleTone }) {
  const advice = getAdvice(id);
  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-start gap-3">
        <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${tone.soft}`}>
          <Lightbulb className={`size-5 ${tone.text}`} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">
            Conseil
          </p>
          <p className="text-sm font-semibold mb-1">{advice.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{advice.text}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground font-mono">{sub}</p>
    </div>
  );
}

function BarChart({
  values,
  accentIndex,
  tone,
}: {
  values: number[];
  accentIndex?: number;
  tone: ModuleTone;
}) {
  return (
    <div className="h-28 flex items-end gap-2">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-all ${i === accentIndex ? tone.solid : tone.soft}`}
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}
