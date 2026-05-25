import type {
  ChallengeType,
  ConstructionStep,
  EuclidProposition,
  GeometryTool,
  ReplayStep,
  RequiredAction,
  Unlock,
  ValidationGoal,
} from "../geometry/types";
import { LOGIC_REPLAY_STEP_DURATION_MS } from "../logicReplayConfig";

type Book1ExtendedSpec = {
  number: number;
  title: string;
  originalStatement: string;
  playerGoal: string;
  type: EuclidProposition["type"];
  dependencies: string[];
  unlocks: string[];
  allowedTools: GeometryTool[];
  instruction: string;
  constructionGuide: ConstructionStep[];
  validationGoal: ValidationGoal;
  replaySteps: ReplayStep[];
};

export type Book1PlayableProfile = {
  startState: "minimal-givens-only";
  challengeType: ChallengeType;
  userTask: string;
  forbiddenInitialObjects: string[];
  requiredUserActions: RequiredAction[];
  validationGoalPatch: Partial<ValidationGoal>;
};

const primitives: GeometryTool[] = ["point", "straightedge", "extend", "compass", "compass-transfer", "intersection"];
const theoremOnly: GeometryTool[] = ["point", "straightedge"];

function step(id: string, text: string, highlight: string[] = ["segmentAB", "pointA", "pointB"]): ReplayStep {
  return {
    id,
    text,
    highlight,
    highlightRoles: highlight,
    durationMs: LOGIC_REPLAY_STEP_DURATION_MS,
  };
}

function guide(id: string, text: string, tool?: ConstructionStep["tool"]): ConstructionStep {
  return { id, text, tool };
}

function validationGoal(id: string, description: string, hiddenConstraints: string[] = []): ValidationGoal {
  return { id, description, hiddenConstraints };
}

function deps(previous: number, extra: string[] = []) {
  return [`I.${previous}`, ...extra];
}

function requiredAction(id: string, actionType: RequiredAction["actionType"], description: string): RequiredAction {
  return { id, actionType, description };
}

function profile(
  challengeType: ChallengeType,
  userTask: string,
  forbiddenInitialObjects: string[],
  requiredUserActions: RequiredAction[],
  goalType: NonNullable<ValidationGoal["goalType"]>,
  minimumConstructedObjects = 0,
): Book1PlayableProfile {
  return {
    startState: "minimal-givens-only",
    challengeType,
    userTask,
    forbiddenInitialObjects,
    requiredUserActions,
    validationGoalPatch: {
      goalType,
      minimumUserActions: requiredUserActions.filter((action) => !action.optional).map((action) => action.id),
      minimumConstructedObjects,
      acceptEquivalentConstructions: true,
    },
  };
}

const theoremMove = (id: string, description: string, actionType: RequiredAction["actionType"] = "select-angle") =>
  requiredAction(id, actionType, description);

export function getBook1PlayableProfile(number: number, type: EuclidProposition["type"]): Book1PlayableProfile {
  const constructionProfile = (userTask: string, forbiddenInitialObjects: string[], actions: RequiredAction[], minObjects = 2) =>
    profile("construct", userTask, forbiddenInitialObjects, actions, "construction-complete", minObjects);

  switch (number) {
    case 11:
      return constructionProfile("Construct a perpendicular through C on the given line AB.", ["CD", "D", "E", "F", "circleC", "perpendicular"], [
        requiredAction("equal-offsets", "set-compass-width", "Create equal cut-offs or an equivalent auxiliary setup around C."),
        requiredAction("candidate-perpendicular", "construct-perpendicular", "Draw a candidate perpendicular through C."),
      ]);
    case 12:
      return constructionProfile("Drop a perpendicular from C to the given line AB.", ["D", "E", "F", "CF", "circleC", "foot"], [
        requiredAction("cut-line", "draw-circle", "Draw a circle from C that cuts the line in two places."),
        requiredAction("drop-line", "construct-perpendicular", "Bisect the chord or otherwise draw the dropped perpendicular."),
      ]);
    case 22:
      return constructionProfile("Build a triangle from the three given straight-lines.", ["triangle", "apex", "construction-circles"], [
        requiredAction("set-two-widths", "set-compass-width", "Use two given segments as compass widths."),
        requiredAction("select-apex", "select-intersection", "Select the circle intersection that becomes the apex."),
        requiredAction("join-apex", "draw-segment", "Join the apex to the base endpoints."),
      ], 3);
    case 23:
      return constructionProfile("Copy the given angle onto the target ray.", ["copied-ray", "target-triangle"], [
        requiredAction("represent-angle", "draw-segment", "Build or trace the source angle's representative triangle."),
        requiredAction("copy-angle-ray", "draw-segment", "Draw the new ray forming the copied angle."),
      ]);
    case 31:
      return constructionProfile("Draw a line through C parallel to AB.", ["parallel-through-C", "copied-angle"], [
        requiredAction("draw-transversal", "draw-segment", "Draw a transversal from C to the given line."),
        requiredAction("construct-parallel-line", "construct-parallel", "Draw the candidate parallel through C."),
      ]);
    case 42:
      return profile("transform", "Transform the given triangle into an equal-area parallelogram in the given angle.", ["target-parallelogram", "midpoint", "parallels"], [
        requiredAction("bisect-base", "draw-segment", "Create the midpoint or half-base setup."),
        requiredAction("complete-parallelogram", "construct-parallelogram", "Complete the parallelogram with the given angle."),
      ], "area-equivalence", 3);
    case 44:
      return profile("transform", "Apply an equal-area parallelogram to the given line.", ["final-parallelogram", "complements", "parallels"], [
        requiredAction("helper-parallelogram", "construct-parallelogram", "Build the helper parallelogram equal to the triangle."),
        requiredAction("apply-to-line", "construct-parallelogram", "Complete the applied parallelogram on AB."),
      ], "area-equivalence", 3);
    case 45:
      return profile("transform", "Turn the rectilinear figure into an equal-area parallelogram.", ["decomposition-lines", "final-parallelogram"], [
        requiredAction("decompose-figure", "decompose-area", "Decompose the figure into triangle pieces."),
        requiredAction("recompose-parallelogram", "recompose-area", "Recompose the pieces as one parallelogram."),
      ], "area-equivalence", 2);
    case 46:
      return constructionProfile("Construct a square on AB.", ["square", "perpendicular", "parallel-sides", "fourth-vertex"], [
        requiredAction("raise-right-angle", "construct-perpendicular", "Raise a perpendicular from one endpoint of AB."),
        requiredAction("carry-side", "set-compass-width", "Carry the length AB onto the adjacent side."),
        requiredAction("complete-square", "construct-square", "Draw the remaining sides of the square."),
      ], 3);
    case 47:
      return profile("transform", "Build the three squares on the right triangle and trace the area equivalence.", ["squares", "auxiliary-lines", "area-labels", "pythagorean-label"], [
        requiredAction("square-leg-one", "construct-square", "Construct the square on AB."),
        requiredAction("square-leg-two", "construct-square", "Construct the square on AC."),
        requiredAction("square-hypotenuse", "construct-square", "Construct the square on BC."),
        requiredAction("trace-area-lines", "trace-auxiliary-line", "Trace Euclid's auxiliary area lines."),
        requiredAction("match-area-parts", "decompose-area", "Select the two area correspondences inside the hypotenuse square."),
      ], "area-equivalence", 8);
    case 48:
      return profile("derive", "Construct a comparison right triangle and identify the original right angle.", ["comparison-triangle", "right-angle-conclusion", "sss-highlights"], [
        requiredAction("construct-right-comparison", "construct-perpendicular", "Construct the comparison right triangle at A."),
        requiredAction("match-sss", "match-congruent-parts", "Match the two triangles by SSS."),
        requiredAction("mark-right-angle", "select-angle", "Identify angle BAC as a right angle."),
      ], "shape-recognition", 3);
    default:
      break;
  }

  if ([13, 14, 15, 27, 28, 29, 30].includes(number)) {
    return profile("select", "Select the angle or line relation that makes this theorem come alive.", ["conclusion-highlight", "parallel-mark", "equality-mark"], [
      theoremMove("select-given-relation", "Select the given angle or parallel relation."),
      theoremMove("mark-conclusion", "Mark the hidden conclusion.", number >= 27 ? "construct-parallel" : "select-angle"),
    ], number >= 27 ? "parallelism" : "angle-equivalence");
  }

  if ([16, 17, 18, 19, 20, 21, 24, 25].includes(number)) {
    return profile("compare", "Compare the relevant sides or angles and mark the greater relation.", ["greater-highlight", "extension", "auxiliary-cut"], [
      theoremMove("select-comparison-source", "Select the side or angle that starts the comparison.", "select-side"),
      theoremMove("mark-greater-relation", "Mark the greater-than conclusion.", "compare-objects"),
    ], "inequality", number === 21 ? 2 : 0);
  }

  if ([26, 34, 35, 36, 37, 38, 39, 40, 41].includes(number)) {
    const traceOrArrange = [34, 41].includes(number) ? "trace" : "arrange";
    return profile(traceOrArrange, "Complete the missing match or area comparison before the proof begins.", ["diagonal", "area-equality", "conclusion-highlight"], [
      theoremMove("complete-figure", "Draw or identify the missing helper part.", traceOrArrange === "trace" ? "trace-auxiliary-line" : "select-area"),
      theoremMove("mark-equivalence", "Mark the equal parts or equal areas.", "match-congruent-parts"),
    ], [35, 36, 37, 38, 39, 40, 41].includes(number) ? "area-equivalence" : "angle-equivalence", [34, 41].includes(number) ? 1 : 0);
  }

  if (number === 32) {
    return profile("derive", "Extend a side, draw the parallel, and identify the triangle angle sum.", ["extension", "auxiliary-parallel", "angle-sum-label"], [
      requiredAction("extend-side", "extend-line", "Extend one side of the triangle."),
      requiredAction("draw-parallel", "construct-parallel", "Draw the parallel through the opposite vertex."),
      requiredAction("mark-angle-sum", "select-angle", "Mark the exterior-angle and triangle-sum relations."),
    ], "angle-equivalence", 2);
  }

  if (number === 33) {
    return profile("construct", "Join corresponding endpoints and identify the equal parallel connectors.", ["AC", "BD", "connector-marks"], [
      requiredAction("draw-first-connector", "draw-segment", "Draw one connector between corresponding endpoints."),
      requiredAction("draw-second-connector", "draw-segment", "Draw the other connector."),
      requiredAction("mark-connectors", "construct-parallel", "Mark the connectors equal and parallel."),
    ], "parallelism", 2);
  }

  if (number === 43) {
    return profile("trace", "Draw the internal pieces and select the equal complements.", ["complement-highlights", "equal-area-conclusion"], [
      requiredAction("trace-diagonal", "trace-auxiliary-line", "Trace the diagonal or internal parallelogram pieces."),
      requiredAction("select-complements", "select-area", "Select the two complement regions."),
    ], "area-equivalence", 1);
  }

  return profile(type === "construction" ? "construct" : "derive", "Complete the required Euclidean interaction before Logic Replay.", ["final-conclusion"], [
    theoremMove("make-required-move", "Make the required construction or theorem selection.", type === "construction" ? "draw-segment" : "select-angle"),
  ], type === "construction" ? "construction-complete" : "theorem-identified", type === "construction" ? 1 : 0);
}

