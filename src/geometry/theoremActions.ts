import type { GeometryObject } from "./types";

export type TheoremActionDefinition = {
  requiredUnlock: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  validationFunction: string;
  logicReplay: string[];
  execute: (...args: unknown[]) => GeometryObject[];
};

function theoremActionPlaceholder() {
  return [];
}

export function constructEquilateralTriangleOnSegment() {
  return theoremActionPlaceholder();
}

export function transferSegmentToPoint() {
  return theoremActionPlaceholder();
}

export function cutOffEqualSegment() {
  return theoremActionPlaceholder();
}

export function bisectAngle() {
  return theoremActionPlaceholder();
}

export function bisectSegment() {
  return theoremActionPlaceholder();
}

export const theoremActions: Record<string, TheoremActionDefinition> = {
  constructEquilateralTriangleOnSegment: {
    requiredUnlock: "unlock-I.1-equilateral",
    inputs: ["segment"],
    outputs: ["point", "segments", "circles"],
    dependencies: ["Post.1", "Post.3", "Def.1.15", "C.N.1"],
    validationFunction: "isEquilateralTriangle",
    logicReplay: [
      "The two AB-radius circles produce an apex C.",
      "Radii give AC = AB and BC = AB.",
      "Common Notion 1 makes the triangle equilateral.",
    ],
    execute: constructEquilateralTriangleOnSegment,
  },
  transferSegmentToPoint: {
    requiredUnlock: "unlock-I.2-transfer-length",
    inputs: ["sourceSegment", "targetPoint"],
    outputs: ["segment"],
    dependencies: ["I.1", "Post.1", "Post.2", "Post.3", "Def.1.15", "C.N.1", "C.N.3"],
    validationFunction: "verifyTransferredSegment",
    logicReplay: [
      "I.1 supplies the auxiliary equilateral triangle.",
      "Circle radii and equal remainders prove the placed segment equals the source.",
      "Length transfer is now an earned theorem-action, not a primitive copy tool.",
    ],
    execute: transferSegmentToPoint,
  },
  cutOffEqualSegment: {
    requiredUnlock: "unlock-I.3-cut-off",
    inputs: ["longSegment", "shortSegment", "fromEndpoint"],
    outputs: ["pointOnLongSegment", "segment"],
    dependencies: ["I.2", "Post.3", "Def.1.15", "C.N.1"],
    validationFunction: "cutSegmentEqualsTarget",
    logicReplay: [
      "I.2 first places a segment equal to the lesser line.",
      "A circle from the chosen endpoint cuts the greater line at the equal distance.",
      "The cut-off segment can now be used in later constructions.",
    ],
    execute: cutOffEqualSegment,
  },
  bisectAngle: {
    requiredUnlock: "unlock-I.9-angle-bisector",
    inputs: ["angle"],
    outputs: ["ray"],
    dependencies: ["I.1", "I.3", "I.8", "Post.1"],
    validationFunction: "validateAngleBisector",
    logicReplay: [
      "I.3 cuts equal lengths on the sides of the angle.",
      "I.1 builds the auxiliary equilateral triangle.",
      "I.8 proves the two resulting angles equal.",
    ],
    execute: bisectAngle,
  },
  bisectSegment: {
    requiredUnlock: "unlock-I.10-segment-bisector",
    inputs: ["segment"],
    outputs: ["midpoint", "bisectingLineOrPoint"],
    dependencies: ["I.1", "I.4", "I.9"],
    validationFunction: "validateMidpoint",
    logicReplay: [
      "I.1 builds an equilateral triangle on the segment.",
      "I.9 bisects the apex angle.",
      "I.4 proves the two pieces of the base are equal.",
    ],
    execute: bisectSegment,
  },
};
