export type EuclidDialogueStep = {
  id: string;
  section: "Definitions" | "Postulates" | "Common Notions";
  definitionNumber?: number;
  sourceText: string;
  euclidLine: string;
  animationKey:
    | "point-from-division"
    | "point-to-line"
    | "line-extremities"
    | "straight-line"
    | "line-to-surface"
    | "surface-extremities"
    | "plane-surface"
    | "plane-angle";
  interaction?: {
    type: "click-to-awaken-point" | "click-endpoints" | "drag-ray" | "none";
    instruction: string;
  };
  soundCue?: string;
};

export const euclidDialogueSteps: EuclidDialogueStep[] = [
  {
    id: "definition-1-point",
    section: "Definitions",
    definitionNumber: 1,
    sourceText: "A point is that which has no part.",
    euclidLine: "Before a line, before a figure, there is only position.",
    animationKey: "point-from-division",
    interaction: {
      type: "click-to-awaken-point",
      instruction: "Click inside the cloud to awaken the point.",
    },
    soundCue: "ink-tap",
  },
  {
    id: "definition-2-line",
    section: "Definitions",
    definitionNumber: 2,
    sourceText: "A line is breadthless length.",
    euclidLine: "When position stretches without width, a line begins.",
    animationKey: "point-to-line",
    interaction: {
      type: "none",
      instruction: "Watch the point become breadthless length.",
    },
    soundCue: "line-draw",
  },
  {
    id: "definition-3-line-extremities",
    section: "Definitions",
    definitionNumber: 3,
    sourceText: "The extremities of a line are points.",
    euclidLine: "A line ends where points stand at its limits.",
    animationKey: "line-extremities",
    interaction: {
      type: "click-endpoints",
      instruction: "Click both endpoints.",
    },
    soundCue: "ink-tap",
  },
  {
    id: "definition-4-straight-line",
    section: "Definitions",
    definitionNumber: 4,
    sourceText: "A straight line is a line which lies evenly with the points on itself.",
    euclidLine: "A straight line does not wander. It lies evenly with itself.",
    animationKey: "straight-line",
    interaction: {
      type: "none",
      instruction: "Watch the wandering line settle.",
    },
    soundCue: "soft-snap",
  },
  {
    id: "definition-5-surface",
    section: "Definitions",
    definitionNumber: 5,
    sourceText: "A surface is that which has length and breadth only.",
    euclidLine: "When a line opens into breadth, a surface appears.",
    animationKey: "line-to-surface",
    interaction: {
      type: "none",
      instruction: "Watch the line sweep into breadth.",
    },
    soundCue: "surface-sweep",
  },
  {
    id: "definition-6-surface-extremities",
    section: "Definitions",
    definitionNumber: 6,
    sourceText: "The extremities of a surface are lines.",
    euclidLine: "The surface is held by lines at its edge.",
    animationKey: "surface-extremities",
    interaction: {
      type: "click-endpoints",
      instruction: "Click or trace the boundary line.",
    },
    soundCue: "line-highlight",
  },
  {
    id: "definition-7-plane-surface",
    section: "Definitions",
    definitionNumber: 7,
    sourceText: "A plane surface is a surface which lies evenly with the straight lines on itself.",
    euclidLine: "A plane has no hidden bending. It lies evenly with its lines.",
    animationKey: "plane-surface",
    interaction: {
      type: "none",
      instruction: "Watch the surface settle into a plane.",
    },
    soundCue: "soft-settle",
  },
  {
    id: "definition-8-plane-angle",
    section: "Definitions",
    definitionNumber: 8,
    sourceText:
      "A plane angle is the inclination to one another of two lines in a plane which meet one another and do not lie in a straight line.",
    euclidLine: "When two lines meet without becoming one, an angle is born.",
    animationKey: "plane-angle",
    interaction: {
      type: "drag-ray",
      instruction: "Drag the second ray to change the inclination.",
    },
    soundCue: "soft-hinge",
  },
];