export const book1ExtendedSpecs: Book1ExtendedSpec[] = [
  {
    number: 11,
    title: "Perpendicular from a Point on a Line",
    originalStatement: "To draw a straight-line at right angles to a given straight-line from a given point on it.",
    playerGoal: "At a point sitting on a line, construct a perpendicular.",
    type: "construction",
    dependencies: deps(10, ["I.3", "I.8"]),
    unlocks: ["unlock-I.11-perpendicular-on-line"],
    allowedTools: [...primitives, "theorem-bisect-segment"],
    instruction: "Use equal cut-offs around the point, build the triangle, and join the apex back to the point.",
    constructionGuide: [
      guide("cut-equals", "Cut equal lengths on both sides of the given point.", "compass-transfer"),
      guide("build-triangle", "Build an equilateral-style comparison triangle on the equal cut-offs.", "theorem-equilateral"),
      guide("join", "Join the apex to the given point to form the perpendicular.", "straightedge"),
    ],
    validationGoal: validationGoal("validatePerpendicularFromPointOnLine", "Confirm a constructed line passes through the point and is perpendicular to the given line."),
    replaySteps: [
      step("given", "Let AB be the given straight-line, and C the given point on it."),
      step("cut", "Cut off equal segments CD and CE on the line. [Prop. I.3]", ["segmentAB", "pointC"]),
      step("triangle", "Construct equilateral triangle DFE on DE, and join FC. [Prop. I.1, Post. 1]", ["segmentDE", "pointF"]),
      step("sss", "FD = FE, DC = CE, and FC is common; I.8 gives angle DCF = FCE.", ["segmentFC", "pointC"]),
      step("right", "Equal adjacent angles on a straight-line are right angles. So FC is perpendicular to AB."),
    ],
  },
  {
    number: 12,
    title: "Drop a Perpendicular",
    originalStatement: "To draw a straight-line perpendicular to a given infinite straight-line from a given point which is not on it.",
    playerGoal: "Drop a perpendicular from an external point to a line.",
    type: "construction",
    dependencies: deps(11, ["I.10"]),
    unlocks: ["unlock-I.12-drop-perpendicular"],
    allowedTools: [...primitives, "theorem-bisect-segment", "theorem-perpendicular-on-line"],
    instruction: "Let a circle from the external point cut the line twice, bisect that chord, then join to the external point.",
    constructionGuide: [
      guide("circle", "Draw a circle from the external point cutting the line twice.", "compass"),
      guide("bisect", "Bisect the chord cut off on the line.", "theorem-bisect-segment"),
      guide("drop", "Join the external point to the midpoint.", "straightedge"),
    ],
    validationGoal: validationGoal("validateDroppedPerpendicular", "Confirm the segment from the external point meets the line at a right angle."),
    replaySteps: [
      step("given", "Let C be the point outside the straight-line AB.", ["segmentAB", "pointC"]),
      step("circle", "Draw a circle from C cutting AB at D and E. [Post. 3]", ["circleC", "segmentAB"]),
      step("bisect", "Bisect DE at F. [Prop. I.10]", ["segmentDE", "pointF"]),
      step("join", "Join CF. The two triangles around CF match by SSS. [Prop. I.8]", ["segmentCF", "pointC", "pointF"]),
      step("perpendicular", "Thus the adjacent angles at F are equal right angles; CF is perpendicular to AB."),
    ],
  },
  {
    number: 13,
    title: "Straight-Line Angle Sum",
    originalStatement: "If a straight-line stands on a straight-line, then it makes either two right angles or angles equal to two right angles.",
    playerGoal: "Understand that adjacent angles on a straight line sum to two right angles.",
    type: "theorem",
    dependencies: deps(12),
    unlocks: ["unlock-I.13-straight-angle-sum"],
    allowedTools: theoremOnly,
    instruction: "Inspect the adjacent angles; Logic Replay shows why they make two right angles.",
    constructionGuide: [guide("inspect", "Identify the two adjacent angles formed on the straight-line.", "logic-replay")],
    validationGoal: validationGoal("adjacentAnglesOnStraightLineSumTwoRightAngles", "Infer that adjacent angles on a straight-line sum to two right angles."),
    replaySteps: [
      step("stand", "Let a straight-line stand on another straight-line.", ["segmentAB", "segmentCD"]),
      step("equal-case", "If the adjacent angles are equal, they are right angles by definition."),
      step("perpendicular-case", "If they are unequal, draw a perpendicular at the point. [Prop. I.11]", ["segmentCE"]),
      step("add", "The parts add back to the two original adjacent angles. [C.N. 2]"),
      step("conclude", "Therefore the adjacent angles equal two right angles."),
    ],
  },
  {
    number: 14,
    title: "Recognize a Straight Line",
    originalStatement: "If, at a point on a straight-line, two straight-lines not lying on the same side make adjacent angles equal to two right angles, then the two straight-lines are in a straight-line with one another.",
    playerGoal: "Recognize when two rays form one straight line.",
    type: "theorem",
    dependencies: deps(13),
    unlocks: ["unlock-I.14-recognize-straight-line"],
    allowedTools: theoremOnly,
    instruction: "Use Logic Replay to see why two adjacent angles equal to two right angles force one straight line.",
    constructionGuide: [guide("inspect", "Inspect the two adjacent angles at the point.", "logic-replay")],
    validationGoal: validationGoal("anglesSumTwoRightAnglesImplyStraightLine", "Infer collinearity from adjacent angles equal to two right angles."),
    replaySteps: [
      step("given", "Let two adjacent angles at C equal two right angles.", ["pointC", "segmentAB", "segmentCD"]),
      step("suppose", "Suppose the two outer rays do not form one straight-line."),
      step("i13", "A different straight-line through the point would also make two right angles. [Prop. I.13]"),
      step("subtract", "Subtract the common angle; the remainder would equal the greater, impossible."),
      step("conclude", "Thus the two rays are in a straight-line with one another."),
    ],
  },
  {
    number: 15,
    title: "Vertical Angles Equal",
    originalStatement: "If two straight-lines cut one another, then they make the vertically opposite angles equal to one another.",
    playerGoal: "When two lines cross, opposite angles are equal.",
    type: "theorem",
    dependencies: deps(14),
    unlocks: ["unlock-I.15-vertical-angles"],
    allowedTools: [...primitives, "theorem-square"],
    instruction: "Watch the crossing lines: adjacent angle sums make opposite angles equal.",
    constructionGuide: [guide("inspect", "Inspect the four angles at the crossing.", "logic-replay")],
    validationGoal: validationGoal("verticalAnglesEqual", "Infer equality of vertically opposite angles."),
    replaySteps: [
      step("cross", "Let two straight-lines cut one another at C.", ["segmentAB", "segmentDE", "pointC"]),
      step("sum-one", "One adjacent pair equals two right angles. [Prop. I.13]"),
      step("sum-two", "The other adjacent pair also equals two right angles. [Prop. I.13]"),
      step("subtract", "Subtract the common angle from equal sums. [C.N. 3]"),
      step("conclude", "The vertically opposite angles are equal."),
    ],
  },
  {
    number: 16,
    title: "Exterior Angle Greater",
    originalStatement: "In any triangle, if one of the sides is produced, then the exterior angle is greater than either of the interior and opposite angles.",
    playerGoal: "An exterior angle of a triangle is greater than either remote interior angle.",
    type: "theorem",
    dependencies: deps(15, ["I.10"]),
    unlocks: ["unlock-I.16-exterior-angle-greater"],
    allowedTools: [...primitives, "theorem-perpendicular-on-line", "compass-transfer"],
    instruction: "Follow Euclid's auxiliary midpoint and extension argument.",
    constructionGuide: [guide("extend", "Produce one side of the triangle.", "extend"), guide("replay", "Use Logic Replay for the comparison.", "logic-replay")],
    validationGoal: validationGoal("exteriorAngleGreaterThanOppositeInterior", "Infer that an exterior angle is greater than the two remote interior angles."),
    replaySteps: [
      step("triangle", "Let one side of triangle ABC be produced to D.", ["segmentAB", "segmentBC", "segmentAC"]),
      step("midpoint", "Bisect AC, join the midpoint to B, and extend it. [Prop. I.10, Post. 2]"),
      step("match", "Use equal halves and vertical angles to match the small triangles. [Prop. I.15, I.4]"),
      step("whole", "The exterior angle contains a copy of the remote interior angle plus more."),
      step("conclude", "Therefore the exterior angle is greater than either opposite interior angle."),
    ],
  },
  {
    number: 17,
    title: "Triangle Two-Angle Limit",
    originalStatement: "In any triangle, two angles taken together in any manner are less than two right angles.",
    playerGoal: "Any two angles in a triangle add to less than a straight angle.",
    type: "theorem",
    dependencies: deps(16, ["I.13"]),
    unlocks: ["unlock-I.17-two-angle-limit"],
    allowedTools: theoremOnly,
    instruction: "Use the exterior angle and the straight-line angle sum.",
    constructionGuide: [guide("extend", "Produce one side of the triangle.", "extend")],
    validationGoal: validationGoal("twoTriangleAnglesLessThanTwoRightAngles", "Infer any two angles of a triangle are less than two right angles."),
    replaySteps: [
      step("extend", "Produce a side of the triangle to form an exterior angle.", ["segmentBC", "segmentBD"]),
      step("straight", "The exterior angle and its adjacent interior angle equal two right angles. [Prop. I.13]"),
      step("greater", "The exterior angle is greater than the remote interior angle. [Prop. I.16]"),
      step("replace", "Replacing the greater exterior angle with the smaller remote angle makes the sum less."),
      step("conclude", "Thus any two triangle angles are less than two right angles."),
    ],
  },
  {
    number: 18,
    title: "Greater Side, Greater Angle",
    originalStatement: "In any triangle, the greater side subtends the greater angle.",
    playerGoal: "Longer side means larger opposite angle.",
    type: "theorem",
    dependencies: deps(17, ["I.3", "I.5", "I.16"]),
    unlocks: ["unlock-I.18-greater-side-angle"],
    allowedTools: theoremOnly,
    instruction: "Replay the cut-off and exterior-angle comparison.",
    constructionGuide: [guide("cut", "Cut off the shorter side from the longer one.", "compass-transfer")],
    validationGoal: validationGoal("greaterSideImpliesGreaterOppositeAngle", "Infer the greater opposite angle from the greater side."),
    replaySteps: [
      step("given", "Let one side of a triangle be greater than another.", ["segmentAB", "segmentAC"]),
      step("cut", "Cut from the greater side a segment equal to the lesser. [Prop. I.3]"),
      step("isosceles", "The cut-off makes an isosceles triangle, so its base angles are equal. [Prop. I.5]"),
      step("exterior", "The exterior angle is greater than the opposite interior angle. [Prop. I.16]"),
      step("conclude", "Therefore the greater side subtends the greater angle."),
    ],
  },
  {
    number: 19,
    title: "Greater Angle, Greater Side",
    originalStatement: "In any triangle, the greater angle is subtended by the greater side.",
    playerGoal: "Larger angle means longer opposite side.",
    type: "theorem",
    dependencies: deps(18, ["I.5"]),
    unlocks: ["unlock-I.19-greater-angle-side"],
    allowedTools: theoremOnly,
    instruction: "Use contradiction: equal or lesser side would contradict earlier angle rules.",
    constructionGuide: [guide("compare", "Compare the two sides opposite the given angles.", "logic-replay")],
    validationGoal: validationGoal("greaterAngleImpliesGreaterOppositeSide", "Infer the greater opposite side from the greater angle."),
    replaySteps: [
      step("given", "Let one angle of a triangle be greater than another.", ["pointA", "pointB", "pointC"]),
      step("not-equal", "If the opposite sides were equal, I.5 would make the angles equal."),
      step("not-less", "If the opposite side were lesser, I.18 would make its angle lesser."),
      step("contradict", "Both alternatives contradict the given greater angle."),
      step("conclude", "Thus the greater angle is subtended by the greater side."),
    ],
  },
  {
    number: 20,
    title: "Triangle Inequality",
    originalStatement: "In any triangle, two sides taken together in any manner are greater than the remaining one.",
    playerGoal: "Any two sides of a triangle are longer together than the third side.",
    type: "theorem",
    dependencies: deps(19, ["I.3", "I.5"]),
    unlocks: ["unlock-I.20-triangle-inequality"],
    allowedTools: theoremOnly,
    instruction: "Replay the extension and side-angle comparison.",
    constructionGuide: [guide("extend", "Extend one side and set off another side on it.", "extend")],
    validationGoal: validationGoal("triangleInequality", "Infer the sum of any two triangle sides is greater than the remaining side."),
    replaySteps: [
      step("extend", "Extend a side and set off a segment equal to another side. [Prop. I.3]"),
      step("isosceles", "The auxiliary triangle is isosceles, so its base angles are equal. [Prop. I.5]"),
      step("greater-angle", "The exterior/whole angle is greater, so its opposite side is greater. [Prop. I.19]"),
      step("sum", "That opposite side is the sum of two sides of the original triangle."),
      step("conclude", "Therefore any two sides together exceed the remaining side."),
    ],
  },
  {
    number: 21,
    title: "Interior Broken Lines Rule",
    originalStatement: "If from the ends of one side of a triangle two straight-lines are constructed within the triangle, meeting inside, then the constructed straight-lines are less than the remaining two sides of the triangle, but contain a greater angle.",
    playerGoal: "A broken path inside a triangle is shorter than the two outer sides but makes a larger included angle.",
    type: "theorem",
    dependencies: deps(20, ["I.16"]),
    unlocks: ["unlock-I.21-interior-broken-lines"],
    allowedTools: theoremOnly,
    instruction: "Join an interior point to the base endpoints and replay the comparison.",
    constructionGuide: [guide("join", "Join the interior point to the base endpoints.", "straightedge")],
    validationGoal: validationGoal("interiorBrokenLinesTriangleRule", "Infer interior broken-line and angle comparisons."),
    replaySteps: [
      step("inside", "Let two lines from the base endpoints meet inside a triangle.", ["segmentAB", "segmentAC", "segmentBC"]),
      step("triangle-inequality", "Apply the triangle inequality to the smaller triangles. [Prop. I.20]"),
      step("sum", "Add the inequalities to compare the broken path with the outer sides."),
      step("angle", "Exterior angle reasoning makes the interior contained angle greater. [Prop. I.16]"),
      step("conclude", "The inner broken lines are shorter, but contain a greater angle."),
    ],
  },
  {
    number: 22,
    title: "Construct Triangle from Three Segments",
    originalStatement: "To construct a triangle from three straight-lines which are equal to three given straight-lines, when any two are greater than the remaining one.",
    playerGoal: "Build a triangle from three side lengths.",
    type: "construction",
    dependencies: deps(21, ["I.20"]),
    unlocks: ["unlock-I.22-triangle-from-three-segments"],
    allowedTools: [...primitives, "theorem-triangle-sss"],
    instruction: "Lay one segment as a base, draw two transferred-radius circles, and choose their intersection as the apex.",
    constructionGuide: [
      guide("base", "Lay down one given segment as the base.", "straightedge"),
      guide("circles", "Draw circles from the endpoints using the other two side lengths.", "compass-transfer"),
      guide("apex", "Select the circle intersection and join it to the base endpoints.", "intersection"),
    ],
    validationGoal: validationGoal("constructTriangleFromThreeSegments", "Confirm the final triangle side lengths match the three given segments."),
    replaySteps: [
      step("given", "Let the three given straight-lines satisfy: any two are greater than the remaining one."),
      step("base", "Place one length as the base. [Post. 1, Prop. I.2]"),
      step("circles", "From the endpoints, draw circles using the other two lengths. [Post. 3, Prop. I.2]"),
      step("meet", "The triangle inequality guarantees the circles can meet. [Prop. I.20]"),
      step("conclude", "Joining the intersection to the base endpoints constructs the required triangle."),
    ],
  },
  {
    number: 23,
    title: "Copy Angle",
    originalStatement: "To construct a rectilinear angle equal to a given rectilinear angle on a given straight-line and at a point on it.",
    playerGoal: "Copy an angle onto a chosen line at a chosen point.",
    type: "construction",
    dependencies: deps(22, ["I.8"]),
    unlocks: ["unlock-I.23-copy-angle"],
    allowedTools: [...primitives, "theorem-triangle-sss", "theorem-copy-angle"],
    instruction: "Represent the source angle with a triangle, then construct a matching triangle on the target line.",
    constructionGuide: [
      guide("source", "Choose points on the sides of the source angle.", "point"),
      guide("triangle", "Construct a congruent triangle on the target line. [Prop. I.22]", "theorem-triangle-sss"),
      guide("join", "Join the target vertex to the new point to complete the copied angle.", "straightedge"),
    ],
    validationGoal: validationGoal("copyAngleToLine", "Confirm the constructed angle equals the source angle at the target point."),
    replaySteps: [
      step("source", "Let the given angle be represented by a triangle around its vertex."),
      step("target", "Place one side of the angle on the target line at the target point."),
      step("triangle", "Construct a triangle with the same three side lengths. [Prop. I.22]"),
      step("sss", "SSS proves the included angle matches the original. [Prop. I.8]"),
      step("conclude", "Thus the rectilinear angle has been copied onto the given line."),
    ],
  },
  {
    number: 24,
    title: "SAS Inequality",
    originalStatement: "If two triangles have two sides equal to two sides respectively, but one has the angle contained by the equal straight-lines greater than the other, then it also has the base greater than the base.",
    playerGoal: "With two matching sides, the larger included angle gives the larger base.",
    type: "theorem",
    dependencies: deps(23, ["I.4", "I.19"]),
    unlocks: ["unlock-I.24-sas-inequality"],
    allowedTools: theoremOnly,
    instruction: "Replay the comparison of two triangles with matching sides.",
    constructionGuide: [guide("compare", "Compare two triangles sharing two equal side pairs.", "logic-replay")],
    validationGoal: validationGoal("SASInequality", "Infer greater base from greater included angle with two equal side pairs."),
    replaySteps: [
      step("given", "Let two triangles have two pairs of equal sides, but one included angle greater."),
      step("copy", "Copy the smaller included angle into the larger triangle. [Prop. I.23]"),
      step("sas", "SAS identifies the comparison base for the copied angle. [Prop. I.4]"),
      step("compare", "The remaining angle-side comparison uses I.19."),
      step("conclude", "Therefore the triangle with the greater included angle has the greater base."),
    ],
  },
  {
    number: 25,
    title: "Converse SAS Inequality",
    originalStatement: "If two triangles have two sides equal to two sides respectively, but one has the base greater than the base, then it also has the angle contained by the equal straight-lines greater than the angle.",
    playerGoal: "With two matching sides, the larger base means the larger included angle.",
    type: "theorem",
    dependencies: deps(24),
    unlocks: ["unlock-I.25-converse-sas-inequality"],
    allowedTools: theoremOnly,
    instruction: "Use contradiction against I.4 and I.24.",
    constructionGuide: [guide("compare", "Compare the two bases and included angles.", "logic-replay")],
    validationGoal: validationGoal("converseSASInequality", "Infer greater included angle from greater base with two equal side pairs."),
    replaySteps: [
      step("given", "Let two triangles have two equal side pairs, but one base greater."),
      step("not-equal", "If the included angles were equal, I.4 would make the bases equal."),
      step("not-less", "If the included angle were lesser, I.24 would make its base lesser."),
      step("contradict", "Both contradict the given greater base."),
      step("conclude", "Thus the greater base subtends the greater included angle."),
    ],
  },
  {
    number: 26,
    title: "ASA / AAS Triangle Match",
    originalStatement: "If two triangles have two angles equal to two angles respectively, and one side equal to one side, then the remaining sides and the remaining angle are equal.",
    playerGoal: "Two angles and one corresponding side determine a triangle.",
    type: "theorem",
    dependencies: deps(25, ["I.4", "I.16"]),
    unlocks: ["unlock-I.26-asa-aas"],
    allowedTools: theoremOnly,
    instruction: "Replay the angle-side matching argument.",
    constructionGuide: [guide("compare", "Compare two triangles with two equal angle pairs and one equal side.", "logic-replay")],
    validationGoal: validationGoal("ASA_AASCongruence", "Infer remaining triangle parts from two angles and one side."),
    replaySteps: [
      step("given", "Let two triangles have two angles equal and one corresponding side equal."),
      step("suppose", "Suppose a remaining corresponding side does not match."),
      step("cut", "Cut off the equal candidate side and join the auxiliary point. [Prop. I.3]"),
      step("contradict", "I.16 gives an exterior angle contradiction."),
      step("conclude", "Therefore the triangles match in the remaining sides and angle."),
    ],
  },
  {
    number: 27,
    title: "Alternate Angles to Parallel",
    originalStatement: "If a straight-line falling on two straight-lines makes the alternate angles equal to one another, then the straight-lines will be parallel to one another.",
    playerGoal: "Equal alternate interior angles prove lines are parallel.",
    type: "parallel-theorem",
    dependencies: deps(26, ["I.16"]),
    unlocks: ["unlock-I.27-alternate-angles-parallel"],
    allowedTools: theoremOnly,
    instruction: "Replay the contradiction if the lines were to meet.",
    constructionGuide: [guide("inspect", "Identify the alternate interior angles.", "logic-replay")],
    validationGoal: validationGoal("alternateInteriorAnglesImplyParallel", "Infer parallel lines from equal alternate interior angles."),
    replaySteps: [
      step("given", "Let a transversal make equal alternate angles with two straight-lines.", ["segmentAB", "segmentCD", "segmentEF"]),
      step("suppose", "Suppose the two straight-lines meet on one side."),
      step("triangle", "The meeting point forms a triangle with the transversal."),
      step("exterior", "One equal alternate angle becomes an exterior angle greater than the other. [Prop. I.16]"),
      step("conclude", "Contradiction; the straight-lines are parallel."),
    ],
  },
  {
    number: 28,
    title: "Angle Conditions to Parallel",
    originalStatement: "If a straight-line falling on two straight-lines makes the exterior angle equal to the interior and opposite angle, or the interior angles on the same side equal to two right angles, then the straight-lines will be parallel.",
    playerGoal: "More angle patterns can prove parallel lines.",
    type: "parallel-theorem",
    dependencies: deps(27, ["I.13", "I.15"]),
    unlocks: ["unlock-I.28-angle-conditions-parallel"],
    allowedTools: theoremOnly,
    instruction: "Convert the angle condition into alternate-angle equality.",
    constructionGuide: [guide("inspect", "Identify corresponding or same-side interior angle conditions.", "logic-replay")],
    validationGoal: validationGoal("angleConditionsImplyParallel", "Infer parallel lines from exterior/interior or same-side angle conditions."),
    replaySteps: [
      step("condition", "Let the transversal make either equal exterior/interior angles or same-side angles equal to two right angles."),
      step("vertical", "Use vertical angles when needed. [Prop. I.15]"),
      step("straight", "Use adjacent straight-line sums when needed. [Prop. I.13]"),
      step("alternate", "The condition reduces to equal alternate interior angles."),
      step("conclude", "Therefore the two straight-lines are parallel. [Prop. I.27]"),
    ],
  },
  {
    number: 29,
    title: "Parallel Angle Relations",
    originalStatement: "A straight-line falling on parallel straight-lines makes the alternate angles equal, the exterior angle equal to the interior and opposite angle, and the interior angles on the same side equal to two right angles.",
    playerGoal: "Parallel lines create predictable angle relationships.",
    type: "parallel-theorem",
    dependencies: deps(28),
    unlocks: ["unlock-I.29-parallel-angle-relations"],
    allowedTools: theoremOnly,
    instruction: "Replay the parallel angle relations from the transversal.",
    constructionGuide: [guide("inspect", "Inspect the transversal across parallel lines.", "logic-replay")],
    validationGoal: validationGoal("parallelLinesAngleRelations", "Infer angle equalities and supplements from parallel lines."),
    replaySteps: [
      step("parallel", "Let a transversal fall on parallel straight-lines."),
      step("alternate", "If alternate angles were unequal, a line through the point with the copied angle would be parallel. [Prop. I.23, I.27]"),
      step("unique", "That would force two distinct parallels through one point, impossible by the parallel postulate."),
      step("other-relations", "Vertical angles and straight-line sums give the exterior and same-side relations. [Prop. I.13, I.15]"),
      step("conclude", "Thus parallel lines determine these angle relations."),
    ],
  },
  {
    number: 30,
    title: "Parallel to the Same Line",
    originalStatement: "Straight-lines parallel to the same straight-line are also parallel to one another.",
    playerGoal: "If two lines are both parallel to a third, they are parallel to each other.",
    type: "parallel-theorem",
    dependencies: deps(29),
    unlocks: ["unlock-I.30-parallel-to-same-line"],
    allowedTools: theoremOnly,
    instruction: "Use a transversal to transfer parallel angle equality.",
    constructionGuide: [guide("transversal", "Draw or inspect a transversal through the lines.", "straightedge")],
    validationGoal: validationGoal("parallelToSameLine", "Infer two lines are parallel when both are parallel to a third."),
    replaySteps: [
      step("given", "Let two straight-lines each be parallel to the same straight-line."),
      step("transversal", "Let a transversal cut them."),
      step("first", "The first parallel pair gives one angle equality. [Prop. I.29]"),
      step("second", "The second parallel pair gives the same angle equality. [Prop. I.29]"),
      step("conclude", "Equal alternate angles imply the two lines are parallel. [Prop. I.27]"),
    ],
  },
  {
    number: 31,
    title: "Draw Parallel Through a Point",
    originalStatement: "To draw a straight-line through a given point parallel to a given straight-line.",
    playerGoal: "Construct a parallel line through a point.",
    type: "construction",
    dependencies: deps(30, ["I.23", "I.27"]),
    unlocks: ["unlock-I.31-draw-parallel"],
    allowedTools: [...primitives, "theorem-copy-angle", "theorem-parallel"],
    instruction: "Join the point to the line, copy the alternate angle at the point, then draw the parallel.",
    constructionGuide: [
      guide("join", "Join the given point to a point on the given line.", "straightedge"),
      guide("copy-angle", "Copy the alternate angle at the given point. [Prop. I.23]", "theorem-copy-angle"),
      guide("parallel", "Draw through the copied angle; alternate angles prove parallel. [Prop. I.27]", "straightedge"),
    ],
    validationGoal: validationGoal("drawParallelThroughPoint", "Confirm the constructed line passes through the point and is parallel to the given line."),
    replaySteps: [
      step("given", "Let A be the given point and BC the given straight-line.", ["pointA", "segmentBC"]),
      step("join", "Join A to a point on BC. [Post. 1]"),
      step("copy", "Construct at A an angle equal to the alternate angle. [Prop. I.23]"),
      step("parallel", "Equal alternate angles imply the new line is parallel to BC. [Prop. I.27]"),
      step("conclude", "A parallel through the given point has been drawn."),
    ],
  },
  {
    number: 32,
    title: "Triangle Angle Sum",
    originalStatement: "In any triangle, if one of the sides is produced, then the exterior angle is equal to the two interior and opposite angles, and the three interior angles are equal to two right angles.",
    playerGoal: "Exterior angle equals the two remote interior angles; triangle angles sum to two right angles.",
    type: "theorem",
    dependencies: deps(31, ["I.29", "I.13"]),
    unlocks: ["unlock-I.32-triangle-angle-sum"],
    allowedTools: theoremOnly,
    instruction: "Replay the classic parallel-through-a-vertex proof.",
    constructionGuide: [guide("parallel", "Draw a parallel through the opposite vertex. [Prop. I.31]", "theorem-parallel")],
    validationGoal: validationGoal("triangleAngleSumAndExterior", "Infer exterior angle equality and triangle angle sum."),
    replaySteps: [
      step("triangle", "Let one side of a triangle be produced.", ["segmentAB", "segmentBC", "segmentAC"]),
      step("parallel", "Draw through the opposite vertex a line parallel to the base. [Prop. I.31]"),
      step("angles", "Parallel angle relations identify the remote interior angles. [Prop. I.29]"),
      step("straight", "The three angles lie on a straight-line and equal two right angles. [Prop. I.13]"),
      step("conclude", "Thus the exterior angle equals the two opposite interior angles, and the triangle angles sum to two right angles."),
    ],
  },
  {
    number: 33,
    title: "Equal Parallel Connectors",
    originalStatement: "The straight-lines joining equal and parallel straight-lines in the same directions are themselves equal and parallel.",
    playerGoal: "Connecting endpoints of equal parallel segments creates another equal parallel pair.",
    type: "parallel-theorem",
    dependencies: deps(32, ["I.29", "I.4", "I.27"]),
    unlocks: ["unlock-I.33-equal-parallel-connectors"],
    allowedTools: theoremOnly,
    instruction: "Replay the diagonal and alternate-angle argument.",
    constructionGuide: [guide("join", "Join corresponding endpoints and a diagonal.", "straightedge")],
    validationGoal: validationGoal("equalParallelConnectors", "Infer connector equality and parallelism from equal parallel segments."),
    replaySteps: [
      step("given", "Let two equal straight-lines also be parallel and in the same directions."),
      step("join", "Join corresponding endpoints and draw a diagonal. [Post. 1]"),
      step("angles", "Parallel angle relations give equal alternate angles. [Prop. I.29]"),
      step("sas", "SAS matches the triangles. [Prop. I.4]"),
      step("conclude", "The joining straight-lines are equal and parallel."),
    ],
  },
  {
    number: 34,
    title: "Parallelogram Properties",
    originalStatement: "In parallelogrammic areas, the opposite sides and angles are equal to one another, and the diameter cuts the areas in half.",
    playerGoal: "A parallelogram has equal opposite sides and angles; its diagonal divides it into equal triangles.",
    type: "theorem",
    dependencies: deps(33, ["I.29", "I.26"]),
    unlocks: ["unlock-I.34-parallelogram-properties"],
    allowedTools: theoremOnly,
    instruction: "Draw the diagonal and replay the triangle matching proof.",
    constructionGuide: [guide("diagonal", "Draw the diagonal of the parallelogram.", "straightedge")],
    validationGoal: validationGoal("parallelogramOppositesAndDiagonal", "Infer opposite side/angle equality and diagonal bisection."),
    replaySteps: [
      step("parallelogram", "Let ABCD be a parallelogram.", ["segmentAB", "segmentBC", "segmentCD", "segmentDA"]),
      step("diagonal", "Draw diagonal AC. [Post. 1]", ["segmentAC"]),
      step("angles", "Parallel sides give equal alternate angles. [Prop. I.29]"),
      step("asa", "The two triangles match by ASA/AAS. [Prop. I.26]"),
      step("conclude", "Opposite sides and angles are equal, and the diagonal bisects the area."),
    ],
  },
  {
    number: 35,
    title: "Same Base Parallelograms Equal",
    originalStatement: "Parallelograms which are on the same base and between the same parallels are equal to one another.",
    playerGoal: "Same base plus same parallels means equal parallelogram areas.",
    type: "area-theorem",
    dependencies: deps(34),
    unlocks: ["unlock-I.35-same-base-parallelograms"],
    allowedTools: theoremOnly,
    instruction: "Replay equal/complementary parts in two parallelograms.",
    constructionGuide: [guide("compare", "Compare the parallelograms on the same base.", "logic-replay")],
    validationGoal: validationGoal("parallelogramsSameBaseSameParallelsEqual", "Infer equal areas for parallelograms on the same base and parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("same-base", "Let two parallelograms stand on the same base and between the same parallels."),
      step("opposites", "Use parallelogram opposite sides and angles. [Prop. I.34]"),
      step("parts", "Equal triangles or complements are added/subtracted."),
      step("common-notions", "Equals added to or subtracted from equals remain equal. [C.N. 2, 3]"),
      step("conclude", "The parallelograms are equal in area."),
    ],
  },
  {
    number: 36,
    title: "Equal Base Parallelograms Equal",
    originalStatement: "Parallelograms which are on equal bases and between the same parallels are equal to one another.",
    playerGoal: "Equal bases plus same parallels means equal parallelogram areas.",
    type: "area-theorem",
    dependencies: deps(35, ["I.34"]),
    unlocks: ["unlock-I.36-equal-base-parallelograms"],
    allowedTools: theoremOnly,
    instruction: "Replay the reduction to same-base parallelograms.",
    constructionGuide: [guide("join", "Join auxiliary endpoints to compare bases.", "straightedge")],
    validationGoal: validationGoal("parallelogramsEqualBasesSameParallelsEqual", "Infer equal areas for parallelograms on equal bases and same parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("equal-bases", "Let parallelograms stand on equal bases and between the same parallels."),
      step("connect", "Join auxiliary lines to make a common comparison parallelogram."),
      step("same-base", "Apply I.35 to same-base pieces."),
      step("transfer", "Transfer equality through the equal bases and parallels."),
      step("conclude", "The parallelograms are equal in area."),
    ],
  },
  {
    number: 37,
    title: "Same Base Triangles Equal",
    originalStatement: "Triangles which are on the same base and between the same parallels are equal to one another.",
    playerGoal: "Same base plus same parallels means equal triangle areas.",
    type: "area-theorem",
    dependencies: deps(36, ["I.31", "I.35"]),
    unlocks: ["unlock-I.37-same-base-triangles"],
    allowedTools: theoremOnly,
    instruction: "Complete each triangle into a parallelogram.",
    constructionGuide: [guide("complete", "Complete the triangles into parallelograms. [Prop. I.31]", "theorem-parallel")],
    validationGoal: validationGoal("trianglesSameBaseSameParallelsEqual", "Infer equal areas for triangles on same base and same parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("triangles", "Let two triangles stand on the same base and between the same parallels."),
      step("complete", "Complete each triangle into a parallelogram. [Prop. I.31]"),
      step("parallelograms", "The parallelograms are equal by I.35."),
      step("halves", "Each triangle is half of its parallelogram. [Prop. I.34]"),
      step("conclude", "Therefore the triangles are equal in area."),
    ],
  },
  {
    number: 38,
    title: "Equal Base Triangles Equal",
    originalStatement: "Triangles which are on equal bases and between the same parallels are equal to one another.",
    playerGoal: "Equal bases plus same parallels means equal triangle areas.",
    type: "area-theorem",
    dependencies: deps(37, ["I.36"]),
    unlocks: ["unlock-I.38-equal-base-triangles"],
    allowedTools: theoremOnly,
    instruction: "Complete to parallelograms and compare equal bases.",
    constructionGuide: [guide("complete", "Complete the triangles into parallelograms.", "theorem-parallel")],
    validationGoal: validationGoal("trianglesEqualBasesSameParallelsEqual", "Infer equal areas for triangles on equal bases and same parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("equal-bases", "Let triangles stand on equal bases and between the same parallels."),
      step("complete", "Complete them into parallelograms."),
      step("parallel-areas", "The parallelograms are equal by I.36."),
      step("halves", "The triangles are halves of equal parallelograms."),
      step("conclude", "Therefore the triangles are equal in area."),
    ],
  },
  {
    number: 39,
    title: "Equal Triangles Same Base to Same Parallels",
    originalStatement: "Equal triangles which are on the same base and on the same side are also between the same parallels.",
    playerGoal: "Equal triangles sharing a base on the same side have apexes on a line parallel to the base.",
    type: "area-theorem",
    dependencies: deps(38, ["I.37"]),
    unlocks: ["unlock-I.39-equal-triangles-same-base-parallels"],
    allowedTools: theoremOnly,
    instruction: "Replay the converse of the same-base triangle area rule.",
    constructionGuide: [guide("parallel", "Draw through one apex a parallel to the base.", "theorem-parallel")],
    validationGoal: validationGoal("equalTrianglesSameBaseImplySameParallels", "Infer same parallels from equal triangles on same base.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let equal triangles share a base and lie on the same side."),
      step("parallel", "Draw through one apex a line parallel to the base. [Prop. I.31]"),
      step("suppose", "If the other apex is not on it, a different triangle between the same parallels would equal it. [Prop. I.37]"),
      step("contradict", "That would make unequal same-base triangles equal in an impossible way."),
      step("conclude", "Thus the equal triangles are between the same parallels."),
    ],
  },
  {
    number: 40,
    title: "Equal Triangles Equal Bases to Same Parallels",
    originalStatement: "Equal triangles which are on equal bases and on the same side are also between the same parallels.",
    playerGoal: "Equal-area triangles on equal bases align between the same parallels.",
    type: "area-theorem",
    dependencies: deps(39, ["I.38"]),
    unlocks: ["unlock-I.40-equal-triangles-equal-bases-parallels"],
    allowedTools: theoremOnly,
    instruction: "Replay the equal-base version of the same parallels argument.",
    constructionGuide: [guide("parallel", "Draw a comparison parallel through an apex.", "theorem-parallel")],
    validationGoal: validationGoal("equalTrianglesEqualBasesImplySameParallels", "Infer same parallels from equal triangles on equal bases.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let equal triangles stand on equal bases and the same side."),
      step("parallel", "Draw a parallel through one apex."),
      step("i38", "Triangles on equal bases and the same parallels are equal. [Prop. I.38]"),
      step("force", "The equality forces the other apex onto the same parallel."),
      step("conclude", "Therefore the triangles are between the same parallels."),
    ],
  },
  {
    number: 41,
    title: "Parallelogram Double Triangle",
    originalStatement: "If a parallelogram has the same base as a triangle and is between the same parallels, then the parallelogram is double the triangle.",
    playerGoal: "A parallelogram is twice the triangle on the same base and between the same parallels.",
    type: "area-theorem",
    dependencies: deps(40, ["I.34", "I.37"]),
    unlocks: ["unlock-I.41-parallelogram-double-triangle"],
    allowedTools: theoremOnly,
    instruction: "Replay the diagonal-halves relation.",
    constructionGuide: [guide("diagonal", "Draw the diagonal of the parallelogram.", "straightedge")],
    validationGoal: validationGoal("parallelogramDoubleTriangle", "Infer a same-base parallelogram is double the triangle.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let a parallelogram and a triangle share a base and lie between the same parallels."),
      step("diagonal", "Draw the parallelogram diagonal."),
      step("half", "The diagonal cuts the parallelogram in half. [Prop. I.34]"),
      step("triangle", "The given triangle equals one half by I.37."),
      step("conclude", "Therefore the parallelogram is double the triangle."),
    ],
  },
  {
    number: 42,
    title: "Parallelogram Equal to Triangle",
    originalStatement: "To construct a parallelogram equal to a given triangle in a given rectilinear angle.",
    playerGoal: "Turn a triangle into an equal-area parallelogram with a chosen angle.",
    type: "construction",
    dependencies: deps(41, ["I.10", "I.23", "I.31"]),
    unlocks: ["unlock-I.42-parallelogram-equal-triangle"],
    allowedTools: [...primitives, "theorem-bisect-segment", "theorem-copy-angle", "theorem-parallel", "theorem-parallelogram-triangle"],
    instruction: "Bisect the triangle base, copy the given angle, draw parallels, and use I.41.",
    constructionGuide: [
      guide("bisect", "Bisect the base of the triangle. [Prop. I.10]", "theorem-bisect-segment"),
      guide("angle", "Construct the given angle at the midpoint. [Prop. I.23]", "theorem-copy-angle"),
      guide("parallel", "Draw parallels to complete the parallelogram. [Prop. I.31]", "theorem-parallel"),
    ],
    validationGoal: validationGoal("constructParallelogramEqualToTriangle", "Confirm the parallelogram has the given angle and equals the triangle in area.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let a triangle and a rectilinear angle be given."),
      step("bisect", "Bisect the triangle base. [Prop. I.10]"),
      step("angle", "Construct the given angle at the midpoint. [Prop. I.23]"),
      step("parallels", "Draw parallels to complete a parallelogram. [Prop. I.31]"),
      step("conclude", "By I.41, the parallelogram equals the given triangle."),
    ],
  },
  {
    number: 43,
    title: "Parallelogram Complements",
    originalStatement: "In any parallelogram, the complements of the parallelograms about the diameter are equal to one another.",
    playerGoal: "The two leftover parallelogram regions around a diagonal are equal.",
    type: "area-theorem",
    dependencies: deps(42, ["I.34"]),
    unlocks: ["unlock-I.43-parallelogram-complements"],
    allowedTools: theoremOnly,
    instruction: "Replay the diagonal and equal remainders argument.",
    constructionGuide: [guide("diagonal", "Inspect the diagonal and the smaller parallelograms about it.", "logic-replay")],
    validationGoal: validationGoal("parallelogramComplementsEqual", "Infer equal complements around a parallelogram diagonal.", ["internalAreaEquality"]),
    replaySteps: [
      step("whole", "The diagonal bisects the whole parallelogram. [Prop. I.34]"),
      step("inner", "The smaller parallelograms about the diagonal are likewise balanced."),
      step("subtract", "Subtract equal pieces from equal halves. [C.N. 3]"),
      step("complements", "The remaining complements are equal."),
      step("conclude", "This complement rule becomes an area engine for applying parallelograms."),
    ],
  },
  {
    number: 44,
    title: "Apply Equal Parallelogram to Line",
    originalStatement: "To apply to a given straight-line a parallelogram equal to a given triangle in a given rectilinear angle.",
    playerGoal: "Build a parallelogram on a given line, in a given angle, equal to a given triangle.",
    type: "construction",
    dependencies: deps(43, ["I.42", "I.31"]),
    unlocks: ["unlock-I.44-apply-parallelogram-line"],
    allowedTools: [...primitives, "theorem-parallelogram-triangle", "theorem-parallelogram-line"],
    instruction: "Use the I.42 parallelogram and I.43 complements to apply it to the given line.",
    constructionGuide: [
      guide("make", "Construct a parallelogram equal to the given triangle. [Prop. I.42]", "theorem-parallelogram-triangle"),
      guide("apply", "Carry the area to the given line using complements. [Prop. I.43]", "theorem-parallelogram-line"),
    ],
    validationGoal: validationGoal("applyParallelogramEqualToTriangleOnLine", "Confirm the applied parallelogram lies on the line, has the given angle, and equals the triangle.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let a line, a triangle, and an angle be given."),
      step("construct", "Construct an equal parallelogram in the given angle. [Prop. I.42]"),
      step("parallels", "Use parallels to position it on the given line. [Prop. I.31]"),
      step("complements", "Parallelogram complements preserve the area. [Prop. I.43]"),
      step("conclude", "A parallelogram equal to the triangle has been applied to the given line."),
    ],
  },
  {
    number: 45,
    title: "Parallelogram Equal to Rectilinear Figure",
    originalStatement: "To construct a parallelogram equal to a given rectilinear figure in a given rectilinear angle.",
    playerGoal: "Turn any rectilinear figure into an equal-area parallelogram with a chosen angle.",
    type: "construction",
    dependencies: deps(44, ["I.30", "I.34"]),
    unlocks: ["unlock-I.45-parallelogram-equal-figure"],
    allowedTools: [...primitives, "theorem-parallelogram-line", "theorem-parallelogram-figure"],
    instruction: "Decompose the figure into triangles, convert them into parallelograms, then combine them.",
    constructionGuide: [
      guide("decompose", "Decompose the rectilinear figure into triangles.", "straightedge"),
      guide("convert", "Apply an equal parallelogram for each triangle. [Prop. I.44]", "theorem-parallelogram-line"),
      guide("combine", "Combine the parallelograms using parallel-line rules.", "theorem-parallelogram-figure"),
    ],
    validationGoal: validationGoal("constructParallelogramEqualToRectilinearFigure", "Confirm the final parallelogram has the given angle and equals the figure.", ["internalAreaEquality"]),
    replaySteps: [
      step("figure", "Let a rectilinear figure and angle be given."),
      step("triangles", "Divide the figure into triangles."),
      step("apply", "Apply to a line parallelograms equal to each triangle. [Prop. I.44]"),
      step("combine", "Parallel rules combine them into one parallelogram. [Prop. I.30, I.34]"),
      step("conclude", "The final parallelogram equals the whole rectilinear figure."),
    ],
  },
  {
    number: 46,
    title: "Build Square",
    originalStatement: "To describe a square on a given straight-line.",
    playerGoal: "Build a square on a segment.",
    type: "construction",
    dependencies: deps(45, ["I.11", "I.31", "I.34"]),
    unlocks: ["unlock-I.46-build-square"],
    allowedTools: [...primitives, "theorem-perpendicular-on-line", "theorem-parallel", "theorem-square"],
    instruction: "Erect a perpendicular, transfer the side length, and draw parallels to close the square.",
    constructionGuide: [
      guide("perpendicular", "Erect a perpendicular at one endpoint. [Prop. I.11]", "theorem-perpendicular-on-line"),
      guide("length", "Set the compass width to the base and mark the adjacent side. [Prop. I.2]", "compass-transfer"),
      guide("parallel", "Draw parallels to close the square. [Prop. I.31]", "theorem-parallel"),
    ],
    validationGoal: validationGoal("constructSquareOnSegment", "Confirm four equal sides and right angles on the given side.", ["isSquare", "rightAngles"]),
    replaySteps: [
      step("given", "Let AB be the given straight-line.", ["segmentAB"]),
      step("perpendicular", "Draw a perpendicular at A. [Prop. I.11]"),
      step("equal-side", "Set off AD equal to AB. [Prop. I.2]"),
      step("parallels", "Draw parallels through B and D. [Prop. I.31]"),
      step("parallelogram", "Parallelogram properties make opposite sides equal and angles right. [Prop. I.34]"),
      step("conclude", "Thus a square has been described on AB."),
    ],
  },
  {
    number: 47,
    title: "Pythagorean Theorem",
    originalStatement: "In right-angled triangles, the square on the side subtending the right angle is equal to the squares on the sides containing the right angle.",
    playerGoal: "In a right triangle, the square on the hypotenuse equals the two leg-squares together.",
    type: "pythagorean-theorem",
    dependencies: deps(46, ["I.14", "I.31", "I.41"]),
    unlocks: ["unlock-I.47-pythagorean"],
    allowedTools: [...primitives, "theorem-square"],
    instruction: "Build the three squares and replay Euclid's area decomposition.",
    constructionGuide: [guide("squares", "Construct squares on all three sides. [Prop. I.46]", "theorem-square")],
    validationGoal: validationGoal("pythagoreanTheorem", "Infer the hypotenuse square equals the sum of the two leg squares.", ["internalAreaEquality"]),
    replaySteps: [
      step("right-triangle", "Let ABC be a right-angled triangle.", ["segmentAB", "segmentAC", "segmentBC"]),
      step("squares", "Construct squares on all three sides. [Prop. I.46]"),
      step("auxiliary", "Draw the auxiliary lines used by Euclid's diagram."),
      step("first-area", "One rectangle in the hypotenuse square equals one leg square. [Prop. I.41]"),
      step("second-area", "The other rectangle equals the other leg square. [Prop. I.41]"),
      step("add", "Add the equal areas. [C.N. 2]"),
      step("conclude", "The square on the hypotenuse equals the squares on the legs."),
    ],
  },
  {
    number: 48,
    title: "Converse Pythagorean Theorem",
    originalStatement: "If in a triangle the square on one side is equal to the squares on the remaining two sides, then the angle contained by the remaining two sides is right.",
    playerGoal: "If a triangle satisfies the Pythagorean relation, then it is right-angled.",
    type: "converse-theorem",
    dependencies: deps(47, ["I.8", "I.11"]),
    unlocks: ["unlock-I.48-converse-pythagorean"],
    allowedTools: [...primitives, "theorem-perpendicular-on-line", "compass-transfer"],
    instruction: "Replay the comparison with a constructed right triangle.",
    constructionGuide: [guide("right", "Construct a comparison right triangle with matching legs. [Prop. I.11, I.3]", "theorem-perpendicular-on-line")],
    validationGoal: validationGoal("conversePythagoreanTheorem", "Infer a right angle from the square-area relation.", ["internalAreaEquality", "rightAngle"]),
    replaySteps: [
      step("given", "Let the square on one side equal the squares on the other two sides."),
      step("construct-right", "Construct a right triangle with the two smaller sides. [Prop. I.11, I.3]"),
      step("pythagorean", "By I.47, its hypotenuse square equals the same sum."),
      step("equal-hypotenuse", "Thus the two hypotenuse squares, and therefore the sides, are equal."),
      step("sss", "SSS matches the original triangle to the right triangle. [Prop. I.8]"),
      step("conclude", "Therefore the original contained angle is right. Book I is complete."),
    ],
  },
];

