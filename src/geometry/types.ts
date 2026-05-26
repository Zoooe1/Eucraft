export type GeometryTool =
  | "point"
  | "straightedge"
  | "extend"
  | "compass"
  | "compass-transfer"
  | "intersection"
  | "theorem-equilateral"
  | "theorem-bisect-angle"
  | "theorem-bisect-segment"
  | "theorem-perpendicular-on-line"
  | "theorem-drop-perpendicular"
  | "theorem-triangle-sss"
  | "theorem-copy-angle"
  | "theorem-parallel"
  | "theorem-parallelogram-triangle"
  | "theorem-parallelogram-line"
  | "theorem-parallelogram-figure"
  | "theorem-square";

export type AppPhase =
  | "title"
  | "map"
  | "laws"
  | "intro"
  | "construction"
  | "success"
  | "logicReplay"
  | "completionAnimation"
  | "completed";

export type Point = {
  id: string;
  type: "point";
  x: number;
  y: number;
  label?: string;
  fixed?: boolean;
  color?: string;
  auxiliary?: boolean;
  source?: string;
  createdBy?: "free" | "given" | "intersection" | "snap" | "theorem-action";
  parentObjectIds?: string[];
};

export type Segment = {
  id: string;
  type: "segment";
  p1: string;
  p2: string;
  label?: string;
  color?: string;
  given?: boolean;
  source?: string;
  createdBy?: string;
};

export type Circle = {
  id: string;
  type: "circle";
  center: string;
  through?: string;
  radiusSegment?: {
    p1: string;
    p2: string;
  };
  radiusValue?: number;
  label?: string;
  color?: string;
  source?: string;
  createdBy?: "Post.3" | "I.2" | "free-compass-transfer" | string;
  sourceDescription?: string;
};

export type ExtendedLine = {
  id: string;
  type: "extended-line";
  from: string;
  through: string;
  baseSegment: string;
  label?: string;
  color?: string;
  source?: string;
  createdBy?: string;
};

export type GeometryObject = Point | Segment | Circle | ExtendedLine;

export type GeometryObjects = GeometryObject[];

export type ProofHighlight = string;

export type ReplayStep = {
  id: string;
  text: string;
  highlight: ProofHighlight[];
  futureTokens?: string[];
  highlightRoles?: ProofHighlight[];
  ruleRefs?: string[];
  dependencyRefs?: string[];
  durationMs?: number;
};

export type PropositionLawSection = {
  title: string;
  items: string[];
};

export type PropositionType =
  | "construction"
  | "theorem"
  | "parallel-theorem"
  | "area-theorem"
  | "pythagorean-theorem"
  | "converse-theorem";

export type ChallengeType =
  | "construct"
  | "select"
  | "compare"
  | "arrange"
  | "transform"
  | "trace"
  | "classify"
  | "derive";

export type RequiredActionType =
  | "create-point"
  | "draw-segment"
  | "extend-line"
  | "draw-circle"
  | "set-compass-width"
  | "select-intersection"
  | "construct-perpendicular"
  | "construct-parallel"
  | "construct-square"
  | "construct-parallelogram"
  | "select-angle"
  | "select-side"
  | "select-triangle"
  | "select-area"
  | "compare-objects"
  | "trace-auxiliary-line"
  | "match-congruent-parts"
  | "decompose-area"
  | "recompose-area";

export type RequiredAction = {
  id: string;
  actionType: RequiredActionType;
  description: string;
  optional?: boolean;
};

export type ConstructionStep = {
  id: string;
  text: string;
  tool?: GeometryTool | "theorem-action" | "logic-replay";
  refs?: string[];
};

export type SegmentRef = string;
export type AngleRef = string;
export type LineRef = string;
export type PointRef = string;
export type FigureRef = string;

export type GeometricRelation =
  | { type: "equal-length"; a: SegmentRef; b: SegmentRef }
  | { type: "greater-length"; a: SegmentRef; b: SegmentRef }
  | { type: "equal-angle"; a: AngleRef; b: AngleRef }
  | { type: "greater-angle"; a: AngleRef; b: AngleRef }
  | { type: "parallel"; a: LineRef; b: LineRef }
  | { type: "perpendicular"; a: LineRef; b: LineRef }
  | { type: "collinear"; points: PointRef[] }
  | { type: "between"; point: PointRef; endpoints: [PointRef, PointRef] }
  | { type: "same-area"; a: FigureRef; b: FigureRef }
  | { type: "double-area"; a: FigureRef; b: FigureRef }
  | { type: "is-square"; figure: FigureRef }
  | { type: "is-parallelogram"; figure: FigureRef }
  | { type: "is-triangle"; figure: FigureRef };

export type Proposition = {
  id: string;
  book: string;
  bookNumber?: 1;
  number: number;
  title: string;
  subtitle: string;
  playerGoal: string;
  originalStatement: string;
  instruction: string;
  type?: PropositionType;
  startState?: "minimal-givens-only";
  challengeType?: ChallengeType;
  userTask?: string;
  forbiddenInitialObjects?: string[];
  requiredUserActions?: RequiredAction[];
  dependencies?: string[];
  unlocks?: string[];
  initialObjects: GeometryObjects;
  allowedTools: GeometryTool[];
  constructionGuide?: ConstructionStep[];
  validationGoal?: ValidationGoal;
  lawSections: PropositionLawSection[];
  replaySteps: ReplayStep[];
  pointLabelSequence?: string[];
  nextPropositionId?: string;
};

export type ProofContext = Record<string, string | undefined>;

export type ValidationResult = {
  success: boolean;
  message: string;
  context?: ProofContext;
};

export type ValidationGoal = {
  id: string;
  goalType?:
    | "object-exists"
    | "relation-holds"
    | "construction-complete"
    | "theorem-identified"
    | "area-equivalence"
    | "angle-equivalence"
    | "parallelism"
    | "perpendicularity"
    | "inequality"
    | "shape-recognition";
  description: string;
  requiredRelations?: GeometricRelation[];
  minimumUserActions?: string[];
  minimumConstructedObjects?: number;
  acceptEquivalentConstructions?: boolean;
  hiddenConstraints?: string[];
};

export type UnlockType =
  | "primitive-tool"
  | "theorem-action"
  | "logic-rule"
  | "constraint-rule"
  | "area-rule"
  | "parallel-rule"
  | "semantic-token";

export type Unlock = {
  id: string;
  propositionId?: string;
  unlockType: UnlockType;
  name: string;
  functionName: string;
  visibleToPlayer: boolean;
  dependsOn: string[];
  description: string;
  futureUses: string[];
  source?: string;
  originalStatement?: string;
  whatItLetsYouDo?: string;
  replaySteps?: ReplayStep[];
};

export type EuclidProposition = {
  id: string;
  book: number;
  number: number;
  title: string;
  originalStatement: string;
  playerGoal: string;
  type: PropositionType;
  startState?: "minimal-givens-only";
  challengeType?: ChallengeType;
  userTask?: string;
  forbiddenInitialObjects?: string[];
  requiredUserActions?: RequiredAction[];
  dependencies: string[];
  unlocks: string[];
  initialObjects: GeometryObject[];
  constructionGuide?: ConstructionStep[];
  validationGoal: ValidationGoal;
  replaySteps: ReplayStep[];
};
