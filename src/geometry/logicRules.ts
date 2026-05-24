export type LogicRuleDefinition = {
  requiredUnlock: string;
  functionName: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  validationFunction: string;
  logicReplay: string[];
};

export const logicRules: Record<string, LogicRuleDefinition> = {
  applySASCongruence: {
    requiredUnlock: "unlock-I.4-sas",
    functionName: "applySASCongruence",
    inputs: ["triangle1", "triangle2", "correspondence"],
    outputs: ["baseEquality", "triangleEquality", "correspondingAngles"],
    dependencies: ["C.N.4"],
    validationFunction: "validateSASCongruence",
    logicReplay: [
      "Match two sides and the included angle.",
      "The triangles coincide under application.",
      "Coinciding parts are equal.",
    ],
  },
  applyIsoscelesBaseAngles: {
    requiredUnlock: "unlock-I.5-isosceles-base-angles",
    functionName: "applyIsoscelesBaseAngles",
    inputs: ["triangle", "equalSidePair"],
    outputs: ["baseAnglesEqual"],
    dependencies: ["I.3", "I.4", "C.N.3"],
    validationFunction: "inferBaseAnglesEqual",
    logicReplay: [
      "Cut equal auxiliary segments from the extended equal sides.",
      "Use SAS twice.",
      "Subtract equal angles from equal angles.",
    ],
  },
  applyConverseIsosceles: {
    requiredUnlock: "unlock-I.6-converse-isosceles",
    functionName: "applyConverseIsosceles",
    inputs: ["triangle", "equalAnglePair"],
    outputs: ["oppositeSidesEqual"],
    dependencies: ["I.3", "I.4", "C.N.5"],
    validationFunction: "inferEqualSidesFromEqualAngles",
    logicReplay: [
      "Assume the opposite sides are unequal.",
      "Cut off an equal part with I.3 and compare triangles by SAS.",
      "Reject the contradiction that a part equals the whole.",
    ],
  },
  applySSSCongruence: {
    requiredUnlock: "unlock-I.8-sss",
    functionName: "applySSSCongruence",
    inputs: ["triangle1", "triangle2", "correspondence"],
    outputs: ["includedAngleEquality", "correspondingAngles"],
    dependencies: ["I.7", "C.N.4"],
    validationFunction: "validateSSSCongruence",
    logicReplay: [
      "Match the base and two remaining side lengths.",
      "I.7 forbids a second apex from the same two distances on the same side.",
      "The included angles coincide and are equal.",
    ],
  },
};
