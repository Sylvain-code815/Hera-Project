import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { loadProfile, type Profile } from "@/lib/profile";
import { loadPreferences, type Preferences } from "@/lib/preferences";
import { SECTIONS, type SectionId } from "@/lib/profile-sections";

export const Route = createFileRoute("/_app/profil/")({
  head: () => ({
    meta: [
      { title: "Profil — Sereine" },
      { name: "description", content: "Vos informations et préférences." },
    ],
  }),
  component: ProfilPage,
});

const THEME_LABEL: Record<Preferences["theme"], string> = {
  system: "Automatique",
  light: "Clair",
  dark: "Sombre",
};

function hintFor(id: SectionId, profile: Profile | null, prefs: Preferences): string {
  switch (id) {
    case "infos":
      return profile
        ? `${profile.prenom}${profile.age ? `, ${profile.age} ans` : ""}`
        : "À compléter";
    case "objectifs":
      return profile
        ? `${profile.goals.length} objectif${profile.goals.length > 1 ? "s" : ""} actif${profile.goals.length > 1 ? "s" : ""}`
        : "Aucun objectif";
    case "statistiques":
      return "Tendances & progression";
    case "themes":
      return `Thème ${THEME_LABEL[prefs.theme].toLowerCase()}`;
    case "notifications": {
      const on = Object.values(prefs.notifications).filter(Boolean).length;
      return `${on} activée${on > 1 ? "s" : ""}`;
    }
    case "confidentialite":
      return "Vos données";
  }
}

function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);

  useEffect(() => {
    setProfile(loadProfile());
    setPrefs(loadPreferences());
  }, []);

  return (
    <div className="px-6 pt-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Retour
      </Link>

      <header className="mb-8">
        <h1 className="font-serif-italic text-3xl">Profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Personnalisez votre expérience</p>
      </header>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.id}
              to="/profil/$section"
              params={{ section: s.id }}
              className={`block rounded-[28px] border ${s.bg} p-5 flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-sm`}
            >
              <div className="size-11 bg-card/70 rounded-2xl flex items-center justify-center shrink-0">
                <Icon className="size-5 text-foreground/70" strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-foreground/60 mt-0.5">{hintFor(s.id, profile, prefs)}</p>
              </div>
              <ChevronRight className="size-4 text-foreground/40" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
