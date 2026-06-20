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

const primitives: GeometryTool[] = ["point", "straightedge", "compass", "compass-transfer", "intersection"];
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
      return constructionProfile("Construct a perpendicular through C on the given line AB.", ["CD", "D", "E", "F", "circleC", "perpendicular"], [], 4);
    case 12:
      return constructionProfile("Drop a perpendicular from C to the given line AB.", ["D", "E", "F", "CF", "circleC", "foot"], [], 4);
    case 13:
      return constructionProfile("Draw AB standing on CD, then raise EB perpendicular to CD on the same side as AB.", [], [
        requiredAction("prop13-perpendicular-eb", "construct-perpendicular", "Use the perpendicular tool to construct EB from B on CD."),
      ], 4);
    case 14:
      return constructionProfile("Construct CB and BD from B so the adjacent angles with AB make two right angles, then join CD.", [], [
        requiredAction("prop14-connect-cd", "draw-segment", "Join C to D after constructing CB and BD."),
      ], 5);
    case 15:
      return profile("select", "Select the target vertical angle pair CEA and BED.", [], [
        requiredAction("prop15-select-vertical-pair", "select-angle", "Select angle CEA and angle BED as vertical opposite angles."),
      ], "angle-equivalence");
    case 16:
      return constructionProfile(
        "Bisect AC, join BE, extend BE past E, copy BE onto the extension, join FC, then use SAS.",
        ["E", "F", "BE", "FC", "auxiliary-cut"],
        [],
        4,
      );
    case 17:
      return constructionProfile("Extend BC past C and place D so exterior angle ACD is formed.", ["D", "CD", "extension"], [], 0);
    case 18:
      return constructionProfile("Copy AB from A onto the greater side AC, then join B to the new point D.", ["D", "BD"], [], 0);
    case 20:
      return constructionProfile("Extend BA beyond A, copy AC onto that extension as AD, then join D to C.", ["D", "DC"], [], 0);
    case 21:
      return constructionProfile("Extend BD through the interior point until it meets AC at E.", ["E", "extension"], [], 0);
    case 22:
      return constructionProfile("Build a triangle from the three given straight-lines.", ["triangle", "apex", "construction-circles"], [], 7);
    case 23:
      return constructionProfile("Copy the given angle onto the target ray.", ["copied-ray", "target-triangle"], [], 3);
    case 24:
      return constructionProfile(
        "Copy the larger included angle at D, copy DF onto that ray, join EG and FG, then use SAS.",
        ["G", "EG", "FG", "copied-angle-ray"],
        [],
        0,
      );
    case 28:
      return profile("select", "Select AB and CD with EF as the transversal and identify the given angle condition.", [], [
        requiredAction("prop28-select-angle-condition", "construct-parallel", "Select AB and CD, EF, and one valid Prop. 28 angle condition."),
      ], "parallelism", 0);
    case 30:
      return constructionProfile("Draw one transversal cutting AB, EF, and CD.", ["G", "H", "K", "transversal"], [], 0);
    case 31:
      return constructionProfile("Choose D on BC, join AD, copy angle ADC at A, then extend the copied ray into the parallel.", ["D", "AD", "copied-angle", "parallel-through-A"], [], 0);
    case 32:
      return constructionProfile("Extend BC past C, then draw through C a line parallel to AB.", ["D", "CE", "auxiliary-parallel"], [], 0);
    case 33:
      return constructionProfile("Join B to C, then use SAS on triangles ABC and DCB.", ["BC", "connector-marks"], [], 0);
    case 34:
      return profile("trace", "Draw diagonal BC, then identify the ASA/AAS match between triangles ABC and DCB.", ["BC", "asa-aas-match"], [
        requiredAction("prop34-use-asa-aas", "match-congruent-parts", "Use ASA/AAS on triangles ABC and DCB with the diagonal as the corresponding side."),
      ], "angle-equivalence", 0);
    case 35:
      return constructionProfile("Mark G where EB meets DC, then use SAS on triangles EAB and FDC.", ["G", "area-equality"], [], 0);
    case 36:
      return constructionProfile("Join BE and CH, then use Prop. 33 to recognize EBCH as a parallelogram.", ["BE", "CH", "middle-parallelogram"], [], 0);
    case 37:
      return constructionProfile("Extend the upper parallel and draw BE parallel to CA and CF parallel to BD.", ["E", "F", "BE", "CF"], [], 0);
    case 38:
      return constructionProfile("Draw BG parallel to CA and FH parallel to DE to complete the two parallelograms.", ["G", "H", "BG", "FH"], [], 0);
    case 41:
      return constructionProfile("Draw diagonal AC in the parallelogram.", ["AC"], [], 0);
    case 42:
      return constructionProfile("Bisect BC, join AE, copy the given angle at E, then draw the two parallels to form FECG.", ["E", "F", "G", "target-parallelogram"], [], 0);
    case 44:
      return profile("transform", "Apply an equal-area parallelogram to the given line.", ["final-parallelogram", "complements", "parallels"], [
      ], "area-equivalence", 6);
    case 45:
      return profile("transform", "Turn the rectilinear figure into an equal-area parallelogram.", ["decomposition-lines", "final-parallelogram"], [
      ], "area-equivalence", 4);
    case 46:
      return constructionProfile("Construct a square on AB.", ["square", "perpendicular", "parallel-sides", "fourth-vertex"], [
      ], 3);
    case 47:
      return profile("transform", "Build the three squares on the right triangle and trace the area equivalence.", ["squares", "auxiliary-lines", "area-labels", "pythagorean-label"], [
      ], "area-equivalence", 8);
    case 48:
      return profile("derive", "Construct a comparison right triangle and identify the original right angle.", ["comparison-triangle", "right-angle-conclusion", "sss-highlights"], [
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
      requiredAction("prop43-select-complements", "select-area", "Select complements BK and KD as the target equal regions."),
    ], "area-equivalence", 0);
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
    unlocks: [],
    allowedTools: [...primitives, "theorem-equilateral", "theorem-bisect-segment", "theorem-sss"],
    instruction: "Use equal cut-offs around the point, build the triangle, and join the apex back to the point.",
    constructionGuide: [
      guide("cut-equals", "Cut equal lengths on both sides of the given point.", "compass-transfer"),
      guide("build-triangle", "Build an equilateral-style comparison triangle on the equal cut-offs.", "theorem-equilateral"),
      guide("join", "Join the apex to the given point to form the perpendicular.", "straightedge"),
    ],
    validationGoal: validationGoal("validatePerpendicularFromPointOnLine", "Confirm a constructed line passes through the point and is perpendicular to the given line."),
    replaySteps: [
      {
        id: "given",
        text: "Let AB be the given straight-line, and C the given point on it. It is required to draw a straight-line from C at right-angles to AB.",
        highlight: ["segmentAB", "pointC"],
      },
      {
        id: "cut",
        text: "Take D on AC, make CE equal to CD, construct equilateral triangle FDE on DE, and join FC. [Prop. I.3, Prop. I.1, Post. 1]",
        highlight: ["segmentCD", "segmentCE", "segmentDE", "segmentDF", "segmentEF", "segmentFC", "pointF"],
        highlightStyles: [
          { target: "segmentCD", color: "red" },
          { target: "segmentCE", color: "red" },
          { target: "segmentDF", color: "blue" },
          { target: "segmentEF", color: "blue" },
          { target: "segmentFC", color: "gold" },
        ],
      },
      {
        id: "sss",
        text: "Since DC = CE, CF is common, and DF = FE, angle DCF is equal to angle FCE. [Prop. I.8]",
        highlight: ["segmentCD", "segmentCE", "segmentDF", "segmentEF", "segmentFC"],
        highlightStyles: [
          { target: "segmentCD", color: "red" },
          { target: "segmentCE", color: "red" },
          { target: "segmentDF", color: "blue" },
          { target: "segmentEF", color: "blue" },
          { target: "segmentFC", color: "gold" },
        ],
        angleHighlights: [
          { points: ["D", "C", "F"], color: "green", amplifyVertex: true },
          { points: ["F", "C", "E"], color: "green", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "right",
        text: "The equal angles DCF and FCE are adjacent on the straight-line AB, so each is a right-angle. [Def. I.10]",
        highlight: ["segmentAB", "segmentFC", "pointC"],
        highlightStyles: [{ target: "segmentFC", color: "gold" }],
        angleHighlights: [
          { points: ["D", "C", "F"], color: "gold", rightAngle: true, amplifyVertex: true },
          { points: ["F", "C", "E"], color: "gold", rightAngle: true, amplifyVertex: true },
        ],
      },
      {
        id: "conclude",
        text: "Thus FC has been drawn at right-angles to the given straight-line AB from the given point C.",
        highlight: ["segmentAB", "segmentFC", "pointC"],
        highlightStyles: [{ target: "segmentFC", color: "gold" }],
        angleHighlights: [
          { points: ["D", "C", "F"], color: "gold", rightAngle: true },
          { points: ["F", "C", "E"], color: "gold", rightAngle: true },
        ],
      },
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
    allowedTools: [...primitives, "theorem-bisect-segment", "theorem-sss"],
    instruction: "Let a circle from the external point cut the line twice, bisect that chord, then join to the external point.",
    constructionGuide: [
      guide("circle", "Draw a circle from the external point cutting the line twice.", "compass"),
      guide("bisect", "Bisect the chord cut off on the line.", "theorem-bisect-segment"),
      guide("drop", "Join the external point to the midpoint.", "straightedge"),
    ],
    validationGoal: validationGoal("validateDroppedPerpendicular", "Confirm the segment from the external point meets the line at a right angle."),
    replaySteps: [
      {
        id: "given",
        text: "Let AB be the given infinite straight-line, and C the given point not on it.",
        highlight: ["segmentAB", "pointC"],
      },
      {
        id: "circle",
        text: "Take D on the other side of AB, draw the circle centered at C through D, let it cut AB at E and F, bisect EF at G, and join CG. [Post. 3, Prop. I.10, Post. 1]",
        highlight: ["circleC", "segmentEF", "segmentEG", "segmentGF", "segmentCE", "segmentCF", "segmentCG", "pointD", "pointE", "pointF", "pointG"],
        highlightStyles: [
          { target: "segmentEG", color: "red" },
          { target: "segmentGF", color: "red" },
          { target: "segmentCE", color: "blue" },
          { target: "segmentCF", color: "blue" },
          { target: "segmentCG", color: "gold" },
        ],
      },
      {
        id: "radii",
        text: "CE equals CF because both are radii of the circle centered at C.",
        highlight: ["circleC", "segmentCE", "segmentCF"],
        highlightStyles: [
          { target: "segmentCE", color: "blue" },
          { target: "segmentCF", color: "blue" },
        ],
      },
      {
        id: "midpoint",
        text: "EG equals GF because G bisects EF.",
        highlight: ["segmentEF", "segmentEG", "segmentGF", "pointG"],
        highlightStyles: [
          { target: "segmentEG", color: "red" },
          { target: "segmentGF", color: "red" },
        ],
      },
      {
        id: "common",
        text: "CG equals CG because it is common to both triangles.",
        highlight: ["segmentCG"],
        highlightStyles: [{ target: "segmentCG", color: "gold" }],
      },
      {
        id: "three-sides",
        text: "Therefore triangles CGE and CGF have three corresponding sides equal.",
        highlight: ["segmentEG", "segmentGF", "segmentCG", "segmentCE", "segmentCF"],
        highlightStyles: [
          { target: "segmentEG", color: "red" },
          { target: "segmentGF", color: "red" },
          { target: "segmentCE", color: "blue" },
          { target: "segmentCF", color: "blue" },
          { target: "segmentCG", color: "gold" },
        ],
      },
      {
        id: "sss",
        text: "By SSS, angle CGE equals angle CGF. [Prop. I.8]",
        highlight: ["segmentEG", "segmentGF", "segmentCG", "segmentCE", "segmentCF"],
        highlightStyles: [
          { target: "segmentEG", color: "red" },
          { target: "segmentGF", color: "red" },
          { target: "segmentCE", color: "blue" },
          { target: "segmentCF", color: "blue" },
          { target: "segmentCG", color: "gold" },
        ],
        angleHighlights: [
          { points: ["C", "G", "E"], color: "green", amplifyVertex: true },
          { points: ["C", "G", "F"], color: "green", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "adjacent",
        text: "Since E, G, and F lie on straight-line AB, angles CGE and CGF are adjacent angles on a straight line.",
        highlight: ["segmentAB", "segmentCG", "pointE", "pointG", "pointF"],
        highlightStyles: [{ target: "segmentCG", color: "gold" }],
        angleHighlights: [
          { points: ["C", "G", "E"], color: "green", amplifyVertex: true },
          { points: ["C", "G", "F"], color: "green", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "right",
        text: "Equal adjacent angles on a straight line are right angles.",
        highlight: ["segmentAB", "segmentCG", "pointG"],
        highlightStyles: [{ target: "segmentCG", color: "gold" }],
        angleHighlights: [
          { points: ["C", "G", "E"], color: "gold", rightAngle: true, amplifyVertex: true },
          { points: ["C", "G", "F"], color: "gold", rightAngle: true, amplifyVertex: true },
        ],
      },
      {
        id: "perpendicular",
        text: "Thus CG is perpendicular to AB.",
        highlight: ["segmentAB", "segmentCG", "pointC", "pointG"],
        highlightStyles: [{ target: "segmentCG", color: "gold" }],
        angleHighlights: [
          { points: ["C", "G", "E"], color: "gold", rightAngle: true },
          { points: ["C", "G", "F"], color: "gold", rightAngle: true },
        ],
      },
      {
        id: "conclude",
        text: "Therefore a perpendicular has been drawn from external point C to line AB.",
        highlight: ["segmentAB", "segmentCG", "pointC", "pointG"],
        highlightStyles: [{ target: "segmentCG", color: "gold" }],
        angleHighlights: [
          { points: ["C", "G", "E"], color: "gold", rightAngle: true },
          { points: ["C", "G", "F"], color: "gold", rightAngle: true },
        ],
      },
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
    allowedTools: [...primitives],
    instruction: "Inspect the adjacent angles; Logic Replay shows why they make two right angles.",
    constructionGuide: [guide("inspect", "Identify the two adjacent angles formed on the straight-line.", "logic-replay")],
    validationGoal: validationGoal("adjacentAnglesOnStraightLineSumTwoRightAngles", "Infer that adjacent angles on a straight-line sum to two right angles."),
    replaySteps: [
      {
        id: "stand",
        text: "Let AB stand on the straight-line CD at B, making the adjacent angles CBA and ABD.",
        highlight: ["segmentAB", "segmentCD", "pointB"],
        angleHighlights: [
          { points: ["C", "B", "A"], color: "blue", amplifyVertex: true },
          { points: ["A", "B", "D"], color: "rose", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "equal-case",
        text: "If CBA is equal to ABD, then the two adjacent equal angles are right-angles. [Def. I.10]",
        highlight: ["segmentAB", "segmentCD", "pointB"],
        angleHighlights: [
          { points: ["C", "B", "A"], color: "gold", rightAngle: true, amplifyVertex: true },
          { points: ["A", "B", "D"], color: "gold", rightAngle: true, amplifyVertex: true },
        ],
      },
      {
        id: "perpendicular-case",
        text: "If they are not equal, draw BE from B at right-angles to CD. Then CBE and EBD are two right-angles. [Prop. I.11]",
        highlight: ["segmentBE", "segmentCD", "pointB"],
        highlightStyles: [{ target: "segmentBE", color: "gold" }],
        angleHighlights: [
          { points: ["C", "B", "E"], color: "gold", rightAngle: true, amplifyVertex: true },
          { points: ["E", "B", "D"], color: "gold", rightAngle: true, amplifyVertex: true },
        ],
      },
      {
        id: "add-one",
        text: "CBE equals the two angles CBA and ABE; add EBD to both. [C.N. 2]",
        highlight: ["segmentAB", "segmentBE", "segmentCD"],
        angleHighlights: [
          { points: ["C", "B", "E"], color: "green", radius: 54, amplifyVertex: true },
          { points: ["C", "B", "A"], color: "blue", radius: 34 },
          { points: ["A", "B", "E"], color: "rose", radius: 42 },
          { points: ["E", "B", "D"], color: "violet", radius: 34 },
        ],
      },
      {
        id: "add-two",
        text: "Likewise DBA equals DBE and EBA; add ABC to both. The two sums equal the same three angles. [C.N. 1, C.N. 2]",
        highlight: ["segmentAB", "segmentBE", "segmentCD"],
        angleHighlights: [
          { points: ["D", "B", "A"], color: "green", radius: 54, amplifyVertex: true },
          { points: ["D", "B", "E"], color: "violet", radius: 34 },
          { points: ["E", "B", "A"], color: "rose", radius: 42 },
          { points: ["A", "B", "C"], color: "blue", radius: 34 },
        ],
      },
      {
        id: "conclude",
        text: "Since CBE and EBD are two right-angles, the original angles ABD and ABC are also equal to two right-angles.",
        highlight: ["segmentAB", "segmentCD", "pointB"],
        angleHighlights: [
          { points: ["C", "B", "A"], color: "blue", amplifyVertex: true },
          { points: ["A", "B", "D"], color: "blue", amplifyVertex: true, radius: 34 },
        ],
      },
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
      {
        id: "given",
        text: "Let BC and BD, not lying on the same side of AB, make adjacent angles ABC and ABD whose sum is equal to two right-angles.",
        highlight: ["segmentAB", "segmentCB", "segmentBD", "pointB"],
        angleHighlights: [
          { points: ["A", "B", "C"], color: "blue", amplifyVertex: true },
          { points: ["A", "B", "D"], color: "rose", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "suppose",
        text: "Suppose BD is not straight-on with respect to BC. Let the true continuation from CB be called BE.",
        highlight: ["segmentCB", "segmentBD", "segmentCD", "pointB"],
      },
      {
        id: "i13",
        text: "Since AB stands on the straight-line CBE, angles ABC and ABE are equal to two right-angles. [Prop. I.13]",
        highlight: ["segmentAB", "segmentCB", "segmentCD", "pointB"],
        angleHighlights: [
          { points: ["A", "B", "C"], color: "blue", amplifyVertex: true },
          { points: ["A", "B", "D"], color: "gold", radius: 44 },
        ],
      },
      {
        id: "subtract",
        text: "But ABC and ABD were also equal to two right-angles. Subtract the common angle CBA; then ABE would equal ABD, the lesser to the greater. [C.N. 1, C.N. 3]",
        highlight: ["segmentAB", "segmentCB", "segmentBD", "pointB"],
        angleHighlights: [
          { points: ["C", "B", "A"], color: "blue", radius: 34 },
          { points: ["A", "B", "D"], color: "rose", amplifyVertex: true },
        ],
      },
      {
        id: "conclude",
        text: "That is impossible. Thus no straight-line except BD can be straight-on with CB, so CB is straight-on with BD.",
        highlight: ["segmentCB", "segmentBD", "segmentCD", "pointB"],
        highlightStyles: [
          { target: "segmentCB", color: "green" },
          { target: "segmentBD", color: "green" },
          { target: "segmentCD", color: "green" },
        ],
      },
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
    allowedTools: theoremOnly,
    instruction: "Select the target vertical angle pair; the proof will use linear-pair sums and subtraction.",
    constructionGuide: [guide("inspect", "Select the vertical opposite angles CEA and BED.", "logic-replay")],
    validationGoal: validationGoal("verticalAnglesEqual", "Infer equality of vertically opposite angles."),
    replaySteps: [
      {
        id: "cross",
        text: "Let straight-lines AB and CD cut one another at E. The target vertical angles are CEA and BED.",
        highlight: ["segmentAB", "segmentCD", "pointE"],
        angleHighlights: [
          { points: ["C", "E", "A"], color: "blue", amplifyVertex: true },
          { points: ["B", "E", "D"], color: "blue", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "sum-one",
        text: "Since CE stands on straight-line AB, angles CEA and CEB equal two right angles. [Prop. I.13]",
        highlight: ["segmentAB", "segmentCD", "pointE"],
        angleHighlights: [
          { points: ["C", "E", "A"], color: "gold", amplifyVertex: true },
          { points: ["C", "E", "B"], color: "gold", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "sum-two",
        text: "Since BE stands on straight-line CD, angles CEB and BED equal two right angles. [Prop. I.13]",
        highlight: ["segmentAB", "segmentCD", "pointE"],
        angleHighlights: [
          { points: ["C", "E", "B"], color: "gold", amplifyVertex: true },
          { points: ["B", "E", "D"], color: "gold", amplifyVertex: true, radius: 34 },
        ],
      },
      step("subtract", "Subtract the common angle CEB from both equal sums. [C.N. 3]", ["segmentAB", "segmentCD", "pointE"]),
      {
        id: "conclude",
        text: "Therefore angle CEA equals angle BED, and similarly angle CEB equals angle DEA.",
        highlight: ["segmentAB", "segmentCD", "pointE"],
        angleHighlights: [
          { points: ["C", "E", "A"], color: "green", amplifyVertex: true },
          { points: ["B", "E", "D"], color: "green", amplifyVertex: true, radius: 34 },
        ],
      },
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
    allowedTools: [...primitives, "extend", "theorem-bisect-segment", "theorem-sas"],
    instruction: "Bisect AC, extend BE, copy BE onto the extension, join FC, and use SAS.",
    constructionGuide: [
      guide("midpoint", "Bisect AC to create E.", "theorem-bisect-segment"),
      guide("join", "Join B to E and extend BE past E.", "straightedge"),
      guide("copy", "Copy BE from E onto the extension, then join F to C.", "compass-transfer"),
      guide("sas", "Use SAS on triangles ABE and CFE.", "theorem-sas"),
    ],
    validationGoal: validationGoal("exteriorAngleGreaterThanOppositeInterior", "Infer that an exterior angle is greater than the two remote interior angles."),
    replaySteps: [
      {
        id: "triangle",
        text: "Let triangle ABC have side BC produced to D. It is required to prove exterior angle ACD greater than BAC and ABC.",
        highlight: ["segmentAB", "segmentBC", "segmentAC", "segmentCD"],
        angleHighlights: [{ points: ["A", "C", "D"], color: "gold", amplifyVertex: true }],
      },
      {
        id: "midpoint",
        text: "Bisect AC at E, join BE, extend BE to F, make EF equal to BE, and join FC. [Prop. I.10, Post. 1, Post. 2, Prop. I.3]",
        highlight: ["segmentAC", "segmentBE", "segmentEF", "segmentFC", "pointE", "pointF"],
        highlightStyles: [
          { target: "segmentBE", color: "blue" },
          { target: "segmentEF", color: "blue" },
          { target: "segmentFC", color: "gold" },
        ],
      },
      {
        id: "match",
        text: "AE = EC, BE = EF, and angles AEB and CEF are vertical angles. Thus triangles ABE and CFE match by SAS. [Prop. I.15, I.4]",
        highlight: ["segmentAC", "segmentBE", "segmentEF", "segmentFC"],
        highlightStyles: [
          { target: "segmentBE", color: "blue" },
          { target: "segmentEF", color: "blue" },
        ],
        angleHighlights: [
          { points: ["A", "E", "B"], color: "green", amplifyVertex: true },
          { points: ["C", "E", "F"], color: "green", amplifyVertex: true, radius: 34 },
        ],
      },
      {
        id: "whole",
        text: "SAS gives angle BAE equal to ECF. Since E lies on AC, BAE is BAC, and ECF is only part of exterior angle ACD.",
        highlight: ["segmentAB", "segmentAC", "segmentCD", "segmentFC"],
        angleHighlights: [
          { points: ["B", "A", "C"], color: "blue", amplifyVertex: true },
          { points: ["E", "C", "F"], color: "blue", radius: 34 },
          { points: ["A", "C", "D"], color: "gold", amplifyVertex: true, radius: 54 },
        ],
      },
      {
        id: "conclude",
        text: "Therefore exterior angle ACD is greater than BAC. The same construction proves it greater than ABC.",
        highlight: ["segmentAB", "segmentBC", "segmentAC", "segmentCD"],
        angleHighlights: [
          { points: ["A", "C", "D"], color: "gold", amplifyVertex: true },
          { points: ["B", "A", "C"], color: "blue", radius: 34 },
          { points: ["A", "B", "C"], color: "rose", radius: 42 },
        ],
      },
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
    allowedTools: [...primitives, "extend"],
    instruction: "Extend BC past C to form exterior angle ACD.",
    constructionGuide: [guide("extend", "Extend side BC past C and place D on the extension.", "extend")],
    validationGoal: validationGoal("twoTriangleAnglesLessThanTwoRightAngles", "Infer any two angles of a triangle are less than two right angles."),
    replaySteps: [
      step("extend", "BC is extended to D, forming exterior angle ACD.", ["segmentBC", "segmentCD", "pointD"]),
      step("exterior", "By Prop. I.16, exterior angle ACD is greater than opposite interior angle ABC.", ["segmentAC", "segmentBC", "segmentCD"]),
      step("add", "Add angle ACB to both sides: ACD + ACB is greater than ABC + ACB."),
      step("straight", "Since B, C, and D form a straight line, ACD + ACB equals two right angles. [Prop. I.13]", ["segmentBC", "segmentCD"]),
      step("pair", "Therefore angles ABC and ACB together are less than two right angles."),
      step("conclude", "The same extension argument works for the other two pairs, so any two triangle angles are less than two right angles."),
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
    allowedTools: [...primitives],
    instruction: "Copy AB onto AC from A, then join the cut-off point to B.",
    constructionGuide: [
      guide("copy", "Use Copy Length with source AB, start A, and target AC to place D.", "compass-transfer"),
      guide("join", "Join B to D.", "straightedge"),
    ],
    validationGoal: validationGoal("greaterSideImpliesGreaterOppositeAngle", "Infer the greater opposite angle from the greater side."),
    replaySteps: [
      step("given", "Let triangle ABC have AC greater than AB.", ["segmentAB", "segmentAC"]),
      step("cut", "Place D on AC so AD equals AB, and join BD. [Prop. I.3, Post. 1]", ["segmentAD", "segmentBD"]),
      step("exterior", "In triangle BCD, angle ADB is an exterior angle, so ADB is greater than DCB. [Prop. I.16]", ["segmentBD", "segmentBC", "segmentAC"]),
      step("isosceles", "Since AD equals AB, triangle ABD is isosceles; therefore ADB equals ABD. [Prop. I.5]", ["segmentAD", "segmentAB", "segmentBD"]),
      step("part", "Thus ABD is greater than DCB, and angle ABC is greater still because ABD is only part of ABC."),
      step("conclude", "Since D lies on AC, DCB is ACB. Therefore angle ABC is greater than angle ACB."),
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
    allowedTools: [...primitives, "extend"],
    instruction: "Extend BA beyond A, copy AC to the extension, then join the new point to C.",
    constructionGuide: [
      guide("extend", "Extend BA beyond A.", "extend"),
      guide("copy", "Copy AC from A onto the extension to create D.", "compass-transfer"),
      guide("join", "Join D to C.", "straightedge"),
    ],
    validationGoal: validationGoal("triangleInequality", "Infer the sum of any two triangle sides is greater than the remaining side."),
    replaySteps: [
      step("extend", "Extend BA beyond A to D, make AD equal to AC, and join DC. [Post. 2, Prop. I.3, Post. 1]", ["segmentAB", "segmentAD", "segmentDC"]),
      step("isosceles", "Triangle ADC is isosceles, so angle ADC equals angle ACD. [Prop. I.5]", ["segmentAD", "segmentAC", "segmentDC"]),
      step("whole-angle", "Angle BCD contains ACD, so BCD is greater than ACD, and therefore greater than ADC."),
      step("greater-side", "In triangle BCD, the greater angle BCD subtends the greater side DB. Thus DB is greater than BC. [Prop. I.19]", ["segmentBD", "segmentBC"]),
      step("sum", "Since D, A, and B are collinear, DB equals DA plus AB; and DA equals AC."),
      step("conclude", "Therefore AB plus AC is greater than BC. The same method proves the other two side sums."),
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
    allowedTools: [...primitives, "extend"],
    instruction: "Extend BD through the interior point D until it meets AC at E.",
    constructionGuide: [guide("extend", "Extend BD through D and mark the intersection with AC as E.", "extend")],
    validationGoal: validationGoal("interiorBrokenLinesTriangleRule", "Infer interior broken-line and angle comparisons."),
    replaySteps: [
      step("extend", "Extend BD to meet AC at E.", ["segmentBD", "segmentBE", "segmentAC", "pointE"]),
      step("outer-sum", "In triangle ABE, BA plus AE is greater than BE. Add EC to both sides. [Prop. I.20]"),
      step("outer-result", "Since AE plus EC is AC, BA plus AC is greater than BE plus EC."),
      step("inner-sum", "In triangle CDE, CE plus ED is greater than CD. Add DB to both sides. [Prop. I.20]"),
      step("inner-result", "Since DB plus DE is BE, BE plus CE is greater than BD plus DC."),
      step("length-conclude", "Therefore BA plus AC is greater than BD plus DC."),
      step("angle-one", "In triangle CDE, angle BDC is an exterior angle, so BDC is greater than CED. [Prop. I.16]"),
      step("angle-two", "In triangle ABE, angle CEB is an exterior angle, so CEB is greater than BAE. [Prop. I.16]"),
      step("conclude", "Since CED equals CEB and BAE is BAC, angle BDC is greater than BAC; the inner broken lines are shorter but enclose a greater angle."),
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
    allowedTools: [...primitives],
    instruction: "Lay the three lengths in order, draw the two radius circles, choose their intersection, and join the triangle.",
    constructionGuide: [
      guide("base", "Use Copy Length to lay the three given lengths in order on one ray.", "compass-transfer"),
      guide("circles", "Draw the two circles that determine the triangle apex.", "compass"),
      guide("apex", "Select the circle intersection and join it to the base endpoints.", "intersection"),
    ],
    validationGoal: validationGoal("constructTriangleFromThreeSegments", "Confirm the final triangle side lengths match the three given segments."),
    replaySteps: [
      step("given", "Let the three given straight-lines satisfy: any two are greater than the remaining one."),
      step("lay-out", "Lay the lengths in order on a ray: DF equals the first, FG equals the second, and GH equals the third. [Prop. I.2-I.3]"),
      step("circles", "Draw the circle centered at F through D, and the circle centered at G through H. [Post. 3]"),
      step("meet", "Let K be an intersection of the two circles; the triangle inequality guarantees the circles can meet. [Prop. I.20]"),
      step("join", "Join KF and KG. KF equals FD and KG equals GH because they are radii of their circles."),
      step("conclude", "Thus triangle KFG has its three sides equal to the three given straight-lines."),
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
    allowedTools: [...primitives, "theorem-triangle-sss", "theorem-sss"],
    instruction: "Represent the source angle with a triangle, then construct a matching triangle on the target line.",
    constructionGuide: [
      guide("source", "Choose points on the sides of the source angle.", "point"),
      guide("triangle", "Construct a congruent triangle on the target line. [Prop. I.22]", "theorem-triangle-sss"),
      guide("join", "Join the target vertex to the new point to complete the copied angle.", "straightedge"),
    ],
    validationGoal: validationGoal("copyAngleToLine", "Confirm the constructed angle equals the source angle at the target point."),
    replaySteps: [
      step("source", "Choose points D and E on the two sides of the given angle DCE, and join DE."),
      step("target", "On the target line at A, construct triangle AFG with sides matching CD, CE, and DE. [Prop. I.22]"),
      step("sss", "Since the three corresponding sides match, SSS proves angle FAG equals angle DCE. [Prop. I.8]"),
      step("conclude", "Thus the given rectilinear angle has been copied onto the given line at A."),
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
    allowedTools: [...primitives, "theorem-copy-angle", "theorem-sas"],
    instruction: "Copy the larger angle at D, copy DF onto the copied ray, join EG and FG, then use SAS.",
    constructionGuide: [
      guide("copy-angle", "Copy angle BAC at D on base DE.", "theorem-copy-angle"),
      guide("copy-length", "Copy DF from D onto the copied ray.", "compass-transfer"),
      guide("join", "Join E to the copied point and F to the copied point.", "straightedge"),
      guide("sas", "Use SAS on triangles ABC and DEG.", "theorem-sas"),
    ],
    validationGoal: validationGoal("SASInequality", "Infer greater base from greater included angle with two equal side pairs."),
    replaySteps: [
      step("given", "Let triangles ABC and DEF have AB = DE, AC = DF, and angle BAC greater than angle EDF.", ["segmentAB", "segmentDE", "segmentAC", "segmentDF"]),
      step("copy-angle", "Construct angle EDG equal to angle BAC. Since BAC is greater than EDF, F lies inside angle EDG. [Prop. I.23]", ["segmentDE", "segmentDG", "segmentDF"]),
      step("copy-length", "Make DG equal to DF, then join EG and FG. [Prop. I.3, Post. 1]", ["segmentDG", "segmentDF", "segmentEG", "segmentFG"]),
      step("sas", "AB = DE, AC = DG, and angle BAC = angle EDG, so SAS gives BC equal to EG. [Prop. I.4]", ["segmentAB", "segmentDE", "segmentAC", "segmentDG", "segmentBC", "segmentEG"]),
      step("isosceles", "Since DG = DF, triangle DFG is isosceles, so angle DGF equals angle DFG. [Prop. I.5]", ["segmentDG", "segmentDF", "segmentFG"]),
      step("greater", "Angle EFG is greater than angle EGF, so EG is greater than EF. [Prop. I.19]", ["segmentEG", "segmentEF"]),
      step("conclude", "Since BC = EG, BC is greater than EF. Thus the larger included angle gives the larger base.", ["segmentBC", "segmentEF"]),
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
      step("condition", "Let EF cut AB at G and CD at H, with either angle EGB equal to GHD or angles BGH and GHD equal to two right angles.", ["segmentAB", "segmentCD", "segmentEF"]),
      step("case-one", "If angle EGB equals angle GHD, vertical angles give angle EGB equal to angle AGH, so angle AGH equals angle GHD. [Prop. I.15]", ["segmentAB", "segmentCD", "segmentEF"]),
      step("case-two", "If angles BGH and GHD make two right angles, then angles AGH and BGH also make two right angles. Subtract angle BGH to get angle AGH equal to angle GHD. [Prop. I.13]", ["segmentAB", "segmentCD", "segmentEF"]),
      step("alternate", "In either case, the alternate interior angles AGH and GHD are equal.", ["segmentAB", "segmentCD", "segmentEF"]),
      step("conclude", "Therefore AB is parallel to CD. [Prop. I.27]", ["segmentAB", "segmentCD"]),
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
    allowedTools: [...primitives],
    instruction: "Use a transversal to transfer parallel angle equality.",
    constructionGuide: [guide("transversal", "Draw or inspect a transversal through the lines.", "straightedge")],
    validationGoal: validationGoal("parallelToSameLine", "Infer two lines are parallel when both are parallel to a third."),
    replaySteps: [
      step("given", "Let AB and CD each be parallel to EF.", ["segmentAB", "segmentEF", "segmentCD"]),
      step("transversal", "Draw transversal GK cutting AB at G, EF at H, and CD at K.", ["segmentGK", "pointG", "pointH", "pointK"]),
      step("first", "Because AB is parallel to EF, angle AGK equals angle GHF. [Prop. I.29]", ["segmentAB", "segmentEF", "segmentGK"]),
      step("second", "Because CD is parallel to EF, angle GHF equals angle GKD. [Prop. I.29]", ["segmentEF", "segmentCD", "segmentGK"]),
      step("alternate", "Therefore angle AGK equals angle GKD, alternate angles for AB and CD.", ["segmentAB", "segmentCD", "segmentGK"]),
      step("conclude", "By Prop. I.27, AB is parallel to CD.", ["segmentAB", "segmentCD"]),
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
    allowedTools: [...primitives, "extend", "theorem-copy-angle"],
    instruction: "Join the point to the line, copy the alternate angle at the point, then draw the parallel.",
    constructionGuide: [
      guide("join", "Join the given point to a point on the given line.", "straightedge"),
      guide("copy-angle", "Copy the alternate angle at the given point. [Prop. I.23]", "theorem-copy-angle"),
      guide("parallel", "Extend the copied ray into the straight line through A. [Post. 2]", "extend"),
    ],
    validationGoal: validationGoal("drawParallelThroughPoint", "Confirm the constructed line passes through the point and is parallel to the given line."),
    replaySteps: [
      step("given", "Let A be the given point and BC the given straight-line.", ["pointA", "segmentBC"]),
      step("choose", "Choose D on BC and join AD. [Post. 1]", ["segmentBC", "segmentAD"]),
      step("copy", "At A, construct angle DAE equal to angle ADC. [Prop. I.23]", ["segmentAD", "segmentAE"]),
      step("parallel", "Produce AE into the straight line AF. Since AD cuts AF and BC with equal alternate angles, AF is parallel to BC. [Prop. I.27]", ["segmentAF", "segmentBC"]),
      step("conclude", "A parallel to BC has been drawn through A.", ["segmentAF", "segmentBC"]),
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
    allowedTools: [...primitives, "extend", "theorem-parallel"],
    instruction: "Replay the classic parallel-through-a-vertex proof.",
    constructionGuide: [
      guide("extend", "Extend BC past C to form the exterior angle.", "extend"),
      guide("parallel", "Draw through C a line parallel to AB. [Prop. I.31]", "theorem-parallel"),
    ],
    validationGoal: validationGoal("triangleAngleSumAndExterior", "Infer exterior angle equality and triangle angle sum."),
    replaySteps: [
      step("triangle", "Let one side of a triangle be produced.", ["segmentAB", "segmentBC", "segmentAC"]),
      step("extend", "Produce BC to D, making exterior angle ACD.", ["segmentBC", "segmentCD"]),
      step("parallel", "Draw CE through C parallel to AB. [Prop. I.31]", ["segmentCE", "segmentAB"]),
      step("angles", "Since CE is parallel to AB, angle ACE equals angle CAB and angle ECD equals angle ABC. [Prop. I.29]", ["segmentCE", "segmentAB", "segmentAC", "segmentBD"]),
      step("exterior", "Thus angle ACD, made of ACE and ECD, equals the two opposite interior angles CAB and ABC.", ["segmentAC", "segmentCD", "segmentCE"]),
      step("sum", "Because B, C, and D lie on a straight line, angles ACB and ACD make two right angles. Substitute the two remote interior angles for ACD. [Prop. I.13]", ["segmentBC", "segmentCD", "segmentAC"]),
      step("conclude", "The exterior angle equals the two opposite interior angles, and the three interior angles equal two right angles."),
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
    allowedTools: [...primitives, "theorem-sas"],
    instruction: "Replay the diagonal and alternate-angle argument.",
    constructionGuide: [
      guide("join", "Join B to C.", "straightedge"),
      guide("sas", "Use SAS on triangles ABC and DCB.", "theorem-sas"),
    ],
    validationGoal: validationGoal("equalParallelConnectors", "Infer connector equality and parallelism from equal parallel segments."),
    replaySteps: [
      step("given", "Let AB and CD be equal and parallel, with AC and BD joining corresponding endpoints on the same side.", ["segmentAB", "segmentCD", "segmentAC", "segmentBD"]),
      step("join", "Join B to C. [Post. 1]", ["segmentBC"]),
      step("angles", "Because AB is parallel to CD, angle ABC equals angle BCD. [Prop. I.29]", ["segmentAB", "segmentCD", "segmentBC"]),
      step("sas", "AB equals CD, BC is common, and the included angles are equal, so triangles ABC and DCB match by SAS. [Prop. I.4]", ["segmentAB", "segmentCD", "segmentBC"]),
      step("parts", "Therefore AC equals BD and angle ACB equals angle DBC.", ["segmentAC", "segmentBD"]),
      step("parallel", "Those equal alternate angles make AC parallel to BD. [Prop. I.27]", ["segmentAC", "segmentBD"]),
      step("conclude", "Thus the joining straight-lines AC and BD are equal and parallel.", ["segmentAC", "segmentBD"]),
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
    allowedTools: [...primitives],
    instruction: "Draw the diagonal and replay the triangle matching proof.",
    constructionGuide: [
      guide("diagonal", "Draw diagonal BC.", "straightedge"),
      guide("asa-aas", "Identify the ASA/AAS match between triangles ABC and DCB.", "logic-replay"),
    ],
    validationGoal: validationGoal("parallelogramOppositesAndDiagonal", "Infer opposite side/angle equality and diagonal bisection."),
    replaySteps: [
      step("parallelogram", "Let ACDB be a parallelogram: AC is parallel to BD, and AB is parallel to CD.", ["segmentAC", "segmentBD", "segmentAB", "segmentCD"]),
      step("diagonal", "Join B to C. [Post. 1]", ["segmentBC"]),
      step("first-angles", "Since AC is parallel to BD and BC cuts them, angle ACB equals angle CBD. [Prop. I.29]", ["segmentAC", "segmentBD", "segmentBC"]),
      step("second-angles", "Since AB is parallel to CD and BC cuts them, angle ABC equals angle BCD. [Prop. I.29]", ["segmentAB", "segmentCD", "segmentBC"]),
      step("asa", "With BC common, the two triangles ABC and DCB match by ASA/AAS. [Prop. I.26]", ["segmentBC"]),
      step("opposites", "Therefore AB equals CD, AC equals BD, and angle BAC equals angle CDB.", ["segmentAB", "segmentCD", "segmentAC", "segmentBD"]),
      step("whole-angles", "Adding equal angle parts gives the remaining opposite angles equal: angle ABD equals angle ACD.", ["segmentAB", "segmentBD", "segmentAC", "segmentCD"]),
      step("area", "Using AB = CD, BC common, and the included angles equal, SAS also identifies the two triangles as equal in area. [Prop. I.4]", ["segmentAB", "segmentCD", "segmentBC"]),
      step("conclude", "Thus opposite sides and angles are equal, and diagonal BC bisects parallelogram ACDB.", ["segmentBC"]),
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
    allowedTools: [...primitives, "theorem-sas"],
    instruction: "Mark G where EB meets DC, then use SAS on triangles EAB and FDC.",
    constructionGuide: [
      guide("intersection", "Mark G where EB meets DC.", "intersection"),
      guide("sas", "Use SAS on triangles EAB and FDC.", "theorem-sas"),
    ],
    validationGoal: validationGoal("parallelogramsSameBaseSameParallelsEqual", "Infer equal areas for parallelograms on the same base and parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let parallelograms ABCD and EBCF stand on the same base BC and between the same parallels BC and AF.", ["segmentBC", "segmentAF"]),
      step("opposites", "Since ABCD is a parallelogram, AD = BC; since EBCF is a parallelogram, EF = BC. Therefore AD = EF. [Prop. I.34]", ["segmentAD", "segmentEF", "segmentBC"]),
      step("add", "Add DE to both equal straight-lines, giving AE = DF.", ["segmentAE", "segmentDF"]),
      step("sides", "Again by parallelogram properties, AB = DC. [Prop. I.34]", ["segmentAB", "segmentDC"]),
      step("angle", "Because AF is parallel to BC, angle EAB equals angle FDC.", ["segmentAF", "segmentAB", "segmentDC"]),
      step("sas", "Thus triangles EAB and FDC have two sides and the included angle equal, so they are equal by SAS. [Prop. I.4]", ["segmentAE", "segmentDF", "segmentAB", "segmentDC"]),
      step("subtract", "Subtract the common triangle DGE from both equal triangles.", ["segmentDG", "segmentEG"]),
      step("trapezia", "The remaining trapezium ABGD equals the remaining trapezium EGCF.", ["segmentAB", "segmentBG", "segmentGD", "segmentEG", "segmentGC", "segmentCF"]),
      step("add-common", "Add the common triangle GBC to both.", ["segmentGB", "segmentGC", "segmentBC"]),
      step("conclude", "Therefore parallelogram ABCD equals parallelogram EBCF in area.", ["segmentAB", "segmentBC", "segmentDC", "segmentAD", "segmentEB", "segmentFC", "segmentEF"]),
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
    allowedTools: [...primitives],
    instruction: "Join BE and CH, then recognize EBCH as a parallelogram by Prop. 33.",
    constructionGuide: [
      guide("join-be", "Draw BE.", "straightedge"),
      guide("join-ch", "Draw CH.", "straightedge"),
      guide("prop33", "Use Prop. 33 to recognize EBCH as a parallelogram.", "logic-replay"),
    ],
    validationGoal: validationGoal("parallelogramsEqualBasesSameParallelsEqual", "Infer equal areas for parallelograms on equal bases and same parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let parallelograms ABCD and EFGH stand on equal bases BC and FG between the same parallels AH and BG.", ["segmentBC", "segmentFG", "segmentAH", "segmentBG"]),
      step("opposites", "Since EFGH is a parallelogram, FG = EH. Since BC = FG, BC = EH. [Prop. I.34]", ["segmentBC", "segmentFG", "segmentEH"]),
      step("join", "Join BE and CH.", ["segmentBE", "segmentCH"]),
      step("prop33", "Because BC and EH are equal and parallel, Prop. I.33 makes BE and CH equal and parallel; EBCH is a parallelogram.", ["segmentBC", "segmentEH", "segmentBE", "segmentCH"]),
      step("same-base-one", "ABCD and EBCH are on the same base BC and between the same parallels, so ABCD = EBCH. [Prop. I.35]", ["segmentAB", "segmentBC", "segmentDC", "segmentAD", "segmentEB", "segmentCH", "segmentEH"]),
      step("same-base-two", "EFGH and EBCH are on the same base EH and between the same parallels, so EFGH = EBCH. [Prop. I.35]", ["segmentEF", "segmentFG", "segmentGH", "segmentEH", "segmentEB", "segmentBC", "segmentCH"]),
      step("conclude", "Therefore ABCD equals EFGH in area.", ["segmentAB", "segmentBC", "segmentDC", "segmentAD", "segmentEF", "segmentFG", "segmentGH", "segmentEH"]),
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
    allowedTools: [...primitives, "extend", "theorem-parallel"],
    instruction: "Draw parallels through B and C to complete parallelograms EBCA and DBCF.",
    constructionGuide: [
      guide("parallel-b", "Draw BE through B parallel to CA.", "theorem-parallel"),
      guide("parallel-c", "Draw CF through C parallel to BD.", "theorem-parallel"),
    ],
    validationGoal: validationGoal("trianglesSameBaseSameParallelsEqual", "Infer equal areas for triangles on same base and same parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Triangles ABC and DBC stand on the same base BC and between parallels AD and BC.", ["segmentAB", "segmentAC", "segmentDB", "segmentDC", "segmentBC", "segmentAD"]),
      step("complete", "Draw BE parallel to CA and CF parallel to BD. [Prop. I.31]", ["segmentBE", "segmentCF"]),
      step("parallelograms", "Thus EBCA and DBCF are parallelograms on the same base BC and between the same parallels BC and EF.", ["segmentBE", "segmentBC", "segmentCA", "segmentEA", "segmentDB", "segmentCF", "segmentDF"]),
      step("same-base", "By Prop. I.35, parallelogram EBCA equals parallelogram DBCF.", ["segmentBE", "segmentBC", "segmentCA", "segmentEA", "segmentDB", "segmentCF", "segmentDF"]),
      step("halves", "Diagonal AB bisects EBCA, and diagonal DC bisects DBCF. [Prop. I.34]", ["segmentAB", "segmentDC"]),
      step("conclude", "Halves of equal figures are equal, so triangle ABC equals triangle DBC.", ["segmentAB", "segmentAC", "segmentBC", "segmentDB", "segmentDC"]),
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
    allowedTools: [...primitives, "theorem-parallel"],
    instruction: "Complete to parallelograms and compare equal bases.",
    constructionGuide: [
      guide("parallel-b", "Draw BG through B parallel to CA.", "theorem-parallel"),
      guide("parallel-f", "Draw FH through F parallel to DE.", "theorem-parallel"),
    ],
    validationGoal: validationGoal("trianglesEqualBasesSameParallelsEqual", "Infer equal areas for triangles on equal bases and same parallels.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Triangles ABC and DEF stand on equal bases BC and EF between the same parallels BF and GH.", ["segmentBC", "segmentEF", "segmentBF", "segmentGH"]),
      step("complete", "Draw BG parallel to CA and FH parallel to DE, forming parallelograms GBCA and DEFH. [Prop. I.31]", ["segmentBG", "segmentFH"]),
      step("parallelograms", "The parallelograms GBCA and DEFH are on equal bases BC and EF and between the same parallels.", ["segmentGB", "segmentBC", "segmentCA", "segmentAG", "segmentDE", "segmentEF", "segmentFH", "segmentDH"]),
      step("equal", "By Prop. I.36, parallelogram GBCA equals parallelogram DEFH.", ["segmentGB", "segmentBC", "segmentCA", "segmentAG", "segmentDE", "segmentEF", "segmentFH", "segmentDH"]),
      step("halves", "Triangles ABC and DEF are halves of those parallelograms. [Prop. I.34]", ["segmentAB", "segmentDF"]),
      step("conclude", "Halves of equal figures are equal, so triangle ABC equals triangle DEF.", ["segmentAB", "segmentAC", "segmentBC", "segmentDE", "segmentDF", "segmentEF"]),
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
      step("diagonal", "Draw diagonal AC.", ["segmentAC"]),
      step("same-base", "Triangles ABC and EBC are on the same base BC and between the same parallels BC and AE.", ["segmentAB", "segmentAC", "segmentEB", "segmentEC", "segmentBC"]),
      step("equal-triangles", "By Prop. I.37, triangle ABC equals triangle EBC.", ["segmentAB", "segmentAC", "segmentBC", "segmentEB", "segmentEC"]),
      step("bisect", "Since ABCD is a parallelogram, diagonal AC bisects it. [Prop. I.34]", ["segmentAB", "segmentBC", "segmentCD", "segmentAD", "segmentAC"]),
      step("double", "Therefore parallelogram ABCD is double triangle ABC.", ["segmentAB", "segmentBC", "segmentCD", "segmentAD"]),
      step("conclude", "Since triangle ABC equals triangle EBC, parallelogram ABCD is double triangle EBC.", ["segmentEB", "segmentEC", "segmentBC"]),
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
    allowedTools: [...primitives, "theorem-bisect-segment", "theorem-copy-angle", "theorem-parallel"],
    instruction: "Bisect the triangle base, copy the given angle, draw parallels, and use I.41.",
    constructionGuide: [
      guide("bisect", "Bisect the base of the triangle. [Prop. I.10]", "theorem-bisect-segment"),
      guide("angle", "Construct the given angle at the midpoint. [Prop. I.23]", "theorem-copy-angle"),
      guide("parallel", "Draw parallels to complete the parallelogram. [Prop. I.31]", "theorem-parallel"),
    ],
    validationGoal: validationGoal("constructParallelogramEqualToTriangle", "Confirm the parallelogram has the given angle and equals the triangle in area.", ["internalAreaEquality"]),
    replaySteps: [
      step("given", "Let triangle ABC and rectilinear angle D be given.", ["segmentAB", "segmentAC", "segmentBC", "segmentDH", "segmentDK"]),
      step("bisect", "Bisect BC at E and join AE. [Prop. I.10, Post. 1]", ["segmentBE", "segmentEC", "segmentAE"]),
      step("angle", "At E on ray EC, construct angle CEF equal to angle D. [Prop. I.23]", ["segmentEC", "segmentEF"]),
      step("parallels", "Draw AG parallel to EC and CG parallel to EF, forming parallelogram FECG. [Prop. I.31]", ["segmentAG", "segmentCG", "segmentFG", "segmentEC", "segmentEF"]),
      step("half-triangle", "Since BE equals EC, triangles ABE and AEC are equal; therefore triangle ABC is double triangle AEC. [Prop. I.38]", ["segmentAB", "segmentAE", "segmentBE", "segmentAC", "segmentEC"]),
      step("double", "Parallelogram FECG is on the same base EC as triangle AEC and between the same parallels, so it is double triangle AEC. [Prop. I.41]", ["segmentFE", "segmentEC", "segmentCG", "segmentFG", "segmentAE", "segmentAC"]),
      step("conclude", "Therefore FECG equals triangle ABC, and angle CEF equals the given angle D.", ["segmentFE", "segmentEC", "segmentCG", "segmentFG"]),
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
      step("whole", "Since ABCD is a parallelogram, diagonal AC bisects it; therefore triangle ABC equals triangle ACD. [Prop. I.34]", ["segmentAB", "segmentBC", "segmentCD", "segmentDA", "segmentAC"]),
      step("first-inner", "Since AEKH is a parallelogram, diagonal AK bisects it; therefore triangle AEK equals triangle AHK. [Prop. I.34]", ["segmentAE", "segmentEK", "segmentKH", "segmentHA"]),
      step("second-inner", "Since KFCG is a parallelogram, diagonal KC bisects it; therefore triangle KFC equals triangle KGC. [Prop. I.34]", ["segmentKF", "segmentFC", "segmentCG", "segmentGK"]),
      step("add-small", "Add equal small triangles: AEK plus KGC equals AHK plus KFC. [C.N. 2]"),
      step("subtract", "Subtract those equal small-triangle sums from the equal large triangles ABC and ACD. [C.N. 3]"),
      step("complements", "The remaining complement BK equals the remaining complement KD."),
      step("conclude", "Thus the complements of the parallelograms about the diagonal are equal."),
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
    allowedTools: [...primitives, "theorem-parallelogram-triangle", "theorem-parallel", "theorem-parallelogram-line"],
    instruction: "Use the I.42 parallelogram and I.43 complements to apply it to the given line.",
    constructionGuide: [
      guide("make", "Construct a parallelogram equal to the given triangle. [Prop. I.42]", "theorem-parallelogram-triangle"),
      guide("apply", "Carry the area to the given line using complements. [Prop. I.43]", "theorem-parallelogram-line"),
    ],
    validationGoal: validationGoal("applyParallelogramEqualToTriangleOnLine", "Confirm the applied parallelogram lies on the line, has the given angle, and equals the triangle.", ["internalAreaEquality"]),
    replaySteps: [
      step("helper", "Construct auxiliary parallelogram GBEF equal to the given triangle, with angle GBE equal to the given angle. [Prop. I.42]"),
      step("parallels", "Draw AH parallel to BG and FH parallel to BE, meeting at H; join HB and construct parallelogram HLKF about diagonal HK. [Prop. I.31]"),
      step("extend", "Extend HA to L and GB to M; the final applied parallelogram is LABM on AB."),
      step("complements", "Parallelograms AG and ME lie about diagonal HK, so the complements LABM and GBEF are equal. [Prop. I.43]"),
      step("area", "Since GBEF equals the given triangle, LABM also equals the given triangle."),
      step("angle", "Because E, B, A are collinear and G, B, M are collinear, angle ABM equals angle GBE by vertical angles. [Prop. I.15]"),
      step("conclude", "Therefore LABM is applied to AB, equals the given triangle, and has the required angle."),
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
      step("diagonal", "Draw DB, splitting rectilinear figure ABCD into triangles ABD and DBC."),
      step("first", "Construct parallelogram FKHG equal to triangle ABD in the given angle E. [Prop. I.42]"),
      step("second", "Apply parallelogram GMLH to side GH, equal to triangle DBC and in the same angle E. [Prop. I.44]"),
      step("straight", "Angle equalities with the common angle KHG force K, H, and M into one straight line. [Prop. I.14]"),
      step("other-straight", "Parallel angle relations likewise force F, G, and L into one straight line. [Prop. I.14, I.29]"),
      step("parallelogram", "The outside connectors are equal and parallel, so KFLM is one parallelogram. [Prop. I.33]"),
      step("area", "Since its two parts equal triangles ABD and DBC, the whole parallelogram KFLM equals rectilinear figure ABCD."),
      step("conclude", "And since angle FKM equals the given angle E, the required parallelogram has been constructed."),
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
    allowedTools: [...primitives, "theorem-drop-perpendicular", "theorem-parallel"],
    instruction: "Erect a perpendicular, transfer the side length, and draw parallels to close the square.",
    constructionGuide: [
      guide("perpendicular", "Use the Perpendicular Tool at one endpoint.", "theorem-drop-perpendicular"),
      guide("length", "Copy the base length onto the adjacent side. [Prop. I.2]", "compass-transfer"),
      guide("parallel", "Draw parallels to close the square. [Prop. I.31]", "theorem-parallel"),
    ],
    validationGoal: validationGoal("constructSquareOnSegment", "Confirm four equal sides and right angles on the given side.", ["isSquare", "rightAngles"]),
    replaySteps: [
      step("given", "Let AB be the given straight-line.", ["segmentAB"]),
      step("perpendicular", "Draw AC perpendicular to AB at A. [Prop. I.11]", ["segmentAB", "pointA"]),
      step("equal-side", "Copy AB onto ray AC to place D, so AD equals AB. [Prop. I.2-I.3]"),
      step("parallels", "Draw DE parallel to AB and BE parallel to AD; let them meet at E. [Prop. I.31]"),
      step("parallelogram", "ADEB is a parallelogram, so opposite sides are equal. [Prop. I.34]"),
      step("right", "The angle at A is right, and the parallel angle sums make the remaining angles right."),
      step("conclude", "All four sides are equal and all angles are right; therefore ADEB is a square on AB."),
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
    allowedTools: [...primitives, "theorem-square", "theorem-parallel", "theorem-sas"],
    instruction: "Build the three squares and replay Euclid's area decomposition.",
    constructionGuide: [guide("squares", "Construct squares on all three sides. [Prop. I.46]", "theorem-square")],
    validationGoal: validationGoal("pythagoreanTheorem", "Infer the hypotenuse square equals the sum of the two leg squares.", ["internalAreaEquality"]),
    replaySteps: [
      step("squares", "Construct square BDEC on hypotenuse BC, square GBHF on leg BA, and square ACKH on leg AC. [Prop. I.46]"),
      step("auxiliary", "Draw AL parallel to BD and CE, then draw AD, FC, AE, and BK."),
      step("first-sas", "FB equals BA, BC equals BD, and angle FBC equals ABD; therefore triangles FBC and ABD match by SAS. [Prop. I.4]"),
      step("first-area", "The square on BA is double triangle FBC, and parallelogram BL is double triangle ABD; doubles of equal triangles are equal."),
      step("second-sas", "Similarly, triangles ACE and BCK match by SAS."),
      step("second-area", "Therefore the square on AC equals parallelogram CL."),
      step("add", "Parallelograms BL and CL together make the whole square BDEC on BC."),
      step("conclude", "Thus the square on BC equals the squares on BA and AC."),
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
    allowedTools: [...primitives, "theorem-drop-perpendicular", "compass-transfer", "theorem-sss"],
    instruction: "Replay the comparison with a constructed right triangle.",
    constructionGuide: [guide("right", "Construct a comparison right triangle with matching legs.", "theorem-drop-perpendicular")],
    validationGoal: validationGoal("conversePythagoreanTheorem", "Infer a right angle from the square-area relation.", ["internalAreaEquality", "rightAngle"]),
    replaySteps: [
      step("construct-right", "Construct AD perpendicular to AC at A, copy BA onto AD, and join DC. [Prop. I.11, I.3, Post. 1]"),
      step("right", "Angle DAC is a right angle, and AD equals BA by construction."),
      step("pythagorean", "Since triangle DAC is right-angled, square DC equals square DA plus square AC. [Prop. I.47]"),
      step("given-sum", "But square BC is given equal to square BA plus square AC, and square DA equals square BA."),
      step("equal-hypotenuse", "Therefore square DC equals square BC, so DC equals BC."),
      step("sss", "With AD equal BA, AC common, and DC equal BC, triangles DAC and BAC match by SSS. [Prop. I.8]"),
      step("conclude", "Thus angle DAC equals angle BAC; since DAC is right, BAC is right too."),
    ],
  },
];

export const book1Unlocks11To48: Unlock[] = [
  { id: "unlock-I.11-perpendicular-on-line", propositionId: "I.11", unlockType: "theorem-action", name: "Perpendicular from Point on Line", functionName: "drawPerpendicularFromPointOnLine", visibleToPlayer: false, dependsOn: ["I.11"], description: "Prop. I.11 is a completed level, not a separate player-facing tool.", futureUses: [], source: "Euclid I.11" },
  { id: "unlock-I.12-drop-perpendicular", propositionId: "I.12", unlockType: "theorem-action", name: "Perpendicular Tool", functionName: "dropPerpendicularFromPointToLine", visibleToPlayer: true, dependsOn: ["I.12"], description: "Construct a perpendicular from a point to a line.", futureUses: ["I.46", "I.47"], source: "Euclid I.12" },
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
