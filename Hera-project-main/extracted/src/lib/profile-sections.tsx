import { User, Target, BarChart3, Palette, Bell, Shield } from "lucide-react";

// Profile "categories" — each opens an editable detail page at /profil/$section,
// mirroring the santé modules (/sante/$module) card → detail pattern.
export type SectionId =
  | "infos"
  | "objectifs"
  | "statistiques"
  | "themes"
  | "notifications"
  | "confidentialite";

export const SECTIONS: Array<{
  id: SectionId;
  label: string;
  tagline: string;
  bg: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  editable: boolean;
}> = [
  {
    id: "infos",
    label: "Informations personnelles",
    tagline: "Votre identité et vos mensurations.",
    bg: "bg-sage/30 border-sage/60",
    icon: User,
    editable: true,
  },
  {
    id: "objectifs",
    label: "Objectifs",
    tagline: "Ce que vous souhaitez accomplir.",
    bg: "bg-rose/30 border-rose/60",
    icon: Target,
    editable: true,
  },
  {
    id: "statistiques",
    label: "Statistiques",
    tagline: "Vos tendances & votre progression.",
    bg: "bg-sky-pastel/40 border-sky-pastel/70",
    icon: BarChart3,
    editable: false,
  },
  {
    id: "themes",
    label: "Thèmes & couleurs",
    tagline: "L'apparence de l'application.",
    bg: "bg-lavender/30 border-lavender/60",
    icon: Palette,
    editable: true,
  },
  {
    id: "notifications",
    label: "Notifications",
    tagline: "Rappels et alertes du quotidien.",
    bg: "bg-mint/30 border-mint/60",
    icon: Bell,
    editable: true,
  },
  {
    id: "confidentialite",
    label: "Confidentialité",
    tagline: "Vos données et votre vie privée.",
    bg: "bg-clay/15 border-clay/40",
    icon: Shield,
    editable: true,
  },
];

export function getSection(id: string) {
  return SECTIONS.find((s) => s.id === id);
}
