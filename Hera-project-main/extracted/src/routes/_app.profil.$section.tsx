import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Check, Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  loadProfile,
  saveProfile,
  clearProfile,
  type GoalId,
  type Profile,
  type Sexe,
} from "@/lib/profile";
import {
  loadPreferences,
  savePreferences,
  clearPreferences,
  applyTheme,
  type Preferences,
  type ThemeMode,
} from "@/lib/preferences";
import { GOAL_GROUPS } from "@/lib/goals";
import { getSection, type SectionId } from "@/lib/profile-sections";

export const Route = createFileRoute("/_app/profil/$section")({
  ssr: false,
  head: ({ params }) => {
    const s = getSection(params.section);
    return {
      meta: [
        { title: `${s?.label ?? "Catégorie"} — Sereine` },
        { name: "description", content: s?.tagline ?? "Modifier votre profil." },
      ],
    };
  },
  component: SectionDetailPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Catégorie introuvable.</div>
  ),
});

function SectionDetailPage() {
  const { section: id } = Route.useParams();
  const s = getSection(id);
  if (!s) throw notFound();
  const Icon = s.icon;

  return (
    <div className="pb-12">
      <div className={`${s.bg} border-b px-6 pt-12 pb-8`}>
        <Link
          to="/profil"
          className="inline-flex items-center gap-1 text-xs text-foreground/60 mb-6 hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Profil
        </Link>
        <div className="flex items-start gap-4">
          <div className="size-14 bg-card/80 rounded-2xl flex items-center justify-center shrink-0">
            <Icon className="size-6 text-foreground/70" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
              {s.editable ? "Modifier" : "Détail"}
            </p>
            <h1 className="font-serif-italic text-3xl leading-tight">{s.label}</h1>
            <p className="text-sm text-foreground/60 mt-2">{s.tagline}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        <Editor id={s.id} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

const card = "bg-card rounded-2xl p-5 border border-border";
const inputCls =
  "w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-base focus:outline-hidden focus:ring-2 focus:ring-clay/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function SaveBar({
  saved,
  error,
  onSave,
}: {
  saved: boolean;
  error?: string | null;
  onSave: () => void;
}) {
  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-rose-600 px-1">{error}</p>}
      <button
        onClick={onSave}
        className="w-full py-4 bg-clay text-white rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
      >
        {saved ? (
          <>
            <Check className="size-4" /> Enregistré
          </>
        ) : (
          "Enregistrer"
        )}
      </button>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span>}
      </span>
      <span
        className={`relative shrink-0 h-6 w-10 rounded-full transition-colors ${
          checked ? "bg-clay" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Editor router                                                      */
/* ------------------------------------------------------------------ */

function Editor({ id }: { id: SectionId }) {
  switch (id) {
    case "infos":
      return <InfosEditor />;
    case "objectifs":
      return <ObjectifsEditor />;
    case "statistiques":
      return <StatistiquesView />;
    case "themes":
      return <ThemesEditor />;
    case "notifications":
      return <NotificationsEditor />;
    case "confidentialite":
      return <ConfidentialiteEditor />;
  }
}

/* ------------------------------------------------------------------ */
/* Informations personnelles                                          */
/* ------------------------------------------------------------------ */

function InfosEditor() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState<Sexe>("skip");
  const [taille, setTaille] = useState("");
  const [poids, setPoids] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) return;
    setPrenom(p.prenom ?? "");
    setNom(p.nom ?? "");
    setAge(p.age != null ? String(p.age) : "");
    setSexe(p.sexe ?? "skip");
    setTaille(p.taille != null ? String(p.taille) : "");
    setPoids(p.poids != null ? String(p.poids) : "");
  }, []);

  const dirty = () => {
    setSaved(false);
    setError(null);
  };

  const save = () => {
    const existing = loadProfile();
    const next: Profile = {
      prenom: prenom.trim() || existing?.prenom || "Vous",
      nom: nom.trim() || undefined,
      age: age ? Number(age) : undefined,
      sexe,
      taille: taille ? Number(taille) : undefined,
      poids: poids ? Number(poids) : undefined,
      goals: existing?.goals ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const res = saveProfile(next);
    if (!res.ok) {
      setError(res.errors[0] ?? "Données invalides.");
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className={`${card} space-y-5`}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom">
            <input
              value={prenom}
              onChange={(e) => {
                setPrenom(e.target.value);
                dirty();
              }}
              placeholder="Amélie"
              className={inputCls}
            />
          </Field>
          <Field label="Nom (optionnel)">
            <input
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
                dirty();
              }}
              placeholder="Dupont"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Âge">
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              dirty();
            }}
            placeholder="32"
            className={inputCls}
          />
        </Field>

        <Field label="Sexe (optionnel)">
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { id: "f", label: "Femme" },
                { id: "m", label: "Homme" },
                { id: "x", label: "Autre" },
                { id: "skip", label: "Passer" },
              ] as const
            ).map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSexe(o.id);
                  dirty();
                }}
                className={`py-3 rounded-2xl text-xs font-medium border transition-colors ${
                  sexe === o.id
                    ? "bg-clay text-white border-transparent"
                    : "bg-background border-border text-foreground hover:border-clay/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Taille (cm)">
            <input
              type="number"
              inputMode="numeric"
              value={taille}
              onChange={(e) => {
                setTaille(e.target.value);
                dirty();
              }}
              placeholder="168"
              className={inputCls}
            />
          </Field>
          <Field label="Poids (kg)">
            <input
              type="number"
              inputMode="numeric"
              value={poids}
              onChange={(e) => {
                setPoids(e.target.value);
                dirty();
              }}
              placeholder="62"
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      <SaveBar saved={saved} error={error} onSave={save} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Objectifs                                                          */
/* ------------------------------------------------------------------ */

function ObjectifsEditor() {
  const [goals, setGoals] = useState<GoalId[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGoals(loadProfile()?.goals ?? []);
  }, []);

  const toggle = (g: GoalId) => {
    setSaved(false);
    setError(null);
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));
  };

  const save = () => {
    const existing = loadProfile();
    const next: Profile = {
      prenom: existing?.prenom ?? "Vous",
      nom: existing?.nom,
      age: existing?.age,
      sexe: existing?.sexe,
      taille: existing?.taille,
      poids: existing?.poids,
      goals,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const res = saveProfile(next);
    if (!res.ok) {
      setError(res.errors[0] ?? "Données invalides.");
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Sélectionnez les objectifs qui vous parlent. Vos tâches quotidiennes s'adapteront en
        conséquence.
      </p>

      <div className="space-y-5">
        {GOAL_GROUPS.map((group) => (
          <div key={group.category}>
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2.5">
              {group.category}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {group.goals.map((g) => {
                const active = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggle(g.id)}
                    className={`relative text-left p-3.5 rounded-2xl border text-xs font-medium leading-snug transition-all ${
                      active
                        ? `${group.color} ring-1 ring-clay/40`
                        : "bg-card border-border hover:border-clay/30"
                    }`}
                  >
                    {active && (
                      <span className="absolute top-2 right-2 size-4 rounded-full bg-clay flex items-center justify-center">
                        <Check className="size-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {goals.length} objectif{goals.length > 1 ? "s" : ""} sélectionné
        {goals.length > 1 ? "s" : ""}
      </p>

      <SaveBar saved={saved} error={error} onSave={save} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Statistiques (lecture seule)                                       */
/* ------------------------------------------------------------------ */

function StatistiquesView() {
  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex justify-between items-baseline mb-4">
          <div>
            <p className="text-3xl font-semibold tracking-tight">14 jours</p>
            <p className="text-xs text-muted-foreground">série en cours</p>
          </div>
          <span className="text-xs font-mono text-clay">+3 cette semaine</span>
        </div>
        <BarChart values={[50, 65, 40, 80, 70, 90, 60]} accentIndex={5} />
        <div className="mt-4 flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
          <span>L</span>
          <span>M</span>
          <span>M</span>
          <span>J</span>
          <span>V</span>
          <span>S</span>
          <span>D</span>
        </div>
      </div>
      <div className={card}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
          Vue d'ensemble
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Tâches" value="128" sub="terminées" />
          <Stat label="Régularité" value="86%" sub="ce mois" />
          <Stat label="Humeur" value="☼" sub="positive" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thèmes & couleurs                                                  */
/* ------------------------------------------------------------------ */

function ThemesEditor() {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);

  useEffect(() => setPrefs(loadPreferences()), []);

  const setTheme = (theme: ThemeMode) => {
    const next = { ...prefs, theme };
    setPrefs(next);
    savePreferences(next);
    applyTheme(theme);
  };

  const options: Array<{ id: ThemeMode; label: string; hint: string }> = [
    { id: "system", label: "Automatique", hint: "Suit votre appareil" },
    { id: "light", label: "Clair", hint: "Fond chaud lumineux" },
    { id: "dark", label: "Sombre", hint: "Repose les yeux" },
  ];

  return (
    <div className="space-y-4">
      <div className={`${card} space-y-2`}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
          Apparence
        </p>
        {options.map((o) => {
          const active = prefs.theme === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setTheme(o.id)}
              className={`w-full flex items-center justify-between gap-4 p-4 rounded-2xl border text-left transition-colors ${
                active
                  ? "bg-clay/10 border-clay/50"
                  : "bg-background border-border hover:border-clay/30"
              }`}
            >
              <span>
                <span className="block text-sm font-medium">{o.label}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{o.hint}</span>
              </span>
              {active && (
                <span className="size-5 rounded-full bg-clay flex items-center justify-center shrink-0">
                  <Check className="size-3 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground px-1">
        Le thème est appliqué immédiatement et conservé sur cet appareil.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications                                                      */
/* ------------------------------------------------------------------ */

function NotificationsEditor() {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);

  useEffect(() => setPrefs(loadPreferences()), []);

  const set = (key: keyof Preferences["notifications"], v: boolean) => {
    const next = { ...prefs, notifications: { ...prefs.notifications, [key]: v } };
    setPrefs(next);
    savePreferences(next);
  };

  const items: Array<{ key: keyof Preferences["notifications"]; label: string; hint: string }> = [
    { key: "dailyReminder", label: "Rappel quotidien", hint: "Un rappel doux chaque matin" },
    {
      key: "goalProgress",
      label: "Progression des objectifs",
      hint: "Quand vous franchissez un cap",
    },
    { key: "weeklyReport", label: "Bilan hebdomadaire", hint: "Votre résumé du dimanche" },
    { key: "tips", label: "Conseils & inspirations", hint: "Astuces bien-être personnalisées" },
  ];

  return (
    <div className="space-y-4">
      <div className={`${card} divide-y divide-border`}>
        {items.map((it) => (
          <Toggle
            key={it.key}
            label={it.label}
            hint={it.hint}
            checked={prefs.notifications[it.key]}
            onChange={(v) => set(it.key, v)}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground px-1">
        Vos préférences sont enregistrées automatiquement.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confidentialité                                                    */
/* ------------------------------------------------------------------ */

function ConfidentialiteEditor() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setPrefs(loadPreferences()), []);

  const set = (key: keyof Preferences["privacy"], v: boolean) => {
    const next = { ...prefs, privacy: { ...prefs.privacy, [key]: v } };
    setPrefs(next);
    savePreferences(next);
  };

  const exportData = () => {
    const data = {
      profile: loadProfile(),
      preferences: loadPreferences(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sereine-mes-donnees.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const wipe = () => {
    clearProfile();
    clearPreferences();
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="space-y-4">
      <div className={`${card} divide-y divide-border`}>
        <Toggle
          label="Mesures d'audience"
          hint="Statistiques anonymes d'utilisation"
          checked={prefs.privacy.analytics}
          onChange={(v) => set("analytics", v)}
        />
        <Toggle
          label="Personnalisation"
          hint="Adapter les contenus à vos objectifs"
          checked={prefs.privacy.personalization}
          onChange={(v) => set("personalization", v)}
        />
      </div>

      <button
        onClick={exportData}
        className="w-full p-4 bg-card border border-border rounded-2xl flex items-center gap-3 text-sm font-medium hover:border-clay/40 transition-colors"
      >
        <Download className="size-4 text-muted-foreground" /> Exporter mes données
      </button>

      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-full p-4 bg-card border border-dashed border-border rounded-2xl flex items-center gap-3 text-sm text-muted-foreground hover:text-rose-600 hover:border-rose-300 transition-colors"
        >
          <Trash2 className="size-4" /> Effacer toutes mes données
        </button>
      ) : (
        <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50/60 space-y-3">
          <p className="text-sm font-medium text-rose-700">Cette action est irréversible.</p>
          <p className="text-xs text-rose-700/80">
            Votre profil et vos préférences seront supprimés de cet appareil.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 py-3 rounded-2xl border border-border bg-card text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={wipe}
              className="flex-1 py-3 rounded-2xl bg-rose-600 text-white text-sm font-semibold"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small display helpers (shared with santé module style)            */
/* ------------------------------------------------------------------ */

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground font-mono">{sub}</p>
    </div>
  );
}

function BarChart({ values, accentIndex }: { values: number[]; accentIndex?: number }) {
  return (
    <div className="h-28 flex items-end gap-2">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-all ${i === accentIndex ? "bg-clay" : "bg-clay/25"}`}
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}
