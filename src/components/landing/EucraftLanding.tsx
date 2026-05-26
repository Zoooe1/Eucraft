import { useGeometryStore } from "../../state/useGeometryStore";
import { FootprintTrail } from "./FootprintTrail";

export function EucraftLanding() {
  const startApp = useGeometryStore((state) => state.startApp);
  const startTutorial = useGeometryStore((state) => state.startTutorial);

  return (
    <section className="eucraft-landing" aria-label="Eucraft entrance">
      <FootprintTrail />

      <div className="landing-title-block">
        <h1>Eucraft</h1>
        <p>The First Game of Euclid&apos;s Elements of Geometry</p>
        <div className="landing-actions" aria-label="Landing actions">
          <button type="button" onClick={startApp}>
            Begin
          </button>
          <button type="button" onClick={startTutorial}>
            Tutorial
          </button>
        </div>
      </div>
    </section>
  );
}
