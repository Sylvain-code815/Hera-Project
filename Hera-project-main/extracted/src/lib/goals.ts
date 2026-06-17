import type { GoalId } from "@/lib/profile";

// Shared goal catalogue — used by onboarding and the profile "Objectifs" editor.
export const GOAL_GROUPS: Array<{
  category: string;
  color: string;
  goals: Array<{ id: GoalId; label: string }>;
}> = [
  {
    category: "Santé physique",
    color: "bg-sage/40 border-sage",
    goals: [
      { id: "weight_loss", label: "Perdre du poids" },
      { id: "muscle_gain", label: "Prendre de la masse" },
      { id: "more_active", label: "Être plus actif·ve" },
      { id: "fitness", label: "Améliorer ma condition" },
    ],
  },
  {
    category: "Nutrition",
    color: "bg-rose/40 border-rose",
    goals: [
      { id: "eat_better", label: "Mieux manger" },
      { id: "balance", label: "Rééquilibrage alimentaire" },
      { id: "hydration", label: "Boire plus d'eau" },
      { id: "less_sugar", label: "Réduire le sucre" },
    ],
  },
  {
    category: "Sommeil",
    color: "bg-sky-pastel/50 border-sky-pastel",
    goals: [
      { id: "sleep_easier", label: "M'endormir plus facilement" },
      { id: "fewer_wakeups", label: "Moins de réveils nocturnes" },
      { id: "more_sleep", label: "Augmenter mon sommeil" },
    ],
  },
  {
    category: "Santé mentale",
    color: "bg-lavender/40 border-lavender",
    goals: [
      { id: "less_stress", label: "Réduire le stress" },
      { id: "less_anxiety", label: "Réduire l'anxiété" },
      { id: "better_mood", label: "Améliorer mon humeur" },
      { id: "emotions", label: "Gérer mes émotions" },
    ],
  },
  {
    category: "Développement personnel",
    color: "bg-mint/40 border-mint",
    goals: [
      { id: "organize", label: "Mieux m'organiser" },
      { id: "habits", label: "De bonnes habitudes" },
      { id: "focus", label: "Améliorer ma concentration" },
      { id: "confidence", label: "Gagner en confiance" },
    ],
  },
];

// Flat lookup: GoalId -> human label
export const GOAL_LABELS: Record<string, string> = Object.fromEntries(
  GOAL_GROUPS.flatMap((g) => g.goals.map((x) => [x.id, x.label])),
);
