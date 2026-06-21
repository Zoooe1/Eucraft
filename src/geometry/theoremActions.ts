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

export function createCircleWithTransferredRadius() {
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

export function drawPerpendicularFromPointOnLine() {
  return theoremActionPlaceholder();
}

export function dropPerpendicularFromPointToLine() {
  return theoremActionPlaceholder();
}

export function constructTriangleFromThreeSegments() {
  return theoremActionPlaceholder();
}

export function copyAngleToLine() {
  return theoremActionPlaceholder();
}

export function drawParallelThroughPoint() {
  return theoremActionPlaceholder();
}

export function constructParallelogramEqualToTriangle() {
  return theoremActionPlaceholder();
}

export function applyParallelogramEqualToTriangleOnLine() {
  return theoremActionPlaceholder();
}

export function constructParallelogramEqualToRectilinearFigure() {
  return theoremActionPlaceholder();
}

export function constructSquareOnSegment() {
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
  createCircleWithTransferredRadius: {
    requiredUnlock: "unlock-I.2-set-compass-width",
    inputs: ["sourceLength", "centerPoint"],
    outputs: ["compassMark"],
    dependencies: ["I.2", "I.3"],
    validationFunction: "compassMarkRadiusEqualsSourceLength",
    logicReplay: [
      "Use I.2 as the justification for carrying a known length.",
      "Choose the center point for the copied compass radius.",
      "The compass mark records a radius equal to the source length.",
    ],
    execute: createCircleWithTransferredRadius,
  },
  cutOffEqualSegment: {
    requiredUnlock: "unlock-I.3-cut-off",
    inputs: ["sourceLength", "centerPoint"],
    outputs: ["compassMark"],
    dependencies: ["I.2", "Post.3", "Def.1.15", "C.N.1"],
    validationFunction: "compassMarkRadiusEqualsSourceLength",
    logicReplay: [
      "Choose the source length to copy.",
      "Choose the center point for the copied compass radius.",
      "Copy Length draws the compass mark at the equal distance.",
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
  drawPerpendicularFromPointOnLine: {
    requiredUnlock: "unlock-I.11-perpendicular-on-line",
    inputs: ["line", "pointOnLine"],
    outputs: ["perpendicularLine"],
    dependencies: ["I.3", "I.8", "I.11"],
    validationFunction: "validatePerpendicularFromPointOnLine",
    logicReplay: [
      "Cut equal segments on both sides of the point.",
      "Use congruence to show the adjacent angles are equal.",
      "Equal adjacent angles on a straight-line are right angles.",
    ],
    execute: drawPerpendicularFromPointOnLine,
  },
  dropPerpendicularFromPointToLine: {
    requiredUnlock: "unlock-I.12-drop-perpendicular",
    inputs: ["point", "line"],
    outputs: ["perpendicularSegment", "footPoint"],
    dependencies: ["I.10", "I.12"],
    validationFunction: "validateDroppedPerpendicular",
    logicReplay: [
      "Cut the target line with a circle from the external point.",
      "Bisect the chord on the target line.",
      "Join the external point to the midpoint to drop a perpendicular.",
    ],
    execute: dropPerpendicularFromPointToLine,
  },
  constructTriangleFromThreeSegments: {
    requiredUnlock: "unlock-I.22-triangle-from-three-segments",
    inputs: ["segment", "segment", "segment"],
    outputs: ["triangle"],
    dependencies: ["I.20", "I.22", "Post.3"],
    validationFunction: "validateTriangleFromThreeSegments",
    logicReplay: [
      "The triangle inequality allows the side lengths to meet.",
      "Circles from the base endpoints locate the apex.",
      "Radius equality gives the three requested sides.",
    ],
    execute: constructTriangleFromThreeSegments,
  },
  copyAngleToLine: {
    requiredUnlock: "unlock-I.23-copy-angle",
    inputs: ["sourceAngle", "targetLine", "targetPoint"],
    outputs: ["angle"],
    dependencies: ["I.22", "I.8", "I.23"],
    validationFunction: "validateCopiedAngle",
    logicReplay: [
      "Represent the source angle by a triangle.",
      "Construct a matching triangle on the target line.",
      "Use SSS to prove the placed angle equals the source.",
    ],
    execute: copyAngleToLine,
  },
  drawParallelThroughPoint: {
    requiredUnlock: "unlock-I.31-draw-parallel",
    inputs: ["point", "line"],
    outputs: ["parallelLine"],
    dependencies: ["I.23", "I.27", "I.31"],
    validationFunction: "validateParallelThroughPoint",
    logicReplay: [
      "Copy the transversal angle at the given point.",
      "Equal alternate angles imply the new line is parallel.",
      "The parallel construction is now an earned action.",
    ],
    execute: drawParallelThroughPoint,
  },
  constructParallelogramEqualToTriangle: {
    requiredUnlock: "unlock-I.42-parallelogram-equal-triangle",
    inputs: ["triangle", "angle"],
    outputs: ["parallelogram"],
    dependencies: ["I.10", "I.23", "I.31", "I.41", "I.42"],
    validationFunction: "validateParallelogramEqualToTriangle",
    logicReplay: [
      "Bisect the triangle base.",
      "Construct the requested angle and complete the parallelogram.",
      "I.41 proves the parallelogram equals the triangle.",
    ],
    execute: constructParallelogramEqualToTriangle,
  },
  applyParallelogramEqualToTriangleOnLine: {
    requiredUnlock: "unlock-I.44-apply-parallelogram-line",
    inputs: ["line", "triangle", "angle"],
    outputs: ["parallelogram"],
    dependencies: ["I.42", "I.43", "I.44"],
    validationFunction: "validateAppliedParallelogramEqualToTriangle",
    logicReplay: [
      "Construct an equal parallelogram by I.42.",
      "Use complements around a diagonal by I.43.",
      "Apply the equal area to the given line.",
    ],
    execute: applyParallelogramEqualToTriangleOnLine,
  },
  constructParallelogramEqualToRectilinearFigure: {
    requiredUnlock: "unlock-I.45-parallelogram-equal-figure",
    inputs: ["rectilinearFigure", "angle"],
    outputs: ["parallelogram"],
    dependencies: ["I.44", "I.45"],
    validationFunction: "validateParallelogramEqualToRectilinearFigure",
    logicReplay: [
      "Decompose the rectilinear figure into triangles.",
      "Apply each triangle as an equal parallelogram.",
      "Combine the parts into one parallelogram in the given angle.",
    ],
    execute: constructParallelogramEqualToRectilinearFigure,
  },
  constructSquareOnSegment: {
    requiredUnlock: "unlock-I.46-build-square",
    inputs: ["segment"],
    outputs: ["square"],
    dependencies: ["I.11", "I.31", "I.34", "I.46"],
    validationFunction: "validateSquareOnSegment",
    logicReplay: [
      "Erect a perpendicular on the given line.",
      "Carry the side length onto the perpendicular.",
      "Draw parallels and use parallelogram properties to make a square.",
    ],
    execute: constructSquareOnSegment,
  },
};
