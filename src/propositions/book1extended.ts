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

function infiniteLine(id: string, p1: string, p2: string, color = "black"): Segment {
  return {
    id,
    type: "segment",
    p1,
    p2,
    label: id,
    color,
    source: "given",
    createdBy: "given",
    dependencies: [p1, p2],
  };
}

function lineWithPointGiven(): GeometryObject[] {
  return [
    point("A", 180, 360, "red"),
    point("C", 420, 360, "gold"),
    point("B", 660, 360, "blue"),
    infiniteLine("AB", "A", "B"),
  ];
}

function externalPointGiven(): GeometryObject[] {
  return [
    point("A", 180, 420, "red"),
    point("B", 700, 420, "blue"),
    point("C", 440, 170, "gold"),
    infiniteLine("AB", "A", "B"),
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

function angleInequalityTrianglesGiven(): GeometryObject[] {
  return [
    point("A", 250, 220, "red"),
    point("B", 150, 430, "blue"),
    point("C", 390, 430, "gold"),
    point("D", 580, 220, "red"),
    point("E", 480, 430, "blue"),
    point("F", 622, 469, "gold"),
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
    point("E", 450, 305, "red"),
    segment("AB", "A", "B", "black"),
    segment("CD", "C", "D", "black"),
  ];
}

function exteriorTriangleGiven(): GeometryObject[] {
  return [
    point("A", 430, 150, "red"),
    point("B", 240, 430, "blue"),
    point("C", 640, 430, "gold"),
    point("D", 800, 430, "gold"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "blue"),
    segment("BC", "B", "C", "black"),
    segment("CD", "C", "D", "black"),
  ];
}

function interiorBrokenLineGiven(): GeometryObject[] {
  return [
    ...triangleGiven(),
    point("D", 440, 330, "gold"),
    segment("BD", "B", "D", "gold"),
    segment("DC", "D", "C", "gold"),
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

function lineCDGiven(): GeometryObject[] {
  return [
    point("D", 230, 390, "red"),
    point("C", 690, 390, "blue"),
    infiniteLine("CD", "C", "D", "black"),
  ];
}

function lineABGiven(): GeometryObject[] {
  return [
    point("A", 360, 190, "red"),
    point("B", 500, 390, "blue"),
    infiniteLine("AB", "A", "B", "black"),
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

function parallelTransversalGiven(): GeometryObject[] {
  return [
    point("A", 165, 240, "red"),
    point("G", 410, 240, "gold"),
    point("B", 710, 240, "blue"),
    point("C", 205, 440, "red"),
    point("H", 530, 440, "gold"),
    point("D", 780, 440, "blue"),
    point("E", 320, 90, "gold"),
    point("F", 610, 573, "gold"),
    segment("AB", "A", "B", "red"),
    segment("CD", "C", "D", "blue"),
    segment("EF", "E", "F", "black"),
  ];
}

function threeParallelLinesGiven(): GeometryObject[] {
  return [
    point("A", 170, 220, "red"),
    point("B", 730, 220, "blue"),
    point("E", 150, 340, "gold"),
    point("F", 710, 340, "gold"),
    point("C", 210, 470, "red"),
    point("D", 770, 470, "blue"),
    segment("AB", "A", "B", "red"),
    segment("EF", "E", "F", "gold"),
    segment("CD", "C", "D", "blue"),
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

function pointAndLineBCGiven(): GeometryObject[] {
  return [
    point("A", 450, 180, "red"),
    point("B", 200, 410, "blue"),
    point("C", 720, 410, "gold"),
    segment("BC", "B", "C", "black"),
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

function equalParallelJoinersGiven(): GeometryObject[] {
  return [
    point("A", 220, 300, "red"),
    point("B", 520, 300, "blue"),
    point("C", 340, 440, "red"),
    point("D", 640, 440, "blue"),
    segment("AB", "A", "B", "red"),
    segment("CD", "C", "D", "red"),
    segment("AC", "A", "C", "gold"),
    segment("BD", "B", "D", "gold"),
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

function parallelogramACDBGiven(): GeometryObject[] {
  return [
    point("A", 220, 420, "red"),
    point("C", 360, 230, "gold"),
    point("D", 700, 230, "red"),
    point("B", 560, 420, "blue"),
    segment("AC", "A", "C", "red"),
    segment("CD", "C", "D", "black"),
    segment("DB", "D", "B", "blue"),
    segment("BA", "B", "A", "black"),
  ];
}

function parallelogramComplementsGiven(): GeometryObject[] {
  return [
    point("A", 180, 470, "red"),
    point("B", 700, 470, "blue"),
    point("C", 820, 170, "gold"),
    point("D", 300, 170, "red"),
    point("E", 450, 470, "blue"),
    point("F", 762, 314, "blue"),
    point("G", 570, 170, "gold"),
    point("H", 242, 314, "gold"),
    point("K", 513, 314, "red"),
    segment("AB", "A", "B", "black"),
    segment("BC", "B", "C", "blue"),
    segment("CD", "C", "D", "black"),
    segment("DA", "D", "A", "red"),
    segment("AC", "A", "C", "gold"),
    segment("AE", "A", "E", "red"),
    segment("EK", "E", "K", "blue"),
    segment("KH", "K", "H", "black"),
    segment("HA", "H", "A", "gold"),
    segment("KF", "K", "F", "blue"),
    segment("FC", "F", "C", "red"),
    segment("CG", "C", "G", "gold"),
    segment("GK", "G", "K", "black"),
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

function sameBaseParallelogramsGiven(): GeometryObject[] {
  return [
    point("A", 70, 220, "red"),
    point("D", 390, 220, "red"),
    point("E", 530, 220, "gold"),
    point("F", 850, 220, "gold"),
    point("B", 300, 460, "blue"),
    point("C", 620, 460, "blue"),
    segment("AF", "A", "F", "black"),
    segment("AD", "A", "D", "red"),
    segment("EF", "E", "F", "red"),
    segment("AB", "A", "B", "blue"),
    segment("DC", "D", "C", "blue"),
    segment("EB", "E", "B", "gold"),
    segment("FC", "F", "C", "gold"),
    segment("BC", "B", "C", "black"),
  ];
}

function equalBaseParallelogramsGiven(): GeometryObject[] {
  return [
    point("A", 120, 220, "red"),
    point("D", 280, 220, "red"),
    point("E", 480, 220, "gold"),
    point("H", 640, 220, "gold"),
    point("B", 180, 460, "blue"),
    point("C", 340, 460, "blue"),
    point("F", 540, 460, "blue"),
    point("G", 700, 460, "blue"),
    segment("AH", "A", "H", "black"),
    segment("BG", "B", "G", "black"),
    segment("AD", "A", "D", "red"),
    segment("BC", "B", "C", "red"),
    segment("AB", "A", "B", "gold"),
    segment("DC", "D", "C", "gold"),
    segment("EH", "E", "H", "red"),
    segment("FG", "F", "G", "red"),
    segment("EF", "E", "F", "gold"),
    segment("HG", "H", "G", "gold"),
  ];
}

function sameBaseTrianglesBetweenParallelsGiven(): GeometryObject[] {
  return [
    point("A", 530, 340, "red"),
    point("D", 350, 340, "gold"),
    point("B", 260, 460, "blue"),
    point("C", 620, 460, "blue"),
    segment("AD", "A", "D", "gold"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "red"),
    segment("DB", "D", "B", "gold"),
    segment("DC", "D", "C", "gold"),
    segment("BC", "B", "C", "black"),
  ];
}

function equalBaseTrianglesBetweenParallelsGiven(): GeometryObject[] {
  return [
    point("A", 250, 340, "red"),
    point("D", 610, 340, "gold"),
    point("B", 180, 460, "blue"),
    point("C", 340, 460, "blue"),
    point("E", 520, 460, "blue"),
    point("F", 680, 460, "blue"),
    segment("AD", "A", "D", "gold"),
    segment("BF", "B", "F", "black"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "red"),
    segment("ED", "E", "D", "gold"),
    segment("DF", "D", "F", "gold"),
    segment("BC", "B", "C", "red"),
    segment("EF", "E", "F", "red"),
  ];
}

function parallelogramAndTriangleGiven(): GeometryObject[] {
  return [
    point("A", 160, 220, "red"),
    point("D", 520, 220, "red"),
    point("E", 360, 220, "gold"),
    point("B", 260, 460, "blue"),
    point("C", 620, 460, "blue"),
    segment("AD", "A", "D", "black"),
    segment("AB", "A", "B", "red"),
    segment("DC", "D", "C", "red"),
    segment("BC", "B", "C", "black"),
    segment("EB", "E", "B", "gold"),
    segment("EC", "E", "C", "gold"),
  ];
}

function triangleAndAngleGiven(): GeometryObject[] {
  return [
    point("A", 420, 220, "red"),
    point("B", 260, 460, "blue"),
    point("C", 620, 460, "blue"),
    segment("AB", "A", "B", "red"),
    segment("AC", "A", "C", "blue"),
    segment("BC", "B", "C", "black"),
    point("D", 760, 320, "red"),
    point("H", 820, 320, "gold"),
    point("K", 760, 260, "gold"),
    segment("DH", "D", "H", "gold"),
    segment("DK", "D", "K", "gold"),
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

  if (number === 13) {
    return lineCDGiven();
  }

  if (number === 14) {
    return lineABGiven();
  }

  if (number === 15) {
    return crossingLinesGiven();
  }

  if (number === 16) {
    return exteriorTriangleGiven();
  }

  if ([17, 18, 19, 20, 32].includes(number)) {
    return triangleGiven();
  }

  if (number === 21) {
    return interiorBrokenLineGiven();
  }

  if (number === 22) {
    return threeSegmentsGiven();
  }

  if (number === 23) {
    return sourceAngleTargetRayGiven();
  }

  if (number === 24) {
    return angleInequalityTrianglesGiven();
  }

  if ([25, 26].includes(number)) {
    return doubleTriangleGiven();
  }

  if (number === 28) {
    return parallelTransversalGiven();
  }

  if (number === 30) {
    return threeParallelLinesGiven();
  }

  if ([27, 29].includes(number)) {
    return parallelGiven();
  }

  if (number === 31) {
    return pointAndLineBCGiven();
  }

  if (number === 33) {
    return equalParallelJoinersGiven();
  }

  if (number === 34) {
    return parallelogramACDBGiven();
  }

  if (number === 35) {
    return sameBaseParallelogramsGiven();
  }

  if (number === 36) {
    return equalBaseParallelogramsGiven();
  }

  if (number === 37) {
    return sameBaseTrianglesBetweenParallelsGiven();
  }

  if (number === 38) {
    return equalBaseTrianglesBetweenParallelsGiven();
  }

  if (number === 41) {
    return parallelogramAndTriangleGiven();
  }

  if (number === 42) {
    return triangleAndAngleGiven();
  }

  if (number === 43) {
    return parallelogramComplementsGiven();
  }

  if ([40].includes(number)) {
    return baseAndParallelGiven(true);
  }

  if (number === 39) {
    return triangleGiven();
  }

  if (number === 40) {
    return equalBasesOneTriangleGiven();
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

function pointLabelSequenceFor(number: number) {
  if (number === 11) {
    return ["D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 12) {
    return ["D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 16) {
    return ["E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if ([17, 18, 20].includes(number)) {
    return ["D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 21) {
    return ["E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 24) {
    return ["G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 30) {
    return ["G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 31) {
    return ["D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 32) {
    return ["D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 35) {
    return ["G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 37) {
    return ["E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 38) {
    return ["G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 42) {
    return ["E", "F", "G", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 13) {
    return ["A", "B", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  if (number === 14) {
    return ["C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
  }

  return ["G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
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
    pointLabelSequence: pointLabelSequenceFor(spec.number),
    nextPropositionId: spec.number < 48 ? `I.${spec.number + 1}` : undefined,
  };
});
