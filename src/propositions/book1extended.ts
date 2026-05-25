import { book1ExtendedSpecs } from "../euclid/book1ExtendedData";
import type { GeometryObject, Point, Proposition, Segment } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

function point(id: string, x: number, y: number, color: string): Point {
  return {
    id,
    type: "point",
    x,
    y,
    label: id,
    fixed: true,
    color,
    createdBy: "given",
  };
}

function segment(id: string, p1: string, p2: string, color = "black"): Segment {
  return {
    id,
    type: "segment",
    p1,
    p2,
    label: id,
    color,
    given: true,
    source: "given",
  };
}

function lineWithPointDiagram(): GeometryObject[] {
  return [
    point("A", 180, 360, "red"),
    point("C", 420, 360, "gold"),
    point("B", 660, 360, "blue"),
    point("D", 420, 180, "gold"),
    segment("AB", "A", "B"),
    segment("CD", "C", "D", "gold"),
  ];
}

function externalPointDiagram(): GeometryObject[] {
  return [
    point("A", 180, 420, "red"),
    point("B", 700, 420, "blue"),
    point("C", 440, 170, "gold"),
    point("D", 310, 420, "red"),
    point("E", 570, 420, "blue"),
    point("F", 440, 420, "gold"),
    segment("AB", "A", "B"),
    segment("DE", "D", "E", "black"),
    segment("CF", "C", "F", "gold"),
  ];
}

function triangleDiagram(): GeometryObject[] {
  return [
    point("A", 430, 150, "red"),
    point("B", 240, 430, "blue"),
    point("C", 640, 430, "gold"),
    point("D", 710, 430, "blue"),
    point("E", 430, 300, "gold"),
    point("F", 520, 260, "red"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "blue"),
    segment("BC", "B", "C", "black"),
    segment("BD", "B", "D", "black"),
    segment("AE", "A", "E", "gold"),
    segment("CF", "C", "F", "gold"),
  ];
}

function doubleTriangleDiagram(): GeometryObject[] {
  return [
    point("A", 250, 220, "red"),
    point("B", 150, 430, "blue"),
    point("C", 390, 430, "gold"),
    point("D", 570, 220, "red"),
    point("E", 470, 430, "blue"),
    point("F", 710, 430, "gold"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "blue"),
    segment("BC", "B", "C", "black"),
    segment("DE", "D", "E", "red"),
    segment("DF", "D", "F", "blue"),
    segment("EF", "E", "F", "black"),
  ];
}

function parallelDiagram(): GeometryObject[] {
  return [
    point("A", 190, 260, "red"),
    point("B", 680, 260, "blue"),
    point("C", 240, 420, "red"),
    point("D", 730, 420, "blue"),
    point("E", 350, 150, "gold"),
    point("F", 570, 520, "gold"),
    segment("AB", "A", "B", "red"),
    segment("CD", "C", "D", "blue"),
    segment("EF", "E", "F", "black"),
  ];
}

function parallelogramDiagram(): GeometryObject[] {
  return [
    point("A", 220, 420, "red"),
    point("B", 560, 420, "blue"),
    point("C", 700, 230, "gold"),
    point("D", 360, 230, "red"),
    point("E", 450, 420, "gold"),
    point("F", 560, 310, "blue"),
    segment("AB", "A", "B", "black"),
    segment("BC", "B", "C", "blue"),
    segment("CD", "C", "D", "black"),
    segment("DA", "D", "A", "red"),
    segment("AC", "A", "C", "gold"),
    segment("DE", "D", "E", "gold"),
    segment("BF", "B", "F", "gold"),
  ];
}

function areaDiagram(): GeometryObject[] {
  return [
    point("A", 190, 430, "red"),
    point("B", 600, 430, "blue"),
    point("C", 700, 220, "gold"),
    point("D", 290, 220, "red"),
    point("E", 420, 220, "gold"),
    point("F", 520, 430, "blue"),
    segment("AB", "A", "B", "black"),
    segment("BC", "B", "C", "blue"),
    segment("CD", "C", "D", "black"),
    segment("DA", "D", "A", "red"),
    segment("AE", "A", "E", "gold"),
    segment("EF", "E", "F", "gold"),
    segment("FB", "F", "B", "gold"),
  ];
}

function rightTriangleDiagram(): GeometryObject[] {
  return [
    point("A", 260, 420, "red"),
    point("B", 260, 180, "blue"),
    point("C", 640, 420, "gold"),
    point("D", 260, 520, "red"),
    point("E", 640, 520, "blue"),
    point("F", 760, 420, "gold"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "blue"),
    segment("BC", "B", "C", "black"),
    segment("DE", "D", "E", "gold"),
    segment("EF", "E", "F", "gold"),
  ];
}

function figureDiagram(): GeometryObject[] {
  return [
    point("A", 220, 420, "red"),
    point("B", 470, 420, "blue"),
    point("C", 610, 310, "gold"),
    point("D", 500, 190, "red"),
    point("E", 260, 240, "blue"),
    point("F", 710, 420, "gold"),
    segment("AB", "A", "B", "black"),
    segment("BC", "B", "C", "blue"),
    segment("CD", "C", "D", "black"),
    segment("DE", "D", "E", "red"),
    segment("EA", "E", "A", "gold"),
    segment("BF", "B", "F", "gold"),
  ];
}

function initialObjectsFor(number: number, type: Proposition["type"]): GeometryObject[] {
  if (number === 11) {
    return lineWithPointDiagram();
  }

  if (number === 12) {
    return externalPointDiagram();
  }

  if ([22, 23, 24, 25, 26].includes(number)) {
    return doubleTriangleDiagram();
  }

  if ([27, 28, 29, 30, 31, 33].includes(number)) {
    return parallelDiagram();
  }

  if ([34, 35, 36, 41, 43, 44].includes(number)) {
    return parallelogramDiagram();
  }

  if ([37, 38, 39, 40, 42].includes(number)) {
    return areaDiagram();
  }

  if ([45].includes(number)) {
    return figureDiagram();
  }

  if ([47, 48].includes(number)) {
    return rightTriangleDiagram();
  }

  if (number === 46) {
    return [
      point("A", 260, 380, "red"),
      point("B", 620, 380, "blue"),
      point("C", 260, 180, "gold"),
      point("D", 620, 180, "gold"),
      segment("AB", "A", "B", "black"),
    ];
  }

  if (type === "area-theorem") {
    return areaDiagram();
  }

  return triangleDiagram();
}

export const book1ExtendedPropositions: Proposition[] = book1ExtendedSpecs.map((spec) => ({
  id: `I.${spec.number}`,
  book: "Book I",
  bookNumber: 1,
  number: spec.number,
  title: spec.title,
  subtitle: "Build the Elements",
  playerGoal: spec.playerGoal,
  originalStatement: spec.originalStatement,
  instruction: spec.instruction,
  type: spec.type,
  dependencies: spec.dependencies,
  unlocks: spec.unlocks,
  initialObjects: initialObjectsFor(spec.number, spec.type),
  allowedTools: spec.allowedTools,
  constructionGuide: spec.constructionGuide,
  validationGoal: spec.validationGoal,
  lawSections: book1Prop1.lawSections,
  replaySteps: spec.replaySteps,
  pointLabelSequence: ["G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
  nextPropositionId: spec.number < 48 ? `I.${spec.number + 1}` : undefined,
}));
