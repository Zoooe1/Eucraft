export type LawsSection = "Definitions" | "Postulates" | "Common Notions";

export type LawsAnimationKey =
  | "definition-point"
  | "definition-line"
  | "definition-surface"
  | "definition-plane-surface"
  | "definition-plane-angle"
  | "definition-right-angle"
  | "definition-obtuse-acute"
  | "definition-boundary-figure"
  | "definition-circle"
  | "definition-rectilinear-figures"
  | "definition-triangles-by-sides"
  | "definition-triangles-by-angles"
  | "definition-quadrilaterals"
  | "definition-parallel-lines"
  | "postulate-line"
  | "postulate-produce-line"
  | "postulate-circle"
  | "postulate-right-angles"
  | "postulate-parallel"
  | "common-equal-same"
  | "common-add-equals"
  | "common-subtract-equals"
  | "common-coincide"
  | "common-whole-part";

export type LawsStep = {
  id: string;
  section: LawsSection;
  stepNumber: number;
  sourceText: string;
  sourceLines?: Array<{
    label: string;
    text: string;
  }>;
  animationKey: LawsAnimationKey;
  groupedDefinitions?: number[];
  groupedPostulates?: number[];
  groupedCommonNotions?: number[];
  soundCue?: string;
};

export const lawsOfTheWorldSteps: LawsStep[] = [
  {
    id: "definition-point",
    section: "Definitions",
    stepNumber: 1,
    sourceText: "A point is that of which there is no part.",
    sourceLines: [
      {
        label: "Def 1.1",
        text: "A point is that of which there is no part.",
      },
    ],
    animationKey: "definition-point",
    groupedDefinitions: [1],
    soundCue: "ink-tap",
  },
  {
    id: "definition-line",
    section: "Definitions",
    stepNumber: 2,
    sourceText:
      "A line is a length without breadth. And the extremities of a line are points. A straight-line is (any) one which lies evenly with points on itself.",
    sourceLines: [
      {
        label: "Def 1.2",
        text: "A line is a length without breadth.",
      },
      {
        label: "Def 1.3",
        text: "And the extremities of a line are points.",
      },
      {
        label: "Def 1.4",
        text: "A straight-line is (any) one which lies evenly with points on itself.",
      },
    ],
    animationKey: "definition-line",
    groupedDefinitions: [2, 3, 4],
    soundCue: "line-draw",
  },
  {
    id: "definition-surface",
    section: "Definitions",
    stepNumber: 3,
    sourceText: "A surface is that which has length and breadth only. The extremities of a surface are lines.",
    sourceLines: [
      {
        label: "Def 1.5",
        text: "A surface is that which has length and breadth only.",
      },
      {
        label: "Def 1.6",
        text: "The extremities of a surface are lines.",
      },
    ],
    animationKey: "definition-surface",
    groupedDefinitions: [5, 6],
    soundCue: "stretch",
  },
  {
    id: "definition-plane-surface",
    section: "Definitions",
    stepNumber: 4,
    sourceText: "A plane surface is a surface which lies evenly with the straight lines on itself.",
    sourceLines: [
      {
        label: "Def 1.7",
        text: "A plane surface is a surface which lies evenly with the straight lines on itself.",
      },
    ],
    animationKey: "definition-plane-surface",
    groupedDefinitions: [7],
    soundCue: "soft-snap",
  },
  {
    id: "definition-plane-angle",
    section: "Definitions",
    stepNumber: 5,
    sourceText:
      "A plane angle is the inclination to one another of two lines in a plane which meet one another and do not lie in a straight line.",
    sourceLines: [
      {
        label: "Def 1.8",
        text: "A plane angle is the inclination to one another of two lines in a plane which meet one another and do not lie in a straight line.",
      },
    ],
    animationKey: "definition-plane-angle",
    groupedDefinitions: [8],
    soundCue: "soft-snap",
  },
  {
    id: "definition-circle",
    section: "Definitions",
    stepNumber: 6,
    sourceText:
      "A circle is a plane figure contained by one line such that all the straight lines falling upon it from one point among those lying inside the figure are equal to one another. And the point is called the center of the circle. A diameter of the circle is any straight line drawn through the center and terminated in both directions by the circumference. A semicircle is the figure contained by the diameter and the circumference cut off by it.",
    sourceLines: [
      {
        label: "Def 1.15",
        text: "A circle is a plane figure contained by one line such that all the straight lines falling upon it from one point among those lying inside the figure are equal to one another.",
      },
      {
        label: "Def 1.16",
        text: "And the point is called the center of the circle.",
      },
      {
        label: "Def 1.17",
        text: "A diameter of the circle is any straight line drawn through the center and terminated in both directions by the circumference.",
      },
      {
        label: "Def 1.18",
        text: "A semicircle is the figure contained by the diameter and the circumference cut off by it.",
      },
    ],
    animationKey: "definition-circle",
    groupedDefinitions: [15, 16, 17, 18],
    soundCue: "compass-sweep",
  },
  {
    id: "definition-boundary-figure",
    section: "Definitions",
    stepNumber: 7,
    sourceText: "A boundary is that which is the extremity of something. A figure is that which is contained by any boundary or boundaries.",
    sourceLines: [
      {
        label: "Def 1.13",
        text: "A boundary is that which is the extremity of something.",
      },
      {
        label: "Def 1.14",
        text: "A figure is that which is contained by any boundary or boundaries.",
      },
    ],
    animationKey: "definition-boundary-figure",
    groupedDefinitions: [13, 14],
    soundCue: "line-draw",
  },
  {
    id: "definition-rectilinear-figures",
    section: "Definitions",
    stepNumber: 8,
    sourceText: "Rectilinear figures are those contained by straight lines.",
    sourceLines: [
      {
        label: "Def 1.19",
        text: "Rectilinear figures are those contained by straight lines.",
      },
    ],
    animationKey: "definition-rectilinear-figures",
    groupedDefinitions: [19],
    soundCue: "line-draw",
  },
  {
    id: "definition-right-angle",
    section: "Definitions",
    stepNumber: 9,
    sourceText:
      "When the lines containing the angle are straight, the angle is called rectilinear. And when a straight line standing on a straight line makes the adjacent angles equal to one another, each of the equal angles is right.",
    sourceLines: [
      {
        label: "Def 1.9",
        text: "When the lines containing the angle are straight, the angle is called rectilinear.",
      },
      {
        label: "Def 1.10",
        text: "And when a straight line standing on a straight line makes the adjacent angles equal to one another, each of the equal angles is right.",
      },
    ],
    animationKey: "definition-right-angle",
    groupedDefinitions: [9, 10],
    soundCue: "right-angle-click",
  },
  {
    id: "definition-obtuse-acute",
    section: "Definitions",
    stepNumber: 10,
    sourceText: "An obtuse angle is greater than a right angle. An acute angle is less than a right angle.",
    sourceLines: [
      {
        label: "Def 1.11",
        text: "An obtuse angle is greater than a right angle.",
      },
      {
        label: "Def 1.12",
        text: "An acute angle is less than a right angle.",
      },
    ],
    animationKey: "definition-obtuse-acute",
    groupedDefinitions: [11, 12],
    soundCue: "soft-snap",
  },
  {
    id: "definition-triangles-by-sides",
    section: "Definitions",
    stepNumber: 11,
    sourceText:
      "Trilateral figures are those contained by three straight lines. Of trilateral figures, an equilateral triangle is that which has three equal sides, an isosceles triangle that which has two equal sides, and a scalene triangle that which has three unequal sides.",
    sourceLines: [
      {
        label: "Def 1.20",
        text: "Trilateral figures are those contained by three straight lines. Of trilateral figures, an equilateral triangle is that which has three equal sides, an isosceles triangle that which has two equal sides, and a scalene triangle that which has three unequal sides.",
      },
    ],
    animationKey: "definition-triangles-by-sides",
    groupedDefinitions: [20],
    soundCue: "line-draw",
  },
  {
    id: "definition-triangles-by-angles",
    section: "Definitions",
    stepNumber: 12,
    sourceText:
      "Of trilateral figures, a right-angled triangle is that which has a right angle, an obtuse-angled triangle that which has an obtuse angle, and an acute-angled triangle that which has three acute angles.",
    sourceLines: [
      {
        label: "Def 1.21",
        text: "Of trilateral figures, a right-angled triangle is that which has a right angle, an obtuse-angled triangle that which has an obtuse angle, and an acute-angled triangle that which has three acute angles.",
      },
    ],
    animationKey: "definition-triangles-by-angles",
    groupedDefinitions: [21],
    soundCue: "right-angle-click",
  },
  {
    id: "definition-quadrilaterals",
    section: "Definitions",
    stepNumber: 13,
    sourceText:
      "Of quadrilateral figures, a square is that which is both equilateral and right-angled; an oblong that which is right-angled but not equilateral; a rhombus that which is equilateral but not right-angled; and a rhomboid that which has opposite sides and angles equal to one another, but is neither equilateral nor right-angled. Let quadrilateral figures besides these be called trapezia.",
    sourceLines: [
      {
        label: "Def 1.22",
        text: "Of quadrilateral figures, a square is that which is both equilateral and right-angled; an oblong that which is right-angled but not equilateral; a rhombus that which is equilateral but not right-angled; and a rhomboid that which has opposite sides and angles equal to one another, but is neither equilateral nor right-angled. Let quadrilateral figures besides these be called trapezia.",
      },
    ],
    animationKey: "definition-quadrilaterals",
    groupedDefinitions: [22],
    soundCue: "line-draw",
  },
  {
    id: "definition-parallel-lines",
    section: "Definitions",
    stepNumber: 14,
    sourceText:
      "Parallel lines are straight lines which, being in the same plane and being produced indefinitely in both directions, do not meet one another in either direction.",
    sourceLines: [
      {
        label: "Def 1.23",
        text: "Parallel lines are straight lines which, being in the same plane and being produced indefinitely in both directions, do not meet one another in either direction.",
      },
    ],
    animationKey: "definition-parallel-lines",
    groupedDefinitions: [23],
    soundCue: "stretch",
  },
  {
    id: "postulate-line",
    section: "Postulates",
    stepNumber: 1,
    sourceText: "To draw a straight line from any point to any point.",
    sourceLines: [
      {
        label: "Postulate 1",
        text: "To draw a straight line from any point to any point.",
      },
    ],
    animationKey: "postulate-line",
    groupedPostulates: [1],
    soundCue: "line-draw",
  },
  {
    id: "postulate-produce-line",
    section: "Postulates",
    stepNumber: 2,
    sourceText: "To produce a finite straight line continuously in a straight line.",
    sourceLines: [
      {
        label: "Postulate 2",
        text: "To produce a finite straight line continuously in a straight line.",
      },
    ],
    animationKey: "postulate-produce-line",
    groupedPostulates: [2],
    soundCue: "stretch",
  },
  {
    id: "postulate-circle",
    section: "Postulates",
    stepNumber: 3,
    sourceText: "To draw a circle with any center and radius.",
    sourceLines: [
      {
        label: "Postulate 3",
        text: "To draw a circle with any center and radius.",
      },
    ],
    animationKey: "postulate-circle",
    groupedPostulates: [3],
    soundCue: "compass-sweep",
  },
  {
    id: "postulate-right-angles",
    section: "Postulates",
    stepNumber: 4,
    sourceText: "That all right angles are equal to one another.",
    sourceLines: [
      {
        label: "Postulate 4",
        text: "That all right angles are equal to one another.",
      },
    ],
    animationKey: "postulate-right-angles",
    groupedPostulates: [4],
    soundCue: "right-angle-click",
  },
  {
    id: "postulate-parallel",
    section: "Postulates",
    stepNumber: 5,
    sourceText:
      "That if a straight line falling across two straight lines makes the internal angles on the same side less than two right angles, then the two straight lines, being produced indefinitely, meet on the side on which are the angles less than two right angles.",
    sourceLines: [
      {
        label: "Postulate 5",
        text: "That if a straight line falling across two straight lines makes the internal angles on the same side less than two right angles, then the two straight lines, being produced indefinitely, meet on the side on which are the angles less than two right angles.",
      },
    ],
    animationKey: "postulate-parallel",
    groupedPostulates: [5],
    soundCue: "stretch",
  },
  {
    id: "common-equal-same",
    section: "Common Notions",
    stepNumber: 1,
    sourceText: "Things equal to the same thing are equal to one another.",
    sourceLines: [
      {
        label: "Common Notion 1",
        text: "Things equal to the same thing are equal to one another.",
      },
    ],
    animationKey: "common-equal-same",
    groupedCommonNotions: [1],
    soundCue: "soft-snap",
  },
  {
    id: "common-add-equals",
    section: "Common Notions",
    stepNumber: 2,
    sourceText: "If equal things are added to equal things, then the wholes are equal.",
    sourceLines: [
      {
        label: "Common Notion 2",
        text: "If equal things are added to equal things, then the wholes are equal.",
      },
    ],
    animationKey: "common-add-equals",
    groupedCommonNotions: [2],
    soundCue: "soft-snap",
  },
  {
    id: "common-subtract-equals",
    section: "Common Notions",
    stepNumber: 3,
    sourceText: "If equal things are subtracted from equal things, then the remainders are equal.",
    sourceLines: [
      {
        label: "Common Notion 3",
        text: "If equal things are subtracted from equal things, then the remainders are equal.",
      },
    ],
    animationKey: "common-subtract-equals",
    groupedCommonNotions: [3],
    soundCue: "soft-snap",
  },
  {
    id: "common-coincide",
    section: "Common Notions",
    stepNumber: 4,
    sourceText: "Things coinciding with one another are equal to one another.",
    sourceLines: [
      {
        label: "Common Notion 4",
        text: "Things coinciding with one another are equal to one another.",
      },
    ],
    animationKey: "common-coincide",
    groupedCommonNotions: [4],
    soundCue: "soft-snap",
  },
  {
    id: "common-whole-part",
    section: "Common Notions",
    stepNumber: 5,
    sourceText: "The whole is greater than the part.",
    sourceLines: [
      {
        label: "Common Notion 5",
        text: "The whole is greater than the part.",
      },
    ],
    animationKey: "common-whole-part",
    groupedCommonNotions: [5],
    soundCue: "paper-rip",
  },
];
