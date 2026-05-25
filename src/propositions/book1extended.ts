import { book1ExtendedSpecs, getBook1PlayableProfile } from "../euclid/book1ExtendedData";
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

function lineWithPointGiven(): GeometryObject[] {
  return [
    point("A", 180, 360, "red"),
    point("C", 420, 360, "gold"),
    point("B", 660, 360, "blue"),
    segment("AB", "A", "B"),
  ];
}

function externalPointGiven(): GeometryObject[] {
  return [
    point("A", 180, 420, "red"),
    point("B", 700, 420, "blue"),
    point("C", 440, 170, "gold"),
    segment("AB", "A", "B"),
  ];
}

function triangleGiven(): GeometryObject[] {
  return [
    point("A", 430, 150, "red"),
    point("B", 240, 430, "blue"),
    point("C", 640, 430, "gold"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "blue"),
    segment("BC", "B", "C", "black"),
  ];
}

function doubleTriangleGiven(): GeometryObject[] {
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

function crossingLinesGiven(): GeometryObject[] {
  return [
    point("A", 190, 430, "red"),
    point("B", 710, 180, "blue"),
    point("C", 190, 180, "gold"),
    point("D", 710, 430, "gold"),
    segment("AB", "A", "B", "black"),
    segment("CD", "C", "D", "black"),
  ];
}

function standingLineGiven(): GeometryObject[] {
  return [
    point("A", 180, 380, "red"),
    point("C", 430, 380, "gold"),
    point("B", 680, 380, "blue"),
    point("D", 500, 170, "gold"),
    segment("AB", "A", "B", "black"),
    segment("CD", "C", "D", "gold"),
  ];
}

function parallelGiven(): GeometryObject[] {
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

function lineAndExternalPointGiven(): GeometryObject[] {
  return [
    point("A", 200, 390, "red"),
    point("B", 700, 390, "blue"),
    point("C", 450, 190, "gold"),
    segment("AB", "A", "B", "black"),
  ];
}

function threeSegmentsGiven(): GeometryObject[] {
  return [
    point("A", 160, 260, "red"),
    point("B", 380, 260, "blue"),
    point("C", 160, 360, "red"),
    point("D", 320, 360, "blue"),
    point("E", 160, 460, "red"),
    point("F", 440, 460, "blue"),
    segment("AB", "A", "B", "red"),
    segment("CD", "C", "D", "blue"),
    segment("EF", "E", "F", "gold"),
  ];
}

function sourceAngleTargetRayGiven(): GeometryObject[] {
  return [
    point("A", 220, 370, "red"),
    point("B", 360, 370, "blue"),
    point("C", 290, 210, "gold"),
    point("D", 560, 370, "red"),
    point("E", 760, 370, "blue"),
    segment("BA", "B", "A", "red"),
    segment("BC", "B", "C", "blue"),
    segment("DE", "D", "E", "black"),
  ];
}

function twoParallelSegmentsGiven(): GeometryObject[] {
  return [
    point("A", 220, 300, "red"),
    point("B", 520, 300, "blue"),
    point("C", 340, 430, "red"),
    point("D", 640, 430, "blue"),
    segment("AB", "A", "B", "red"),
    segment("CD", "C", "D", "blue"),
  ];
}

function parallelogramGiven(): GeometryObject[] {
  return [
    point("A", 220, 420, "red"),
    point("B", 560, 420, "blue"),
    point("C", 700, 230, "gold"),
    point("D", 360, 230, "red"),
    segment("AB", "A", "B", "black"),
    segment("BC", "B", "C", "blue"),
    segment("CD", "C", "D", "black"),
    segment("DA", "D", "A", "red"),
  ];
}

function baseAndParallelGiven(equalBases = false): GeometryObject[] {
  return [
    point("A", 180, 430, "red"),
    point("B", equalBases ? 360 : 620, 430, "blue"),
    ...(equalBases
      ? [
          point("C", 430, 430, "red"),
          point("D", 610, 430, "blue"),
          segment("CD", "C", "D", "blue"),
        ]
      : []),
    point("E", 180, 230, "gold"),
    point("F", 720, 230, "gold"),
    segment("AB", "A", "B", "black"),
    segment("EF", "E", "F", "gold"),
  ];
}

function triangleAndParallelGiven(): GeometryObject[] {
  return [
    ...triangleGiven(),
    point("D", 190, 230, "gold"),
    point("E", 700, 230, "gold"),
    segment("DE", "D", "E", "gold"),
  ];
}

function equalBasesOneTriangleGiven(): GeometryObject[] {
  return [
    point("A", 160, 430, "red"),
    point("B", 340, 430, "blue"),
    point("C", 430, 430, "red"),
    point("D", 610, 430, "blue"),
    point("E", 250, 230, "gold"),
    segment("AB", "A", "B", "black"),
    segment("CD", "C", "D", "blue"),
    segment("AE", "A", "E", "red"),
    segment("BE", "B", "E", "gold"),
  ];
}

function rightTriangleGiven(): GeometryObject[] {
  return [
    point("A", 260, 420, "red"),
    point("B", 260, 180, "blue"),
    point("C", 640, 420, "gold"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "blue"),
    segment("BC", "B", "C", "black"),
  ];
}

function figureGiven(): GeometryObject[] {
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
  ];
}

function initialObjectsFor(number: number, type: Proposition["type"]): GeometryObject[] {
  if (number === 11) {
    return lineWithPointGiven();
  }

  if (number === 12) {
    return externalPointGiven();
  }

  if (number === 13 || number === 14) {
    return standingLineGiven();
  }

  if (number === 15) {
    return crossingLinesGiven();
  }

  if ([16, 17, 18, 19, 20, 21, 32].includes(number)) {
    return triangleGiven();
  }

  if (number === 22) {
    return threeSegmentsGiven();
  }

  if (number === 23) {
    return sourceAngleTargetRayGiven();
  }

  if ([24, 25, 26].includes(number)) {
    return doubleTriangleGiven();
  }

  if ([27, 28, 29, 30].includes(number)) {
    return parallelGiven();
  }

  if (number === 31) {
    return lineAndExternalPointGiven();
  }

  if (number === 33) {
    return twoParallelSegmentsGiven();
  }

  if ([34, 43].includes(number)) {
    return parallelogramGiven();
  }

  if ([35, 37, 41].includes(number)) {
    return baseAndParallelGiven();
  }

  if ([36, 38, 40].includes(number)) {
    return baseAndParallelGiven(true);
  }

  if (number === 39) {
    return triangleGiven();
  }

  if (number === 40) {
    return equalBasesOneTriangleGiven();
  }

  if (number === 42) {
    return [...triangleGiven(), point("D", 700, 270, "red"), point("E", 780, 420, "blue"), segment("DE", "D", "E", "gold")];
  }

  if (number === 44) {
    return [
      point("A", 150, 430, "red"),
      point("B", 390, 430, "blue"),
      segment("AB", "A", "B", "black"),
      point("C", 560, 410, "red"),
      point("D", 700, 230, "blue"),
      point("E", 820, 410, "gold"),
      segment("CD", "C", "D", "red"),
      segment("DE", "D", "E", "blue"),
      segment("CE", "C", "E", "black"),
      point("F", 480, 260, "gold"),
      point("G", 560, 410, "gold"),
      segment("FG", "F", "G", "gold"),
    ];
  }

  if ([45].includes(number)) {
    return [...figureGiven(), point("G", 700, 270, "red"), point("H", 780, 420, "blue"), segment("GH", "G", "H", "gold")];
  }

  if ([47, 48].includes(number)) {
    return rightTriangleGiven();
  }

  if (number === 46) {
    return [
      point("A", 260, 380, "red"),
      point("B", 620, 380, "blue"),
      segment("AB", "A", "B", "black"),
    ];
  }

  if (type === "area-theorem") {
    return baseAndParallelGiven();
  }

  return triangleGiven();
}

export const book1ExtendedPropositions: Proposition[] = book1ExtendedSpecs.map((spec) => {
  const playable = getBook1PlayableProfile(spec.number, spec.type);

  return {
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
    startState: playable.startState,
    challengeType: playable.challengeType,
    userTask: playable.userTask,
    forbiddenInitialObjects: playable.forbiddenInitialObjects,
    requiredUserActions: playable.requiredUserActions,
    dependencies: spec.dependencies,
    unlocks: spec.unlocks,
    initialObjects: initialObjectsFor(spec.number, spec.type),
    allowedTools: spec.allowedTools,
    constructionGuide: spec.constructionGuide,
    validationGoal: {
      ...spec.validationGoal,
      ...playable.validationGoalPatch,
    },
    lawSections: book1Prop1.lawSections,
    replaySteps: spec.replaySteps,
    pointLabelSequence: ["G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
    nextPropositionId: spec.number < 48 ? `I.${spec.number + 1}` : undefined,
  };
});
