import { allPoints, segmentExistsBetween } from "../geometry/operations";
import { circleUsingBase } from "../geometry/objectResolution";
import type { GeometryObject } from "../geometry/types";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";

function constructionNote(objects: GeometryObject[], propositionId: string) {
  if (propositionId === "I.2") {
    const placed = objects.some((object) => object.type === "segment" && (object.p1 === "A" || object.p2 === "A"));
    return placed
      ? "Check whether the line from A matches BC. The classical route uses an equilateral triangle, two produced lines, and two circles."
      : "Start by joining A to B, then build the construction that transfers BC to A.";
  }

  if (propositionId === "I.3") {
    return "Cut a point on AB so that the part from A equals the lesser given line CD.";
  }

  if (propositionId === "I.4") {
    return "This is a theorem page. Complete the bases BC and EF, then replay the SAS argument.";
  }

  if (propositionId === "I.5") {
    return "Produce AB beyond B and AC beyond C. The replay will use the auxiliary cuts from Euclid's proof.";
  }

  if (propositionId === "I.6") {
    return "Join the three given points into a triangle. The replay proves the converse of the isosceles theorem.";
  }

  if (propositionId === "I.7") {
    return "Join C and D. This page is a proof by impossibility: the second same-side point cannot survive.";
  }

  if (propositionId === "I.8") {
    return "Complete the bases BC and EF so all three matching sides are present for SSS.";
  }

  if (propositionId === "I.9") {
    return "Make AD and AE equal on the two sides, build equilateral DEF, then join A to F.";
  }

  if (propositionId === "I.10") {
    return "Build the equilateral triangle on AB, then use the earned angle-bisector action or the manual I.9 construction.";
  }

  const proposition = getProposition(propositionId);
  if (proposition.number >= 11) {
    const firstGuide = proposition.constructionGuide?.[0]?.text;
    if (firstGuide) {
      return `${firstGuide} When the diagram is ready, check it to enter Logic Replay.`;
    }

    return "Study the fixed diagram, then check it to unfold the guided Logic Replay for this theorem.";
  }

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
  const propositionId = useGeometryStore((state) => state.currentPropositionId);

  return (
    <aside className="marginalia" aria-label="Marginalia">
      <p className="panel-label">Marginalia</p>
      <p>{constructionNote(objects, propositionId)}</p>
    </aside>
  );
}
