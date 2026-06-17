import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useEffect } from "react";
import { applyTheme, loadPreferences } from "@/lib/preferences";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onToday = pathname === "/";
  const onSante = pathname.startsWith("/sante");

  // Apply the saved theme on load and react to OS theme changes (system mode).
  useEffect(() => {
    applyTheme(loadPreferences().theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(loadPreferences().theme);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Logo — top-left, persistent */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-30 size-10 rounded-2xl bg-clay text-white shadow-sm flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="Accueil"
      >
        <span className="font-serif-italic text-xl leading-none">H</span>
      </Link>

      {/* Profile button — top-right, persistent */}
      <Link
        to="/profil"
        className="fixed top-4 right-4 z-30 size-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Profil"
      >
        <User className="size-4 text-muted-foreground" />
      </Link>

      <main className="mx-auto max-w-[480px] pb-28">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-card/85 backdrop-blur-md border-t border-border">
        <div className="mx-auto max-w-[480px] h-20 flex items-center justify-around px-8">
          <TabLink to="/" active={onToday} label="Aujourd'hui" />
          <TabLink to="/sante" active={onSante} label="Santé" />
        </div>
      </nav>
    </div>
  );
}

function TabLink({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 py-2 px-3">
      <span
        className={`size-1.5 rounded-full transition-all ${
          active ? "bg-clay scale-100" : "bg-muted-foreground/30 scale-75"
        }`}
      />
      <span
        className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${
          active ? "opacity-100" : "opacity-40"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
