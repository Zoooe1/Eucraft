import type { ReactNode } from "react";
import type { AppPhase, Proposition } from "../../geometry/types";

type PropositionPlayLayoutProps = {
  phase: AppPhase;
  proposition: Proposition;
  sidebar: ReactNode;
  children: ReactNode;
};

export function PropositionPlayLayout({ phase, proposition, sidebar, children }: PropositionPlayLayoutProps) {
  return (
    <main className={`app-shell proposition-page phase-${phase}`} data-proposition-id={proposition.id}>
      <aside className="left-pane proposition-sidebar">{sidebar}</aside>
      <section className="proposition-canvas-panel" aria-label={`Playable workspace for Proposition ${proposition.id}`}>
        {children}
      </section>
    </main>
  );
}