export const book1Unlocks11To48: Unlock[] = [
  { id: "unlock-I.11-perpendicular-on-line", propositionId: "I.11", unlockType: "theorem-action", name: "Draw Perpendicular on Line", functionName: "drawPerpendicularFromPointOnLine", visibleToPlayer: true, dependsOn: ["I.11"], description: "Construct a perpendicular to a line from a point on it.", futureUses: ["I.12", "I.46", "I.47"], source: "Euclid I.11" },
  { id: "unlock-I.12-drop-perpendicular", propositionId: "I.12", unlockType: "theorem-action", name: "Drop Perpendicular", functionName: "dropPerpendicularFromPointToLine", visibleToPlayer: true, dependsOn: ["I.12"], description: "Construct a perpendicular from an external point to a line.", futureUses: ["I.46", "I.47"], source: "Euclid I.12" },
  { id: "unlock-I.13-straight-angle-sum", propositionId: "I.13", unlockType: "logic-rule", name: "Straight-Line Angle Sum", functionName: "adjacentAnglesOnStraightLineSumTwoRightAngles", visibleToPlayer: true, dependsOn: ["I.13"], description: "Adjacent angles on a straight-line equal two right angles.", futureUses: ["I.14", "I.17", "I.29", "I.32"], source: "Euclid I.13" },
  { id: "unlock-I.14-recognize-straight-line", propositionId: "I.14", unlockType: "logic-rule", name: "Recognize Straight Line", functionName: "anglesSumTwoRightAnglesImplyStraightLine", visibleToPlayer: true, dependsOn: ["I.14"], description: "Recognize when adjacent angles force two rays into one straight-line.", futureUses: ["I.15", "I.29", "I.47"], source: "Euclid I.14" },
  { id: "unlock-I.15-vertical-angles", propositionId: "I.15", unlockType: "logic-rule", name: "Vertical Angles Equal", functionName: "verticalAnglesEqual", visibleToPlayer: true, dependsOn: ["I.15"], description: "Opposite angles made by crossing lines are equal.", futureUses: ["I.16", "I.28"], source: "Euclid I.15" },
  { id: "unlock-I.16-exterior-angle-greater", propositionId: "I.16", unlockType: "logic-rule", name: "Exterior Angle Greater", functionName: "exteriorAngleGreaterThanOppositeInterior", visibleToPlayer: true, dependsOn: ["I.16"], description: "A triangle exterior angle is greater than either remote interior angle.", futureUses: ["I.17", "I.18", "I.27"], source: "Euclid I.16" },
  { id: "unlock-I.17-two-angle-limit", propositionId: "I.17", unlockType: "logic-rule", name: "Triangle Two-Angle Limit", functionName: "twoTriangleAnglesLessThanTwoRightAngles", visibleToPlayer: true, dependsOn: ["I.17"], description: "Any two triangle angles are less than two right angles.", futureUses: ["I.29", "I.32"], source: "Euclid I.17" },
  { id: "unlock-I.18-greater-side-angle", propositionId: "I.18", unlockType: "logic-rule", name: "Greater Side, Greater Angle", functionName: "greaterSideImpliesGreaterOppositeAngle", visibleToPlayer: true, dependsOn: ["I.18"], description: "The greater side of a triangle subtends the greater angle.", futureUses: ["I.19", "I.24"], source: "Euclid I.18" },
  { id: "unlock-I.19-greater-angle-side", propositionId: "I.19", unlockType: "logic-rule", name: "Greater Angle, Greater Side", functionName: "greaterAngleImpliesGreaterOppositeSide", visibleToPlayer: true, dependsOn: ["I.19"], description: "The greater angle of a triangle is subtended by the greater side.", futureUses: ["I.20", "I.21", "I.25"], source: "Euclid I.19" },
  { id: "unlock-I.20-triangle-inequality", propositionId: "I.20", unlockType: "logic-rule", name: "Triangle Inequality", functionName: "triangleInequality", visibleToPlayer: true, dependsOn: ["I.20"], description: "Two sides of a triangle together exceed the remaining side.", futureUses: ["I.22"], source: "Euclid I.20" },
  { id: "unlock-I.21-interior-broken-lines", propositionId: "I.21", unlockType: "logic-rule", name: "Interior Broken Lines Rule", functionName: "interiorBrokenLinesTriangleRule", visibleToPlayer: true, dependsOn: ["I.21"], description: "Interior broken lines in a triangle are shorter but contain a greater angle.", futureUses: ["I.22"], source: "Euclid I.21" },
  { id: "unlock-I.22-triangle-from-three-segments", propositionId: "I.22", unlockType: "theorem-action", name: "Build Triangle from 3 Sides", functionName: "constructTriangleFromThreeSegments", visibleToPlayer: true, dependsOn: ["I.22"], description: "Construct a triangle from three valid side lengths.", futureUses: ["I.23"], source: "Euclid I.22" },
  { id: "unlock-I.23-copy-angle", propositionId: "I.23", unlockType: "theorem-action", name: "Copy Angle", functionName: "copyAngleToLine", visibleToPlayer: true, dependsOn: ["I.23"], description: "Construct an angle equal to a given angle at a point on a line.", futureUses: ["I.24", "I.31"], source: "Euclid I.23" },
  { id: "unlock-I.24-sas-inequality", propositionId: "I.24", unlockType: "logic-rule", name: "SAS Inequality", functionName: "SASInequality", visibleToPlayer: true, dependsOn: ["I.24"], description: "With two equal side pairs, the greater included angle gives the greater base.", futureUses: ["I.25"], source: "Euclid I.24" },
  { id: "unlock-I.25-converse-sas-inequality", propositionId: "I.25", unlockType: "logic-rule", name: "Larger Base, Larger Included Angle", functionName: "converseSASInequality", visibleToPlayer: true, dependsOn: ["I.25"], description: "With two equal side pairs, the greater base gives the greater included angle.", futureUses: ["comparison reasoning"], source: "Euclid I.25" },
  { id: "unlock-I.26-asa-aas", propositionId: "I.26", unlockType: "logic-rule", name: "ASA / AAS Triangle Match", functionName: "ASA_AASCongruence", visibleToPlayer: true, dependsOn: ["I.26"], description: "Two angles and one corresponding side determine a triangle.", futureUses: ["I.34", "I.42", "I.46"], source: "Euclid I.26" },
  { id: "unlock-I.27-alternate-angles-parallel", propositionId: "I.27", unlockType: "parallel-rule", name: "Alternate Angles -> Parallel", functionName: "alternateInteriorAnglesImplyParallel", visibleToPlayer: true, dependsOn: ["I.27"], description: "Equal alternate interior angles prove lines parallel.", futureUses: ["I.28", "I.31"], source: "Euclid I.27" },
  { id: "unlock-I.28-angle-conditions-parallel", propositionId: "I.28", unlockType: "parallel-rule", name: "Angle Conditions -> Parallel", functionName: "angleConditionsImplyParallel", visibleToPlayer: true, dependsOn: ["I.28"], description: "Exterior/interior or same-side angle conditions prove parallel lines.", futureUses: ["I.29", "I.31"], source: "Euclid I.28" },
  { id: "unlock-I.29-parallel-angle-relations", propositionId: "I.29", unlockType: "parallel-rule", name: "Parallel Angle Relations", functionName: "parallelLinesAngleRelations", visibleToPlayer: true, dependsOn: ["I.29"], description: "Parallel lines imply alternate, exterior/interior, and same-side angle relations.", futureUses: ["I.30", "I.32", "I.33"], source: "Euclid I.29" },
  { id: "unlock-I.30-parallel-to-same-line", propositionId: "I.30", unlockType: "parallel-rule", name: "Parallel to Same Line", functionName: "parallelToSameLine", visibleToPlayer: true, dependsOn: ["I.30"], description: "Lines parallel to the same line are parallel to one another.", futureUses: ["I.31", "I.45"], source: "Euclid I.30" },
  { id: "unlock-I.31-draw-parallel", propositionId: "I.31", unlockType: "theorem-action", name: "Draw Parallel", functionName: "drawParallelThroughPoint", visibleToPlayer: true, dependsOn: ["I.31"], description: "Draw a parallel to a given line through a given point.", futureUses: ["I.33", "I.42", "I.46"], source: "Euclid I.31" },
  { id: "unlock-I.32-triangle-angle-sum", propositionId: "I.32", unlockType: "logic-rule", name: "Triangle Angle Sum", functionName: "triangleAngleSumAndExterior", visibleToPlayer: true, dependsOn: ["I.32"], description: "Triangle interior angles equal two right angles, and an exterior equals the two remote interiors.", futureUses: ["I.33", "later angle proofs"], source: "Euclid I.32" },
  { id: "unlock-I.33-equal-parallel-connectors", propositionId: "I.33", unlockType: "parallel-rule", name: "Equal Parallel Connectors", functionName: "equalParallelConnectors", visibleToPlayer: true, dependsOn: ["I.33"], description: "Connectors of equal parallel segments are equal and parallel.", futureUses: ["I.34"], source: "Euclid I.33" },
  { id: "unlock-I.34-parallelogram-properties", propositionId: "I.34", unlockType: "logic-rule", name: "Parallelogram Properties", functionName: "parallelogramOppositesAndDiagonal", visibleToPlayer: true, dependsOn: ["I.34"], description: "Opposite sides and angles of parallelograms are equal; the diagonal bisects the area.", futureUses: ["I.35", "I.46"], source: "Euclid I.34" },
  { id: "unlock-I.35-same-base-parallelograms", propositionId: "I.35", unlockType: "area-rule", name: "Same Base Parallelograms Equal", functionName: "parallelogramsSameBaseSameParallelsEqual", visibleToPlayer: true, dependsOn: ["I.35"], description: "Parallelograms on the same base and same parallels are equal in area.", futureUses: ["I.36", "I.41", "I.42"], source: "Euclid I.35" },
  { id: "unlock-I.36-equal-base-parallelograms", propositionId: "I.36", unlockType: "area-rule", name: "Equal Base Parallelograms Equal", functionName: "parallelogramsEqualBasesSameParallelsEqual", visibleToPlayer: true, dependsOn: ["I.36"], description: "Parallelograms on equal bases and same parallels are equal in area.", futureUses: ["I.38", "I.41"], source: "Euclid I.36" },
  { id: "unlock-I.37-same-base-triangles", propositionId: "I.37", unlockType: "area-rule", name: "Same Base Triangles Equal", functionName: "trianglesSameBaseSameParallelsEqual", visibleToPlayer: true, dependsOn: ["I.37"], description: "Triangles on the same base and same parallels are equal in area.", futureUses: ["I.39", "I.41", "I.42"], source: "Euclid I.37" },
  { id: "unlock-I.38-equal-base-triangles", propositionId: "I.38", unlockType: "area-rule", name: "Equal Base Triangles Equal", functionName: "trianglesEqualBasesSameParallelsEqual", visibleToPlayer: true, dependsOn: ["I.38"], description: "Triangles on equal bases and same parallels are equal in area.", futureUses: ["I.40", "I.41"], source: "Euclid I.38" },
  { id: "unlock-I.39-equal-triangles-same-base-parallels", propositionId: "I.39", unlockType: "area-rule", name: "Equal Triangles Same Base -> Same Parallels", functionName: "equalTrianglesSameBaseImplySameParallels", visibleToPlayer: true, dependsOn: ["I.39"], description: "Equal same-base triangles on the same side lie between the same parallels.", futureUses: ["I.40", "I.42"], source: "Euclid I.39" },
  { id: "unlock-I.40-equal-triangles-equal-bases-parallels", propositionId: "I.40", unlockType: "area-rule", name: "Equal Triangles Equal Bases -> Same Parallels", functionName: "equalTrianglesEqualBasesImplySameParallels", visibleToPlayer: true, dependsOn: ["I.40"], description: "Equal triangles on equal bases and the same side lie between the same parallels.", futureUses: ["I.42"], source: "Euclid I.40" },
  { id: "unlock-I.41-parallelogram-double-triangle", propositionId: "I.41", unlockType: "area-rule", name: "Parallelogram Double Triangle", functionName: "parallelogramDoubleTriangle", visibleToPlayer: true, dependsOn: ["I.41"], description: "A same-base parallelogram between the same parallels is double the triangle.", futureUses: ["I.42", "I.44", "I.47"], source: "Euclid I.41" },
  { id: "unlock-I.42-parallelogram-equal-triangle", propositionId: "I.42", unlockType: "theorem-action", name: "Parallelogram Equal to Triangle", functionName: "constructParallelogramEqualToTriangle", visibleToPlayer: true, dependsOn: ["I.42"], description: "Construct a parallelogram equal to a triangle in a chosen angle.", futureUses: ["I.44", "I.45", "I.47"], source: "Euclid I.42" },
  { id: "unlock-I.43-parallelogram-complements", propositionId: "I.43", unlockType: "area-rule", name: "Parallelogram Complements", functionName: "parallelogramComplementsEqual", visibleToPlayer: true, dependsOn: ["I.43"], description: "Complements around a parallelogram diagonal are equal.", futureUses: ["I.44", "I.45", "I.47"], source: "Euclid I.43" },
  { id: "unlock-I.44-apply-parallelogram-line", propositionId: "I.44", unlockType: "theorem-action", name: "Apply Equal Parallelogram to Line", functionName: "applyParallelogramEqualToTriangleOnLine", visibleToPlayer: true, dependsOn: ["I.44"], description: "Apply to a given line a parallelogram equal to a given triangle in a given angle.", futureUses: ["I.45"], source: "Euclid I.44" },
  { id: "unlock-I.45-parallelogram-equal-figure", propositionId: "I.45", unlockType: "theorem-action", name: "Parallelogram Equal to Figure", functionName: "constructParallelogramEqualToRectilinearFigure", visibleToPlayer: true, dependsOn: ["I.45"], description: "Construct a parallelogram equal to a rectilinear figure in a chosen angle.", futureUses: ["I.47", "Book II"], source: "Euclid I.45" },
  { id: "unlock-I.46-build-square", propositionId: "I.46", unlockType: "theorem-action", name: "Build Square", functionName: "constructSquareOnSegment", visibleToPlayer: true, dependsOn: ["I.46"], description: "Construct a square on a given segment.", futureUses: ["I.47", "I.48", "Book II"], source: "Euclid I.46" },
  { id: "unlock-I.47-pythagorean", propositionId: "I.47", unlockType: "logic-rule", name: "Pythagorean Theorem", functionName: "pythagoreanTheorem", visibleToPlayer: true, dependsOn: ["I.47"], description: "In a right triangle, the hypotenuse square equals the two leg squares together.", futureUses: ["I.48", "Book II"], source: "Euclid I.47" },
  { id: "unlock-I.48-converse-pythagorean", propositionId: "I.48", unlockType: "logic-rule", name: "Converse Pythagorean Theorem", functionName: "conversePythagoreanTheorem", visibleToPlayer: true, dependsOn: ["I.48"], description: "If the square on one side equals the squares on the other two, the contained angle is right.", futureUses: ["Book II", "metric geometry"], source: "Euclid I.48" },
];
