import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { saveProfile, type GoalId, type Profile, type Sexe } from "@/lib/profile";
import { GOAL_GROUPS } from "@/lib/goals";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bienvenue — Sereine" },
      { name: "description", content: "Personnalisez votre parcours en quelques étapes." },
    ],
  }),
  component: Onboarding,
});

// Étapes : 0 = accueil, 1 = infos, puis une page par catégorie d'objectifs,
// enfin la page de récapitulatif.
const GOAL_START = 2;
const REVIEW_STEP = GOAL_START + GOAL_GROUPS.length;
const TOTAL_STEPS = REVIEW_STEP + 1;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);
  const [prenom, setPrenom] = useState("");
  const [age, setAge] = useState<string>("");
  const [sexe, setSexe] = useState<Sexe>("skip");
  const [taille, setTaille] = useState<string>("");
  const [poids, setPoids] = useState<string>("");
  const [goals, setGoals] = useState<GoalId[]>([]);

  const toggle = (g: GoalId) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));

  const isGoalStep = step >= GOAL_START && step < REVIEW_STEP;

  const inRange = (v: string, min: number, max: number) => {
    const n = Number(v);
    return v.trim() !== "" && Number.isFinite(n) && n >= min && n <= max;
  };

  const bodyValid = inRange(age, 13, 120) && inRange(taille, 50, 260) && inRange(poids, 20, 400);

  const canNext =
    (step === 0 && prenom.trim().length >= 2) ||
    (step === 1 && bodyValid) ||
    isGoalStep || // pages d'objectifs : optionnelles
    step === REVIEW_STEP;

  const finish = () => {
    const profile: Profile = {
      prenom: prenom.trim(),
      age: age ? Number(age) : undefined,
      sexe,
      taille: taille ? Number(taille) : undefined,
      poids: poids ? Number(poids) : undefined,
      goals,
      createdAt: new Date().toISOString(),
    };
    const result = saveProfile(profile);
    if (!result.ok) {
      // Schéma refusé : on remonte l'erreur au lieu d'enregistrer des données malformées.
      console.error("Profil invalide:", result.errors);
      window.alert(`Impossible d'enregistrer le profil :\n${result.errors.join("\n")}`);
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto w-full max-w-[480px] flex-1 flex flex-col px-6 pt-12 pb-8">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? "bg-clay" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Back */}
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="self-start inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground"
          >
            <ChevronLeft className="size-4" /> Retour
          </button>
        )}

        <div className="flex-1">
          {step === 0 && <StepWelcome prenom={prenom} setPrenom={setPrenom} />}
          {step === 1 && (
            <StepBody
              age={age}
              setAge={setAge}
              sexe={sexe}
              setSexe={setSexe}
              taille={taille}
              setTaille={setTaille}
              poids={poids}
              setPoids={setPoids}
            />
          )}
          {isGoalStep && (
            <StepGoalCategory
              group={GOAL_GROUPS[step - GOAL_START]}
              index={step - GOAL_START}
              total={GOAL_GROUPS.length}
              goals={goals}
              toggle={toggle}
            />
          )}
          {step === REVIEW_STEP && <StepReview prenom={prenom} goalsCount={goals.length} />}
        </div>

        <button
          disabled={!canNext}
          onClick={() => (step === REVIEW_STEP ? finish() : setStep((s) => s + 1))}
          className="w-full py-4 mt-6 bg-clay text-white rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === REVIEW_STEP ? "Commencer mon parcours" : "Continuer"}
          {step < REVIEW_STEP && <ChevronRight className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function StepWelcome({ prenom, setPrenom }: { prenom: string; setPrenom: (s: string) => void }) {
  return (
    <div className="animate-slide-up">
      <p className="text-[10px] font-bold uppercase tracking-widest text-clay mb-3">Bienvenue</p>
      <h1 className="font-serif-italic text-4xl mb-4 leading-tight">
        Construisons votre parcours bien-être
      </h1>
      <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
        Quelques questions pour adapter Sereine à vous. Aucune réponse n'est figée — vous pourrez
        tout modifier plus tard.
      </p>
      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Votre prénom
        </span>
        <input
          autoFocus
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Amélie"
          className="mt-2 w-full bg-card border border-border rounded-2xl px-5 py-4 text-base focus:outline-hidden focus:ring-2 focus:ring-clay/40"
        />
      </label>
    </div>
  );
}

function StepBody({
  age,
  setAge,
  sexe,
  setSexe,
  taille,
  setTaille,
  poids,
  setPoids,
}: {
  age: string;
  setAge: (s: string) => void;
  sexe: Sexe;
  setSexe: (s: Sexe) => void;
  taille: string;
  setTaille: (s: string) => void;
  poids: string;
  setPoids: (s: string) => void;
}) {
  return (
    <div className="animate-slide-up space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-clay mb-3">
          Étape 2 · Vous
        </p>
        <h1 className="font-serif-italic text-3xl">Quelques infos essentielles</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Pour calibrer vos objectifs (calories, sommeil, hydratation).
        </p>
      </div>

      <Field label="Âge">
        <input
          type="number"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
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
              onClick={() => setSexe(o.id)}
              className={`py-3 rounded-2xl text-xs font-medium border transition-colors ${
                sexe === o.id
                  ? "bg-clay text-white border-transparent"
                  : "bg-card border-border text-foreground hover:border-clay/40"
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
            onChange={(e) => setTaille(e.target.value)}
            placeholder="168"
            className={inputCls}
          />
        </Field>
        <Field label="Poids (kg)">
          <input
            type="number"
            inputMode="numeric"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            placeholder="62"
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-card border border-border rounded-2xl px-4 py-3.5 text-base focus:outline-hidden focus:ring-2 focus:ring-clay/40";

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

function StepGoalCategory({
  group,
  index,
  total,
  goals,
  toggle,
}: {
  group: (typeof GOAL_GROUPS)[number];
  index: number;
  total: number;
  goals: GoalId[];
  toggle: (g: GoalId) => void;
}) {
  const selectedHere = group.goals.filter((g) => goals.includes(g.id)).length;
  return (
    <div className="animate-slide-up">
      <p className="text-[10px] font-bold uppercase tracking-widest text-clay mb-3">
        Étape 3 · Objectifs · {index + 1}/{total}
      </p>
      <h1 className="font-serif-italic text-3xl mb-2">{group.category}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Choisissez ce qui vous parle dans cette catégorie, ou passez directement à la suivante. Vous
        adapterez tout plus tard.
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

      <p className="text-xs text-muted-foreground mt-4">
        {selectedHere > 0
          ? `${selectedHere} objectif${selectedHere > 1 ? "s" : ""} sélectionné${selectedHere > 1 ? "s" : ""}`
          : "Aucune sélection — cette catégorie est optionnelle."}
      </p>
    </div>
  );
}

function StepReview({ prenom, goalsCount }: { prenom: string; goalsCount: number }) {
  return (
    <div className="animate-slide-up text-center py-8">
      <div className="size-20 mx-auto mb-6 rounded-full bg-clay/15 flex items-center justify-center">
        <Check className="size-9 text-clay" strokeWidth={2} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-clay mb-3">C'est prêt</p>
      <h1 className="font-serif-italic text-3xl mb-3">Enchanté, {prenom || "vous"}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
        Sereine a généré vos {goalsCount} premières tâches quotidiennes en fonction de vos
        objectifs. Vous pourrez les ajuster à tout moment.
      </p>
    </div>
  );
}
