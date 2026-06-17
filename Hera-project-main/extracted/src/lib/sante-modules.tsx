import { Activity, Apple, Moon, Brain, BookOpen, Repeat } from "lucide-react";

export type ModuleId = "physique" | "nutrition" | "sommeil" | "mentale" | "journal" | "habitudes";

/**
 * Per-module accent classes. The detail view derives every secondary accent
 * (text, solid fills, buttons, chart bars, focus ring) from `tone` so a blue
 * card stays blue throughout, a green card green, etc. Class strings are kept
 * literal here so Tailwind's source scanner picks them up.
 */
export type ModuleTone = {
  text: string; // colored text / icons
  solid: string; // solid fill on buttons & active states
  soft: string; // muted fill (e.g. inactive chart bars)
  ring: string; // focus ring
};

export const MODULES: Array<{
  id: ModuleId;
  category: string;
  title: string;
  bg: string;
  accent: string;
  tone: ModuleTone;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  summary: string;
  tagline: string;
}> = [
  {
    id: "physique",
    category: "Physique",
    title: "Activité",
    bg: "bg-m-physique/20 border-m-physique/40",
    accent: "bg-m-physique/40",
    tone: {
      text: "text-m-physique",
      solid: "bg-m-physique",
      soft: "bg-m-physique/25",
      ring: "focus:ring-m-physique/50",
    },
    icon: Activity,
    summary: "5 230 pas · 312 kcal",
    tagline: "Suivez votre énergie au quotidien.",
  },
  {
    id: "sommeil",
    category: "Repos",
    title: "Sommeil",
    bg: "bg-m-sommeil/20 border-m-sommeil/40",
    accent: "bg-m-sommeil/40",
    tone: {
      text: "text-m-sommeil",
      solid: "bg-m-sommeil",
      soft: "bg-m-sommeil/25",
      ring: "focus:ring-m-sommeil/50",
    },
    icon: Moon,
    summary: "7h 24m · Qualité 84%",
    tagline: "La qualité de vos nuits, en détail.",
  },
  {
    id: "nutrition",
    category: "Alimentation",
    title: "Nutrition",
    bg: "bg-m-nutrition/20 border-m-nutrition/40",
    accent: "bg-m-nutrition/40",
    tone: {
      text: "text-m-nutrition",
      solid: "bg-m-nutrition",
      soft: "bg-m-nutrition/25",
      ring: "focus:ring-m-nutrition/50",
    },
    icon: Apple,
    summary: "Équilibre stable · 1.2L",
    tagline: "Hydratation, repas, équilibre.",
  },
  {
    id: "mentale",
    category: "Bien-être",
    title: "Santé mentale",
    bg: "bg-m-mentale/20 border-m-mentale/40",
    accent: "bg-m-mentale/40",
    tone: {
      text: "text-m-mentale",
      solid: "bg-m-mentale",
      soft: "bg-m-mentale/25",
      ring: "focus:ring-m-mentale/50",
    },
    icon: Brain,
    summary: "Stress faible · Humeur ✦",
    tagline: "Une parenthèse pour vous écouter.",
  },
  {
    id: "journal",
    category: "Réflexion",
    title: "Journal",
    bg: "bg-m-journal/20 border-m-journal/40",
    accent: "bg-m-journal/40",
    tone: {
      text: "text-m-journal",
      solid: "bg-m-journal",
      soft: "bg-m-journal/25",
      ring: "focus:ring-m-journal/50",
    },
    icon: BookOpen,
    summary: "3 entrées cette semaine",
    tagline: "Couchez vos pensées sur le papier.",
  },
  {
    id: "habitudes",
    category: "Routine",
    title: "Habitudes",
    bg: "bg-m-habitudes/20 border-m-habitudes/40",
    accent: "bg-m-habitudes/40",
    tone: {
      text: "text-m-habitudes",
      solid: "bg-m-habitudes",
      soft: "bg-m-habitudes/25",
      ring: "focus:ring-m-habitudes/50",
    },
    icon: Repeat,
    summary: "4 séries actives",
    tagline: "Cultivez vos rituels jour après jour.",
  },
];

export const getModule = (id: string) => MODULES.find((m) => m.id === id);
