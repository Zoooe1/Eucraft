import { useGeometryStore } from "../../state/useGeometryStore";
import { FootprintTrail } from "./FootprintTrail";

export function EucraftLanding() {
  const startApp = useGeometryStore((state) => state.startApp);
  const startTutorial = useGeometryStore((state) => state.startTutorial);

  return (
    <section className="eucraft-landing" aria-label="Eucraft entrance">
      <FootprintTrail />

      <div className="landing-title-block">
        <h1 className="landing-title">Eucraft</h1>
        <p className="landing-subtitle">The First Game of Euclid&apos;s Elements of Geometry</p>
        <div className="landing-actions" aria-label="Landing actions">
          <button className="landing-button" type="button" onClick={startApp}>
            Begin
          </button>
          <button className="landing-button" type="button" onClick={startTutorial}>
            Laws of the World
          </button>
        </div>
      </div>
    </section>
  );
}
