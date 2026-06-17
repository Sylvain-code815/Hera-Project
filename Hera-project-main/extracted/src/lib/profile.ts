// Profile model + task generator. Stored in localStorage for now.
// Will move to Lovable Cloud when auth/persistence is added.

import { z } from "zod";

export const SEXES = ["f", "m", "x", "skip"] as const;
export type Sexe = (typeof SEXES)[number];

export const GOAL_IDS = [
  // Physique
  "weight_loss",
  "muscle_gain",
  "more_active",
  "fitness",
  // Nutrition
  "eat_better",
  "balance",
  "hydration",
  "less_sugar",
  // Sommeil
  "sleep_easier",
  "fewer_wakeups",
  "more_sleep",
  // Mental
  "less_stress",
  "less_anxiety",
  "better_mood",
  "emotions",
  // Dev perso
  "organize",
  "habits",
  "focus",
  "confidence",
] as const;
export type GoalId = (typeof GOAL_IDS)[number];

// Single source of truth for what a valid profile is. Bounds are deliberately
// generous but reject nonsense (negative weight, 900-year-old user, etc.) and
// guard against tampered/corrupt localStorage on read.
export const profileSchema = z.object({
  prenom: z.string().trim().min(2).max(60),
  nom: z.string().trim().max(60).optional(),
  age: z.number().int().min(13).max(120).optional(),
  sexe: z.enum(SEXES).optional(),
  taille: z.number().min(50).max(260).optional(),
  poids: z.number().min(20).max(400).optional(),
  goals: z.array(z.enum(GOAL_IDS)),
  createdAt: z.string().datetime(),
});

export type Profile = z.infer<typeof profileSchema>;

const KEY = "sereine.profile.v1";

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = profileSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      // Corrupt or tampered payload — drop it rather than trusting it.
      window.localStorage.removeItem(KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Validates before persisting. Returns the normalized profile on success, or a
 * list of issues on failure so the caller can surface them instead of writing
 * malformed data.
 */
export function saveProfile(
  p: Profile,
): { ok: true; profile: Profile } | { ok: false; errors: string[] } {
  const parsed = profileSchema.safeParse(p);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }
  window.localStorage.setItem(KEY, JSON.stringify(parsed.data));
  return { ok: true, profile: parsed.data };
}

export function clearProfile() {
  window.localStorage.removeItem(KEY);
}

export type GeneratedTask = {
  id: string;
  label: string;
  meta: string;
  time?: string;
  goal: GoalId;
};

// Map each goal to a concrete daily task
const TASK_TEMPLATES: Record<GoalId, Omit<GeneratedTask, "goal">> = {
  weight_loss: {
    id: "g_weight",
    label: "30 min d'activité modérée",
    meta: "Brûler ~250 kcal",
    time: "18:00",
  },
  muscle_gain: {
    id: "g_muscle",
    label: "Séance de renforcement",
    meta: "20 min · corps entier",
    time: "18:30",
  },
  more_active: { id: "g_active", label: "8 000 pas", meta: "Marche active", time: "—" },
  fitness: { id: "g_fitness", label: "Cardio léger", meta: "15 min", time: "07:30" },
  eat_better: { id: "g_eat", label: "Composer 3 repas équilibrés", meta: "Légumes à chaque repas" },
  balance: { id: "g_balance", label: "Préparer un repas maison", meta: "Rééquilibrage" },
  hydration: { id: "g_water", label: "Boire 2L d'eau", meta: "8 verres", time: "—" },
  less_sugar: { id: "g_sugar", label: "Éviter le sucre ajouté", meta: "Lire les étiquettes" },
  sleep_easier: {
    id: "g_sleep1",
    label: "Routine du soir 30 min",
    meta: "Sans écran",
    time: "22:00",
  },
  fewer_wakeups: {
    id: "g_sleep2",
    label: "Tisane apaisante",
    meta: "Camomille / verveine",
    time: "21:30",
  },
  more_sleep: { id: "g_sleep3", label: "Se coucher avant 23h", meta: "Objectif 8h", time: "22:45" },
  less_stress: {
    id: "g_stress",
    label: "Respiration cohérente",
    meta: "5 min · 6 cycles/min",
    time: "12:30",
  },
  less_anxiety: {
    id: "g_anx",
    label: "Méditation guidée",
    meta: "10 min · ancrage",
    time: "08:00",
  },
  better_mood: { id: "g_mood", label: "Noter votre humeur", meta: "30 secondes" },
  emotions: { id: "g_emo", label: "Scan émotionnel", meta: "3 min" },
  organize: { id: "g_org", label: "Planifier la journée", meta: "3 priorités", time: "08:30" },
  habits: { id: "g_habit", label: "Cocher vos habitudes", meta: "Maintenir vos séries" },
  focus: { id: "g_focus", label: "Session de focus", meta: "25 min · sans interruption" },
  confidence: {
    id: "g_conf",
    label: "Journal de victoires",
    meta: "1 victoire du jour",
    time: "21:00",
  },
};

export function generateTasks(profile: Profile): GeneratedTask[] {
  return profile.goals
    .map((g) => ({ ...TASK_TEMPLATES[g], goal: g }))
    .filter(Boolean)
    .slice(0, 7); // cap to keep the day focused
}

// Personalized AI-flavoured suggestion based on goals
export function generateSuggestion(profile: Profile): string {
  const g = profile.goals;
  if (g.includes("less_stress") || g.includes("less_anxiety"))
    return "Votre objectif sérénité demande de la régularité. Essayez 3 respirations profondes avant chaque repas.";
  if (g.includes("more_sleep") || g.includes("sleep_easier"))
    return "Pour préserver votre sommeil, baissez la luminosité de vos écrans 1h avant le coucher.";
  if (g.includes("weight_loss") || g.includes("more_active"))
    return "Une marche de 15 min après le déjeuner stabilisera votre glycémie et votre énergie.";
  if (g.includes("hydration"))
    return "Posez une bouteille à côté de vous : voir l'eau triple les chances d'en boire.";
  if (g.includes("focus") || g.includes("organize"))
    return "Commencez par la tâche la plus importante. Tout le reste devient plus léger.";
  return "Un petit pas aujourd'hui compte plus qu'un grand pas demain. Choisissez une seule action.";
}
