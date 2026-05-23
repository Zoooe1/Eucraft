import { allPoints, segmentExistsBetween } from "../geometry/operations";
import { circleUsingBase } from "../geometry/objectResolution";
import type { GeometryObject } from "../geometry/types";
import { useGeometryStore } from "../state/useGeometryStore";

function constructionNote(objects: GeometryObject[]) {
  const circleA = circleUsingBase(objects, "A", "B");
  const circleB = circleUsingBase(objects, "B", "A");
  const candidatePoints = allPoints(objects).filter((point) => point.id !== "A" && point.id !== "B");
  const candidate = candidatePoints[0];

  if (!circleA) {
    return "Use the compass to draw a circle from A through B.";
  }

  if (!circleB) {
    return "Draw a second circle from B through A.";
  }

  if (!candidate) {
    return "Use the intersection tool to choose where the circles meet.";
  }

  const hasAC = segmentExistsBetween(objects, "A", candidate.id);
  const hasBC = segmentExistsBetween(objects, "B", candidate.id);

  if (!hasAC || !hasBC) {
    return "Use the straightedge to connect the new point back to A and B.";
  }

  return "The figure is ready for judgment. Check the construction when the three sides look complete.";
}

export function Marginalia() {
  const objects = useGeometryStore((state) => state.objects);

  return (
    <aside className="marginalia" aria-label="Marginalia">
      <p className="panel-label">Marginalia</p>
      <p>{constructionNote(objects)}</p>
    </aside>
  );
}
