export type GeometryTool = "select" | "straightedge" | "extend" | "compass" | "intersection";

export type AppPhase = "title" | "laws" | "intro" | "construction" | "success" | "logicReplay" | "completed";

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
  through: string;
  label?: string;
  color?: string;
  source?: string;
  createdBy?: string;
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
};

export type PropositionLawSection = {
  title: string;
  items: string[];
};

export type Proposition = {
  id: string;
  book: string;
  number: number;
  title: string;
  subtitle: string;
  playerGoal: string;
  originalStatement: string;
  instruction: string;
  initialObjects: GeometryObjects;
  allowedTools: GeometryTool[];
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
  description: string;
  hiddenConstraints?: string[];
};

export type UnlockType =
  | "primitive-tool"
  | "theorem-action"
  | "logic-rule"
  | "constraint-rule"
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
  type: "construction" | "theorem";
  dependencies: string[];
  unlocks: string[];
  initialObjects: GeometryObject[];
  validationGoal: ValidationGoal;
  replaySteps: ReplayStep[];
};
