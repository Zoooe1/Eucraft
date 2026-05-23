export type GeometryTool = "select" | "straightedge" | "compass" | "intersection";

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
};

export type Segment = {
  id: string;
  type: "segment";
  p1: string;
  p2: string;
  label?: string;
  color?: string;
  given?: boolean;
};

export type Circle = {
  id: string;
  type: "circle";
  center: string;
  through: string;
  label?: string;
  color?: string;
};

export type GeometryObject = Point | Segment | Circle;

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
