import type { GeometryObject, ProofContext } from "./types";
import {
  allCircles,
  allNamedPoints,
  allPoints,
  allSegments,
  angleAt,
  areDistancesEqual,
  areAnglesEqual,
  arePointsCollinear,
  circleRadius,
  circleExists,
  distance,
  extendedLineExists,
  getPoint,
  isPointBetween,
  isPointOnRay,
  segmentExistsBetween,
} from "./operations";

const A_ID = "A";
const B_ID = "B";

export function circleUsingBase(objects: GeometryObject[], center: string, through: string) {
  const exact = circleExists(objects, center, through);
  if (exact) {
    return exact;
  }

  const centerPoint = getPoint(objects, center);
  const throughPoint = getPoint(objects, through);
  if (!centerPoint || !throughPoint) {
    return undefined;
  }

  const baseRadius = distance(centerPoint, throughPoint);
  return allCircles(objects).find((circle) => {
    if (circle.center !== center) {
      return false;
    }

    return areDistancesEqual(circleRadius(circle, objects), baseRadius);
  });
}

export function resolveBook1Prop1Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, A_ID);
  const B = getPoint(objects, B_ID);
  const segmentAB = segmentExistsBetween(objects, A_ID, B_ID);

  if (!A || !B || !segmentAB) {
    return undefined;
  }

  const circleA = circleUsingBase(objects, A_ID, B_ID);
  const circleB = circleUsingBase(objects, B_ID, A_ID);
  const AB = distance(A, B);
  const candidatePoints = allNamedPoints(objects).filter((point) => point.id !== A_ID && point.id !== B_ID);

  for (const C of candidatePoints) {
    const segmentAC = segmentExistsBetween(objects, A_ID, C.id);
    const segmentBC = segmentExistsBetween(objects, B_ID, C.id);
    const AC = distance(A, C);
    const BC = distance(B, C);

    if (arePointsCollinear(A, B, C) || !segmentAC || !segmentBC) {
      continue;
    }

    if (areDistancesEqual(AB, AC) && areDistancesEqual(AB, BC)) {
      return {
        A: A_ID,
        B: B_ID,
        C: C.id,
        pointA: A_ID,
        pointB: B_ID,
        pointC: C.id,
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentBC: segmentBC.id,
        circleA: circleA?.id,
        circleB: circleB?.id,
      };
    }
  }

  return undefined;
}

function segmentWithLengthFrom(
  objects: GeometryObject[],
  pointId: string,
  targetLength: number,
  excludeIds: string[] = [],
  allowAuxiliary = false,
) {
  const origin = getPoint(objects, pointId);
  if (!origin) {
    return undefined;
  }

  return allSegments(objects)
    .map((segment) => {
      const otherId = segment.p1 === pointId ? segment.p2 : segment.p2 === pointId ? segment.p1 : undefined;
      const other = otherId ? getPoint(objects, otherId) : undefined;
      return other && (allowAuxiliary || !other.auxiliary) && !excludeIds.includes(other.id) ? { segment, other } : undefined;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => {
      const score = (entry: NonNullable<typeof a>) => {
        if (entry.other.createdBy === "intersection") {
          return 4;
        }
        if (entry.other.createdBy === "theorem-action") {
          return 3;
        }
        if (entry.other.createdBy === "given") {
          return 2;
        }
        if (entry.other.createdBy === "free" || entry.other.createdBy === "snap") {
          return 0;
        }
        return 1;
      };
      return score(b) - score(a);
    })
    .find((entry) => entry && areDistancesEqual(distance(origin, entry.other), targetLength));
}

function pointOnSegmentLineBetween(objects: GeometryObject[], pointId: string, lineStartId: string, lineEndId: string) {
  const point = getPoint(objects, pointId);
  const start = getPoint(objects, lineStartId);
  const end = getPoint(objects, lineEndId);
  if (!point || !start || !end) {
    return false;
  }

  const withinX = point.x >= Math.min(start.x, end.x) - 2 && point.x <= Math.max(start.x, end.x) + 2;
  const withinY = point.y >= Math.min(start.y, end.y) - 2 && point.y <= Math.max(start.y, end.y) + 2;
  return !arePointsCollinear(start, end, point, 0.01) ? false : withinX && withinY;
}

function requiredPointMap(objects: GeometryObject[], ids: string[]) {
  const entries = ids.map((id) => [id, getPoint(objects, id)] as const);
  if (entries.some(([, point]) => !point)) {
    return undefined;
  }

  return Object.fromEntries(entries) as Record<string, NonNullable<ReturnType<typeof getPoint>>>;
}

function segmentContext(objects: GeometryObject[], pairs: Array<[string, string, string]>) {
  const context: ProofContext = {};
  for (const [key, p1, p2] of pairs) {
    const segment = segmentExistsBetween(objects, p1, p2);
    if (!segment) {
      return undefined;
    }
    context[key] = segment.id;
  }

  return context;
}

function pointsCoincide(a: NonNullable<ReturnType<typeof getPoint>>, b: NonNullable<ReturnType<typeof getPoint>>, tolerance = 12) {
  return distance(a, b) <= tolerance;
}

function rayParameter(from: NonNullable<ReturnType<typeof getPoint>>, through: NonNullable<ReturnType<typeof getPoint>>, point: NonNullable<ReturnType<typeof getPoint>>) {
  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return 0;
  }

  return ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared;
}

function pointWithLabelOrOnRay(
  objects: GeometryObject[],
  label: string,
  from: NonNullable<ReturnType<typeof getPoint>>,
  through: NonNullable<ReturnType<typeof getPoint>>,
  minimumParameter = 1.02,
) {
  const labelled = allNamedPoints(objects).find((point) => point.label === label);
  if (labelled && arePointsCollinear(from, through, labelled, 0.018) && rayParameter(from, through, labelled) >= minimumParameter) {
    return labelled;
  }

  return allNamedPoints(objects).find(
    (point) =>
      !["A", "B", "C"].includes(point.id) &&
      arePointsCollinear(from, through, point, 0.018) &&
      rayParameter(from, through, point) >= minimumParameter,
  );
}

function sameSideOfLine(
  a: NonNullable<ReturnType<typeof getPoint>>,
  b: NonNullable<ReturnType<typeof getPoint>>,
  p: NonNullable<ReturnType<typeof getPoint>>,
  q: NonNullable<ReturnType<typeof getPoint>>,
) {
  const side = (point: NonNullable<ReturnType<typeof getPoint>>) =>
    (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
  const pSide = side(p);
  const qSide = side(q);
  return Math.abs(pSide) > 12 && Math.abs(qSide) > 12 && pSide * qSide > 0;
}

export function resolveBook1Prop2Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");

  if (!A || !B || !C || !segmentBC) {
    return undefined;
  }

  const bcLength = distance(B, C);
  const final = segmentWithLengthFrom(objects, "A", bcLength, ["B", "C"], true);
  if (!final) {
    return undefined;
  }

  const D = allNamedPoints(objects).find((point) => {
    if (["A", "B", "C", final.other.id].includes(point.id)) {
      return false;
    }
    return areDistancesEqual(distance(A, point), distance(A, B)) && areDistancesEqual(distance(B, point), distance(A, B));
  });
  const G = allNamedPoints(objects).find(
    (point) =>
      !["A", "B", "C", final.other.id, D?.id].includes(point.id) &&
      areDistancesEqual(distance(B, point), bcLength),
  );

  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAD = D ? segmentExistsBetween(objects, "A", D.id) : undefined;
  const segmentBD = D ? segmentExistsBetween(objects, "B", D.id) : undefined;
  const segmentBG = G ? segmentExistsBetween(objects, "B", G.id) : undefined;
  const segmentDG = D && G ? segmentExistsBetween(objects, D.id, G.id) : undefined;
  const segmentDL = D ? segmentExistsBetween(objects, D.id, final.other.id) : undefined;
  const circleB = allCircles(objects).find((circle) => {
    return circle.center === "B" && areDistancesEqual(circleRadius(circle, objects), bcLength);
  });
  const circleD =
    D &&
    G &&
    allCircles(objects).find((circle) => {
      return circle.center === D.id && areDistancesEqual(circleRadius(circle, objects), distance(D, G));
    });

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: D?.id,
    pointG: G?.id,
    pointL: final.other.id,
    segmentAB: segmentAB?.id,
    segmentBC: segmentBC.id,
    segmentAD: segmentAD?.id,
    segmentBD: segmentBD?.id,
    segmentBG: segmentBG?.id,
    segmentDG: segmentDG?.id,
    segmentDL: segmentDL?.id,
    segmentAL: final.segment.id,
    circleB: circleB?.id,
    circleD: circleD?.id,
  };
}

export function resolveBook1Prop3Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const D = getPoint(objects, "D");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentCD = segmentExistsBetween(objects, "C", "D");

  if (!A || !B || !C || !D || !segmentAB || !segmentCD) {
    return undefined;
  }

  const lesserLength = distance(C, D);
  if (distance(A, B) <= lesserLength) {
    return undefined;
  }

  const candidates = allPoints(objects).filter(
    (point) => !["A", "B", "C", "D"].includes(point.id) && pointOnSegmentLineBetween(objects, point.id, "A", "B"),
  );

  for (const E of candidates) {
    const segmentAE = segmentExistsBetween(objects, "A", E.id);
    if (!areDistancesEqual(distance(A, E), lesserLength)) {
      continue;
    }

    const P = allNamedPoints(objects).find(
      (point) =>
        !["A", "B", "C", "D", E.id].includes(point.id) &&
        areDistancesEqual(distance(A, point), lesserLength),
    );
    const segmentAP = P ? segmentExistsBetween(objects, "A", P.id) : undefined;
    const circleA = allCircles(objects).find((circle) => {
      return circle.center === "A" && areDistancesEqual(circleRadius(circle, objects), lesserLength);
    });

    return {
      pointA: "A",
      pointB: "B",
      pointC: "C",
      pointD: "D",
      pointE: E.id,
      pointP: P?.id ?? E.id,
      segmentAB: segmentAB.id,
      segmentCD: segmentCD.id,
      segmentAE: segmentAE?.id,
      segmentAP: segmentAP?.id ?? segmentAE?.id,
      circleA: circleA?.id,
    };
  }

  return undefined;
}

export function resolveBook1Prop4Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F"]);
  const segments = segmentContext(objects, [
    ["segmentAB", "A", "B"],
    ["segmentAC", "A", "C"],
    ["segmentBC", "B", "C"],
    ["segmentDE", "D", "E"],
    ["segmentDF", "D", "F"],
    ["segmentEF", "E", "F"],
  ]);
  if (!points || !segments) {
    return undefined;
  }

  if (!pointsCoincide(points.A, points.D) || !pointsCoincide(points.B, points.E) || !pointsCoincide(points.C, points.F)) {
    return undefined;
  }

  if (
    !areDistancesEqual(distance(points.A, points.B), distance(points.D, points.E)) ||
    !areDistancesEqual(distance(points.A, points.C), distance(points.D, points.F)) ||
    !areAnglesEqual(angleAt(points.A, points.B, points.C), angleAt(points.D, points.E, points.F))
  ) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    pointE: "E",
    pointF: "F",
    ...segments,
  };
}

export function resolveBook1Prop5Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C"]);
  const segments = segmentContext(objects, [
    ["segmentAB", "A", "B"],
    ["segmentAC", "A", "C"],
    ["segmentBC", "B", "C"],
  ]);
  const extensionAB = extendedLineExists(objects, "A", "B")?.id;
  const extensionAC = extendedLineExists(objects, "A", "C")?.id;
  if (!points || !segments || !extensionAB || !extensionAC) {
    return undefined;
  }

  if (!areDistancesEqual(distance(points.A, points.B), distance(points.A, points.C))) {
    return undefined;
  }

  const F = pointWithLabelOrOnRay(objects, "F", points.A, points.B);
  const G = pointWithLabelOrOnRay(objects, "G", points.A, points.C);
  if (!F || !G || !areDistancesEqual(distance(points.A, F), distance(points.A, G), 8)) {
    return undefined;
  }

  const segmentFC = segmentExistsBetween(objects, F.id, "C");
  const segmentGB = segmentExistsBetween(objects, G.id, "B");
  if (!segmentFC || !segmentGB) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointF: F.id,
    pointG: G.id,
    extensionAB,
    extensionAC,
    segmentAF: segmentExistsBetween(objects, "A", F.id)?.id,
    segmentAG: segmentExistsBetween(objects, "A", G.id)?.id,
    segmentBF: segmentExistsBetween(objects, "B", F.id)?.id,
    segmentCG: segmentExistsBetween(objects, "C", G.id)?.id,
    segmentFC: segmentFC.id,
    segmentGB: segmentGB.id,
    ...segments,
  };
}

export function resolveBook1Prop6Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C"]);
  const segments = segmentContext(objects, [
    ["segmentAB", "A", "B"],
    ["segmentAC", "A", "C"],
    ["segmentBC", "B", "C"],
  ]);
  if (!points || !segments) {
    return undefined;
  }

  const D = allNamedPoints(objects).find(
    (point) => {
      const isCutFromAssumption =
        point.parentObjectIds?.includes("AC") && point.parentObjectIds?.includes("AB") && point.parentObjectIds?.includes("B");
      return (
        point.label === "D" &&
        isPointBetween(points.A, point, points.B) &&
        (isCutFromAssumption || areDistancesEqual(distance(point, points.B), distance(points.A, points.C), 8))
      );
    },
  );
  if (!D) {
    return undefined;
  }

  const segmentDB = segmentExistsBetween(objects, D.id, "B");
  const segmentDC = segmentExistsBetween(objects, D.id, "C");
  if (!segmentDB || !segmentDC) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: D.id,
    segmentDB: segmentDB.id,
    segmentDC: segmentDC.id,
    ...segments,
  };
}

export function resolveBook1Prop7Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D"]);
  const segments = segmentContext(objects, [
    ["segmentAC", "A", "C"],
    ["segmentBC", "B", "C"],
    ["segmentAD", "A", "D"],
    ["segmentBD", "B", "D"],
    ["segmentCD", "C", "D"],
  ]);
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  if (!points || !segments || !segmentAB) {
    return undefined;
  }

  if (!sameSideOfLine(points.A, points.B, points.C, points.D) || distance(points.C, points.D) <= 12) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    segmentAB: segmentAB.id,
    ...segments,
  };
}

export function resolveBook1Prop8Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F"]);
  const segments = segmentContext(objects, [
    ["segmentAB", "A", "B"],
    ["segmentAC", "A", "C"],
    ["segmentBC", "B", "C"],
    ["segmentDE", "D", "E"],
    ["segmentDF", "D", "F"],
    ["segmentEF", "E", "F"],
  ]);
  if (!points || !segments) {
    return undefined;
  }

  if (
    !areDistancesEqual(distance(points.A, points.B), distance(points.D, points.E)) ||
    !areDistancesEqual(distance(points.A, points.C), distance(points.D, points.F)) ||
    !areDistancesEqual(distance(points.B, points.C), distance(points.E, points.F)) ||
    !pointsCoincide(points.A, points.D) ||
    !pointsCoincide(points.B, points.E) ||
    !pointsCoincide(points.C, points.F)
  ) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    pointE: "E",
    pointF: "F",
    ...segments,
  };
}

export function resolveBook1Prop9Contexts(objects: GeometryObject[]): ProofContext[] {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  if (!A || !B || !C || !segmentAB || !segmentAC) {
    return [];
  }

  const contexts: ProofContext[] = [];
  const candidates = allNamedPoints(objects).filter((point) => point.id !== "A");
  const sideABPoints = candidates.filter((point) => isPointOnRay(A, B, point, 0.035));
  const sideACPoints = candidates.filter((point) => isPointOnRay(A, C, point, 0.035));

  for (const D of sideABPoints) {
    for (const E of sideACPoints) {
      if (D.id === E.id || !areDistancesEqual(distance(A, D), distance(A, E), 9)) {
        continue;
      }

      const segmentDE = segmentExistsBetween(objects, D.id, E.id);
      if (!segmentDE) {
        continue;
      }

      const deLength = distance(D, E);
      for (const F of candidates) {
        if ([D.id, E.id].includes(F.id)) {
          continue;
        }

        const segmentDF = segmentExistsBetween(objects, D.id, F.id);
        const segmentEF = segmentExistsBetween(objects, E.id, F.id);
        const segmentAF = segmentExistsBetween(objects, "A", F.id);
        if (!segmentDF || !segmentEF || !segmentAF) {
          continue;
        }

        if (
          !areDistancesEqual(distance(D, F), deLength, 9) ||
          !areDistancesEqual(distance(E, F), deLength, 9)
        ) {
          continue;
        }

        contexts.push({
          pointA: "A",
          pointB: "B",
          pointC: "C",
          pointD: D.id,
          pointE: E.id,
          pointF: F.id,
          segmentAB: segmentAB.id,
          segmentAC: segmentAC.id,
          segmentAD: segmentExistsBetween(objects, "A", D.id)?.id,
          segmentAE: segmentExistsBetween(objects, "A", E.id)?.id,
          segmentDE: segmentDE.id,
          segmentDF: segmentDF.id,
          segmentEF: segmentEF.id,
          segmentAF: segmentAF.id,
        });
      }
    }
  }

  return contexts;
}

export function resolveBook1Prop9Context(objects: GeometryObject[]): ProofContext | undefined {
  return resolveBook1Prop9Contexts(objects)[0];
}

export function resolveBook1Prop10Contexts(objects: GeometryObject[]): ProofContext[] {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  if (!A || !B || !segmentAB) {
    return [];
  }

  const contexts: ProofContext[] = [];
  const abLength = distance(A, B);
  const candidates = allNamedPoints(objects).filter((point) => !["A", "B"].includes(point.id));
  for (const C of candidates) {
    const segmentAC = segmentExistsBetween(objects, "A", C.id);
    const segmentBC = segmentExistsBetween(objects, "B", C.id);
    if (
      !segmentAC ||
      !segmentBC ||
      arePointsCollinear(A, B, C) ||
      !areDistancesEqual(distance(A, C), abLength) ||
      !areDistancesEqual(distance(B, C), abLength)
    ) {
      continue;
    }

    for (const D of candidates.filter((point) => point.id !== C.id && isPointBetween(A, point, B))) {
      if (D.id === C.id || !isPointBetween(A, D, B)) {
        continue;
      }

      const segmentCD = segmentExistsBetween(objects, C.id, D.id);

      contexts.push({
        pointA: "A",
        pointB: "B",
        pointC: C.id,
        pointD: D.id,
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentBC: segmentBC.id,
        segmentCD: segmentCD?.id,
        segmentAD: segmentExistsBetween(objects, "A", D.id)?.id,
        segmentBD: segmentExistsBetween(objects, "B", D.id)?.id,
      });
    }
  }

  return contexts.sort((first, second) => Number(Boolean(second.segmentCD)) - Number(Boolean(first.segmentCD)));
}

export function resolveBook1Prop10Context(objects: GeometryObject[]): ProofContext | undefined {
  return resolveBook1Prop10Contexts(objects)[0];
}

export function resolveBook1Prop11Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  if (!A || !B || !C || !segmentAB || !arePointsCollinear(A, B, C, 0.035)) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C"].includes(point.id));
  const lineCandidates = candidates.filter((point) => arePointsCollinear(A, B, point, 0.035) && distance(C, point) > 8);
  const cParameter = rayParameter(A, B, C);

  for (const first of lineCandidates) {
    for (const second of lineCandidates) {
      if (first.id === second.id) {
        continue;
      }

      const firstParameter = rayParameter(A, B, first);
      const secondParameter = rayParameter(A, B, second);
      if ((firstParameter - cParameter) * (secondParameter - cParameter) >= -0.0001) {
        continue;
      }

      if (!areDistancesEqual(distance(C, first), distance(C, second), 9)) {
        continue;
      }

      const D = firstParameter <= secondParameter ? first : second;
      const E = firstParameter <= secondParameter ? second : first;
      const segmentDE = segmentExistsBetween(objects, D.id, E.id);
      if (!segmentDE) {
        continue;
      }

      const deLength = distance(D, E);
      for (const F of candidates) {
        if ([D.id, E.id].includes(F.id)) {
          continue;
        }

        const segmentDF = segmentExistsBetween(objects, D.id, F.id);
        const segmentEF = segmentExistsBetween(objects, E.id, F.id);
        const segmentFC = segmentExistsBetween(objects, F.id, C.id);
        if (!segmentDF || !segmentEF || !segmentFC) {
          continue;
        }

        if (!areDistancesEqual(distance(D, F), deLength, 9) || !areDistancesEqual(distance(E, F), deLength, 9)) {
          continue;
        }

        return {
          pointA: "A",
          pointB: "B",
          pointC: "C",
          pointD: D.id,
          pointE: E.id,
          pointF: F.id,
          segmentAB: segmentAB.id,
          segmentCD: segmentExistsBetween(objects, C.id, D.id)?.id,
          segmentCE: segmentExistsBetween(objects, C.id, E.id)?.id,
          segmentDE: segmentDE.id,
          segmentDF: segmentDF.id,
          segmentEF: segmentEF.id,
          segmentFC: segmentFC.id,
        };
      }
    }
  }

  return undefined;
}

export function resolveBook1Prop12Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  if (!A || !B || !C || !segmentAB || arePointsCollinear(A, B, C, 0.035)) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C"].includes(point.id));
  const circles = allCircles(objects).filter((circle) => circle.center === C.id && circleRadius(circle, objects) > 8);

  for (const circleC of circles) {
    const radius = circleRadius(circleC, objects);
    const D =
      (circleC.through ? getPoint(objects, circleC.through) : undefined) ??
      candidates.find(
        (point) =>
          !arePointsCollinear(A, B, point, 0.035) &&
          !sameSideOfLine(A, B, C, point) &&
          areDistancesEqual(distance(C, point), radius, 9),
      );
    if (!D || arePointsCollinear(A, B, D, 0.035) || sameSideOfLine(A, B, C, D)) {
      continue;
    }

    const lineCandidates = candidates
      .filter((point) => arePointsCollinear(A, B, point, 0.035) && areDistancesEqual(distance(C, point), radius, 9))
      .sort((first, second) => rayParameter(A, B, first) - rayParameter(A, B, second));

    if (lineCandidates.length < 2) {
      continue;
    }

    const E = lineCandidates[0];
    const F = lineCandidates[lineCandidates.length - 1];
    const G = candidates.find(
      (point) =>
        point.id !== E.id &&
        point.id !== F.id &&
        isPointBetween(E, point, F, 0.035) &&
        areDistancesEqual(distance(E, point), distance(point, F), 9),
    );
    const segmentCG = G ? segmentExistsBetween(objects, C.id, G.id) : undefined;
    if (!G || !segmentCG) {
      continue;
    }

    return {
      pointA: "A",
      pointB: "B",
      pointC: "C",
      pointD: D.id,
      pointE: E.id,
      pointF: F.id,
      pointG: G.id,
      segmentAB: segmentAB.id,
      segmentEF: segmentExistsBetween(objects, E.id, F.id)?.id,
      segmentEG: segmentExistsBetween(objects, E.id, G.id)?.id,
      segmentGF: segmentExistsBetween(objects, G.id, F.id)?.id,
      segmentCE: segmentExistsBetween(objects, C.id, E.id)?.id,
      segmentCF: segmentExistsBetween(objects, C.id, F.id)?.id,
      segmentCG: segmentCG.id,
      circleC: circleC.id,
    };
  }

  return undefined;
}

export function resolveBook1Prop15Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const D = getPoint(objects, "D");
  const E = getPoint(objects, "E");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentCD = segmentExistsBetween(objects, "C", "D");
  if (!A || !B || !C || !D || !E || !segmentAB || !segmentCD) {
    return undefined;
  }

  if (!isPointBetween(A, E, B, 0.035) || !isPointBetween(C, E, D, 0.035)) {
    return undefined;
  }

  return {
    pointA: A.id,
    pointB: B.id,
    pointC: C.id,
    pointD: D.id,
    pointE: E.id,
    segmentAB: segmentAB.id,
    segmentCD: segmentCD.id,
  };
}

export function resolveBook1Prop16Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const D = getPoint(objects, "D");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentCD = segmentExistsBetween(objects, "C", "D");
  if (!A || !B || !C || !D || !segmentAB || !segmentAC || !segmentBC || !segmentCD) {
    return undefined;
  }

  if (!isPointOnRay(B, C, D, 0.035) || rayParameter(B, C, D) <= 1.02) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C", "D"].includes(point.id));
  for (const E of candidates) {
    if (!isPointBetween(A, E, C, 0.035) || !areDistancesEqual(distance(A, E), distance(E, C), 9)) {
      continue;
    }

    const segmentBE = segmentExistsBetween(objects, B.id, E.id);
    if (!segmentBE) {
      continue;
    }

    for (const F of candidates) {
      if (F.id === E.id || !arePointsCollinear(B, E, F, 0.035) || rayParameter(B, E, F) <= 1.02) {
        continue;
      }

      const segmentEF = segmentExistsBetween(objects, E.id, F.id);
      const segmentFC = segmentExistsBetween(objects, F.id, C.id);
      if (!segmentEF || !segmentFC || !areDistancesEqual(distance(B, E), distance(E, F), 9)) {
        continue;
      }

      return {
        pointA: A.id,
        pointB: B.id,
        pointC: C.id,
        pointD: D.id,
        pointE: E.id,
        pointF: F.id,
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentBC: segmentBC.id,
        segmentCD: segmentCD.id,
        segmentBE: segmentBE.id,
        segmentEF: segmentEF.id,
        segmentFC: segmentFC.id,
        extensionBE: extendedLineExists(objects, B.id, E.id)?.id,
      };
    }
  }

  return undefined;
}

export function resolveBook1Prop17Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  if (!A || !B || !C || !segmentAB || !segmentBC || !segmentAC) {
    return undefined;
  }

  const D = allNamedPoints(objects).find(
    (point) => !["A", "B", "C"].includes(point.id) && isPointOnRay(B, C, point, 0.035) && rayParameter(B, C, point) > 1.02,
  );
  if (!D) {
    return undefined;
  }

  const segmentCD = segmentExistsBetween(objects, C.id, D.id);
  const extensionCD = extendedLineExists(objects, C.id, B.id) ?? extendedLineExists(objects, B.id, C.id);
  if (!segmentCD && !extensionCD) {
    return undefined;
  }

  return {
    pointA: A.id,
    pointB: B.id,
    pointC: C.id,
    pointD: D.id,
    segmentAB: segmentAB.id,
    segmentBC: segmentBC.id,
    segmentAC: segmentAC.id,
    segmentCD: segmentCD?.id ?? extensionCD?.id,
    exteriorAngleACD: "ACD",
  };
}

export function resolveBook1Prop18Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  if (!A || !B || !C || !segmentAB || !segmentBC || !segmentAC || distance(A, C) <= distance(A, B) + 2) {
    return undefined;
  }

  const D = allNamedPoints(objects).find(
    (point) =>
      !["A", "B", "C"].includes(point.id) &&
      isPointBetween(A, point, C, 0.035) &&
      areDistancesEqual(distance(A, point), distance(A, B), 9),
  );
  const segmentBD = D ? segmentExistsBetween(objects, B.id, D.id) : undefined;
  if (!D || !segmentBD) {
    return undefined;
  }

  return {
    pointA: A.id,
    pointB: B.id,
    pointC: C.id,
    pointD: D.id,
    segmentAB: segmentAB.id,
    segmentBC: segmentBC.id,
    segmentAC: segmentAC.id,
    segmentAD: segmentExistsBetween(objects, A.id, D.id)?.id,
    segmentBD: segmentBD.id,
  };
}

export function resolveBook1Prop20Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  if (!A || !B || !C || !segmentAB || !segmentBC || !segmentAC) {
    return undefined;
  }

  const D = allNamedPoints(objects).find(
    (point) =>
      !["A", "B", "C"].includes(point.id) &&
      isPointOnRay(B, A, point, 0.035) &&
      rayParameter(B, A, point) > 1.02 &&
      areDistancesEqual(distance(A, point), distance(A, C), 9),
  );
  const segmentDC = D ? segmentExistsBetween(objects, D.id, C.id) : undefined;
  if (!D || !segmentDC) {
    return undefined;
  }

  return {
    pointA: A.id,
    pointB: B.id,
    pointC: C.id,
    pointD: D.id,
    segmentAB: segmentAB.id,
    segmentBC: segmentBC.id,
    segmentAC: segmentAC.id,
    segmentAD: segmentExistsBetween(objects, A.id, D.id)?.id,
    segmentDC: segmentDC.id,
  };
}

function pointInTriangle(point: NonNullable<ReturnType<typeof getPoint>>, A: NonNullable<ReturnType<typeof getPoint>>, B: NonNullable<ReturnType<typeof getPoint>>, C: NonNullable<ReturnType<typeof getPoint>>) {
  const area = (P: typeof point, Q: typeof point, R: typeof point) => Math.abs((Q.x - P.x) * (R.y - P.y) - (R.x - P.x) * (Q.y - P.y));
  const whole = area(A, B, C);
  const parts = area(point, B, C) + area(A, point, C) + area(A, B, point);
  return whole > 1 && Math.abs(parts - whole) <= Math.max(whole * 0.035, 8);
}

export function resolveBook1Prop21Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const D = getPoint(objects, "D");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentBD = segmentExistsBetween(objects, "B", "D");
  const segmentDC = segmentExistsBetween(objects, "D", "C");
  if (!A || !B || !C || !D || !segmentAB || !segmentBC || !segmentAC || !segmentBD || !segmentDC || !pointInTriangle(D, A, B, C)) {
    return undefined;
  }

  const E = allNamedPoints(objects).find(
    (point) =>
      !["A", "B", "C", "D"].includes(point.id) &&
      isPointBetween(A, point, C, 0.035) &&
      isPointOnRay(B, D, point, 0.035) &&
      rayParameter(B, D, point) > 1.02,
  );
  const extensionBD = extendedLineExists(objects, D.id, B.id) ?? extendedLineExists(objects, B.id, D.id);
  if (!E || !extensionBD) {
    return undefined;
  }

  return {
    pointA: A.id,
    pointB: B.id,
    pointC: C.id,
    pointD: D.id,
    pointE: E.id,
    segmentAB: segmentAB.id,
    segmentBC: segmentBC.id,
    segmentAC: segmentAC.id,
    segmentBD: segmentBD.id,
    segmentDC: segmentDC.id,
    segmentBE: segmentExistsBetween(objects, B.id, E.id)?.id ?? extensionBD.id,
    segmentEC: segmentExistsBetween(objects, E.id, C.id)?.id,
  };
}

function segmentIsParallel(objects: GeometryObject[], first: NonNullable<ReturnType<typeof segmentExistsBetween>>, second: NonNullable<ReturnType<typeof segmentExistsBetween>>, tolerance = 0.035) {
  const firstStart = getPoint(objects, first.p1);
  const firstEnd = getPoint(objects, first.p2);
  const secondStart = getPoint(objects, second.p1);
  const secondEnd = getPoint(objects, second.p2);
  if (!firstStart || !firstEnd || !secondStart || !secondEnd) {
    return false;
  }

  const firstLength = distance(firstStart, firstEnd);
  const secondLength = distance(secondStart, secondEnd);
  if (firstLength < 1 || secondLength < 1) {
    return false;
  }

  const cross =
    ((firstEnd.x - firstStart.x) * (secondEnd.y - secondStart.y) -
      (firstEnd.y - firstStart.y) * (secondEnd.x - secondStart.x)) /
    (firstLength * secondLength);
  return Math.abs(cross) <= tolerance;
}

function segmentSupportsPoint(objects: GeometryObject[], segment: NonNullable<ReturnType<typeof segmentExistsBetween>>, point: NonNullable<ReturnType<typeof getPoint>>) {
  const start = getPoint(objects, segment.p1);
  const end = getPoint(objects, segment.p2);
  if (!start || !end || !arePointsCollinear(start, end, point, 0.035)) {
    return false;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return false;
  }

  const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  return segment.ray ? t >= -0.03 : t >= -0.04 && t <= 1.04;
}

function transversalSegmentForPoints(objects: GeometryObject[], points: Array<NonNullable<ReturnType<typeof getPoint>>>) {
  const direct = segmentExistsBetween(objects, points[0].id, points[points.length - 1].id);
  if (direct) {
    return direct;
  }

  return allSegments(objects).find((segment) => points.every((point) => segmentSupportsPoint(objects, segment, point)));
}

export function resolveBook1Prop24Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F"]);
  if (!points) {
    return undefined;
  }

  const segments = segmentContext(objects, [
    ["segmentAB", "A", "B"],
    ["segmentAC", "A", "C"],
    ["segmentBC", "B", "C"],
    ["segmentDE", "D", "E"],
    ["segmentDF", "D", "F"],
    ["segmentEF", "E", "F"],
  ]);
  if (!segments) {
    return undefined;
  }

  if (
    !areDistancesEqual(distance(points.A, points.B), distance(points.D, points.E), 9) ||
    !areDistancesEqual(distance(points.A, points.C), distance(points.D, points.F), 9) ||
    angleAt(points.A, points.B, points.C) <= angleAt(points.D, points.E, points.F) + 0.02
  ) {
    return undefined;
  }

  const sourceAngle = angleAt(points.A, points.B, points.C);
  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C", "D", "E", "F"].includes(point.id));
  for (const G of candidates) {
    const segmentDG = segmentExistsBetween(objects, "D", G.id);
    const segmentEG = segmentExistsBetween(objects, "E", G.id);
    const segmentFG = segmentExistsBetween(objects, "F", G.id);
    if (!segmentDG || !segmentEG || !segmentFG) {
      continue;
    }

    if (
      !areDistancesEqual(distance(points.D, G), distance(points.D, points.F), 9) ||
      !areAnglesEqual(angleAt(points.D, points.E, G), sourceAngle, 0.08)
    ) {
      continue;
    }

    return {
      pointA: "A",
      pointB: "B",
      pointC: "C",
      pointD: "D",
      pointE: "E",
      pointF: "F",
      pointG: G.id,
      ...segments,
      segmentDG: segmentDG.id,
      segmentEG: segmentEG.id,
      segmentFG: segmentFG.id,
    };
  }

  return undefined;
}

export function resolveBook1Prop28Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F", "G", "H"]);
  const segments = segmentContext(objects, [
    ["segmentAB", "A", "B"],
    ["segmentCD", "C", "D"],
    ["segmentEF", "E", "F"],
  ]);
  if (!points || !segments) {
    return undefined;
  }

  if (
    !isPointBetween(points.A, points.G, points.B, 0.035) ||
    !isPointBetween(points.C, points.H, points.D, 0.035) ||
    !isPointBetween(points.E, points.G, points.F, 0.035) ||
    !isPointBetween(points.E, points.H, points.F, 0.035)
  ) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    pointE: "E",
    pointF: "F",
    pointG: "G",
    pointH: "H",
    ...segments,
  };
}

export function resolveBook1Prop30Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F"]);
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentEF = segmentExistsBetween(objects, "E", "F");
  const segmentCD = segmentExistsBetween(objects, "C", "D");
  if (!points || !segmentAB || !segmentEF || !segmentCD) {
    return undefined;
  }

  if (!segmentIsParallel(objects, segmentAB, segmentEF) || !segmentIsParallel(objects, segmentCD, segmentEF)) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C", "D", "E", "F"].includes(point.id));
  const onAB = candidates.filter((point) => isPointBetween(points.A, point, points.B, 0.04));
  const onEF = candidates.filter((point) => isPointBetween(points.E, point, points.F, 0.04));
  const onCD = candidates.filter((point) => isPointBetween(points.C, point, points.D, 0.04));

  for (const G of onAB) {
    for (const H of onEF) {
      for (const K of onCD) {
        if (!arePointsCollinear(G, H, K, 0.035)) {
          continue;
        }

        const transversal = transversalSegmentForPoints(objects, [G, H, K]);
        if (!transversal) {
          continue;
        }

        return {
          pointA: "A",
          pointB: "B",
          pointC: "C",
          pointD: "D",
          pointE: "E",
          pointF: "F",
          pointG: G.id,
          pointH: H.id,
          pointK: K.id,
          segmentAB: segmentAB.id,
          segmentEF: segmentEF.id,
          segmentCD: segmentCD.id,
          segmentGK: transversal.id,
          segmentGH: segmentExistsBetween(objects, G.id, H.id)?.id ?? transversal.id,
          segmentHK: segmentExistsBetween(objects, H.id, K.id)?.id ?? transversal.id,
        };
      }
    }
  }

  return undefined;
}

export function resolveBook1Prop31Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  if (!A || !B || !C || !segmentBC) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C"].includes(point.id));
  for (const D of candidates) {
    if (!isPointBetween(B, D, C, 0.04)) {
      continue;
    }

    const segmentAD = segmentExistsBetween(objects, A.id, D.id);
    if (!segmentAD) {
      continue;
    }

    for (const E of candidates) {
      if (E.id === D.id) {
        continue;
      }

      const segmentAE = segmentExistsBetween(objects, A.id, E.id);
      const produced = extendedLineExists(objects, A.id, E.id) ?? extendedLineExists(objects, E.id, A.id);
      if (!segmentAE || !produced) {
        continue;
      }

      if (!areAnglesEqual(angleAt(A, D, E), angleAt(D, A, C), 0.08)) {
        continue;
      }

      return {
        pointA: A.id,
        pointB: B.id,
        pointC: C.id,
        pointD: D.id,
        pointE: E.id,
        pointF: E.id,
        segmentBC: segmentBC.id,
        segmentAD: segmentAD.id,
        segmentAE: segmentAE.id,
        segmentAF: produced.id,
      };
    }
  }

  return undefined;
}

export function resolveBook1Prop32Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  if (!A || !B || !C || !segmentAB || !segmentAC || !segmentBC) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C"].includes(point.id));
  const D = candidates.find((point) => isPointOnRay(B, C, point, 0.035) && rayParameter(B, C, point) > 1.02);
  if (!D) {
    return undefined;
  }

  const segmentCD = segmentExistsBetween(objects, C.id, D.id);
  const extensionCD = extendedLineExists(objects, B.id, C.id) ?? extendedLineExists(objects, C.id, B.id);
  if (!segmentCD && !extensionCD) {
    return undefined;
  }

  const E = candidates.find((point) => {
    if (point.id === D.id) {
      return false;
    }

    const segmentCE = segmentExistsBetween(objects, C.id, point.id);
    return Boolean(segmentCE && segmentIsParallel(objects, segmentCE, segmentAB));
  });
  const segmentCE = E ? segmentExistsBetween(objects, C.id, E.id) : undefined;
  if (!E || !segmentCE) {
    return undefined;
  }

  return {
    pointA: A.id,
    pointB: B.id,
    pointC: C.id,
    pointD: D.id,
    pointE: E.id,
    segmentAB: segmentAB.id,
    segmentAC: segmentAC.id,
    segmentBC: segmentBC.id,
    segmentCD: segmentCD?.id ?? extensionCD?.id,
    segmentBD: segmentCD?.id ?? extensionCD?.id,
    segmentCE: segmentCE.id,
  };
}

export function resolveBook1Prop33Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D"]);
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentCD = segmentExistsBetween(objects, "C", "D");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentBD = segmentExistsBetween(objects, "B", "D");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  if (!points || !segmentAB || !segmentCD || !segmentAC || !segmentBD || !segmentBC) {
    return undefined;
  }

  if (
    !areDistancesEqual(distance(points.A, points.B), distance(points.C, points.D), 9) ||
    !segmentIsParallel(objects, segmentAB, segmentCD)
  ) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    segmentAB: segmentAB.id,
    segmentCD: segmentCD.id,
    segmentAC: segmentAC.id,
    segmentBD: segmentBD.id,
    segmentBC: segmentBC.id,
  };
}

export function resolveBook1Prop34Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D"]);
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentBD = segmentExistsBetween(objects, "B", "D");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentCD = segmentExistsBetween(objects, "C", "D");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  if (!points || !segmentAC || !segmentBD || !segmentAB || !segmentCD || !segmentBC) {
    return undefined;
  }

  if (!segmentIsParallel(objects, segmentAC, segmentBD) || !segmentIsParallel(objects, segmentAB, segmentCD)) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    segmentAC: segmentAC.id,
    segmentBD: segmentBD.id,
    segmentAB: segmentAB.id,
    segmentCD: segmentCD.id,
    segmentBC: segmentBC.id,
  };
}

function segmentBetweenOrSupporting(objects: GeometryObject[], firstId: string, secondId: string) {
  const direct = segmentExistsBetween(objects, firstId, secondId);
  if (direct) {
    return direct;
  }

  const first = getPoint(objects, firstId);
  const second = getPoint(objects, secondId);
  if (!first || !second) {
    return undefined;
  }

  return allSegments(objects).find((segment) => segmentSupportsPoint(objects, segment, first) && segmentSupportsPoint(objects, segment, second));
}

export function resolveBook1Prop35Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F"]);
  if (!points) {
    return undefined;
  }

  const segmentAF = segmentBetweenOrSupporting(objects, "A", "F");
  const segmentAD = segmentExistsBetween(objects, "A", "D");
  const segmentEF = segmentExistsBetween(objects, "E", "F");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentDC = segmentExistsBetween(objects, "D", "C");
  const segmentEB = segmentExistsBetween(objects, "E", "B");
  const segmentFC = segmentExistsBetween(objects, "F", "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  if (!segmentAF || !segmentAD || !segmentEF || !segmentAB || !segmentDC || !segmentEB || !segmentFC || !segmentBC) {
    return undefined;
  }

  if (
    !arePointsCollinear(points.A, points.D, points.E, 0.035) ||
    !arePointsCollinear(points.A, points.D, points.F, 0.035) ||
    !segmentIsParallel(objects, segmentAD, segmentBC) ||
    !segmentIsParallel(objects, segmentEF, segmentBC) ||
    !segmentIsParallel(objects, segmentAB, segmentDC) ||
    !segmentIsParallel(objects, segmentEB, segmentFC)
  ) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C", "D", "E", "F"].includes(point.id));
  const G = candidates.find(
    (point) =>
      arePointsCollinear(points.E, points.B, point, 0.04) &&
      arePointsCollinear(points.D, points.C, point, 0.04),
  );
  if (!G) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    pointE: "E",
    pointF: "F",
    pointG: G.id,
    segmentAF: segmentAF.id,
    segmentAD: segmentAD.id,
    segmentEF: segmentEF.id,
    segmentAB: segmentAB.id,
    segmentDC: segmentDC.id,
    segmentCD: segmentDC.id,
    segmentEB: segmentEB.id,
    segmentBE: segmentEB.id,
    segmentFC: segmentFC.id,
    segmentCF: segmentFC.id,
    segmentBC: segmentBC.id,
    segmentAE: segmentBetweenOrSupporting(objects, "A", "E")?.id ?? segmentAF.id,
    segmentDF: segmentBetweenOrSupporting(objects, "D", "F")?.id ?? segmentAF.id,
    segmentDG: segmentBetweenOrSupporting(objects, "D", G.id)?.id ?? segmentDC.id,
    segmentGD: segmentBetweenOrSupporting(objects, G.id, "D")?.id ?? segmentDC.id,
    segmentEG: segmentBetweenOrSupporting(objects, "E", G.id)?.id ?? segmentEB.id,
    segmentGE: segmentBetweenOrSupporting(objects, G.id, "E")?.id ?? segmentEB.id,
    segmentBG: segmentBetweenOrSupporting(objects, "B", G.id)?.id ?? segmentEB.id,
    segmentGB: segmentBetweenOrSupporting(objects, G.id, "B")?.id ?? segmentEB.id,
    segmentGC: segmentBetweenOrSupporting(objects, G.id, "C")?.id ?? segmentDC.id,
    segmentCG: segmentBetweenOrSupporting(objects, "C", G.id)?.id ?? segmentDC.id,
  };
}

export function resolveBook1Prop36Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F", "G", "H"]);
  if (!points) {
    return undefined;
  }

  const segmentAH = segmentBetweenOrSupporting(objects, "A", "H");
  const segmentBG = segmentBetweenOrSupporting(objects, "B", "G");
  const segmentAD = segmentExistsBetween(objects, "A", "D");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentDC = segmentExistsBetween(objects, "D", "C");
  const segmentEH = segmentExistsBetween(objects, "E", "H");
  const segmentFG = segmentExistsBetween(objects, "F", "G");
  const segmentEF = segmentExistsBetween(objects, "E", "F");
  const segmentHG = segmentExistsBetween(objects, "H", "G");
  const segmentBE = segmentExistsBetween(objects, "B", "E");
  const segmentCH = segmentExistsBetween(objects, "C", "H");
  if (
    !segmentAH ||
    !segmentBG ||
    !segmentAD ||
    !segmentBC ||
    !segmentAB ||
    !segmentDC ||
    !segmentEH ||
    !segmentFG ||
    !segmentEF ||
    !segmentHG ||
    !segmentBE ||
    !segmentCH
  ) {
    return undefined;
  }

  if (
    !arePointsCollinear(points.A, points.D, points.E, 0.035) ||
    !arePointsCollinear(points.A, points.D, points.H, 0.035) ||
    !arePointsCollinear(points.B, points.C, points.F, 0.035) ||
    !arePointsCollinear(points.B, points.C, points.G, 0.035) ||
    !areDistancesEqual(distance(points.B, points.C), distance(points.F, points.G), 9) ||
    !segmentIsParallel(objects, segmentAH, segmentBG)
  ) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    pointE: "E",
    pointF: "F",
    pointG: "G",
    pointH: "H",
    segmentAH: segmentAH.id,
    segmentBG: segmentBG.id,
    segmentAD: segmentAD.id,
    segmentBC: segmentBC.id,
    segmentAB: segmentAB.id,
    segmentDC: segmentDC.id,
    segmentCD: segmentDC.id,
    segmentEH: segmentEH.id,
    segmentFG: segmentFG.id,
    segmentEF: segmentEF.id,
    segmentHG: segmentHG.id,
    segmentGH: segmentHG.id,
    segmentBE: segmentBE.id,
    segmentEB: segmentBE.id,
    segmentCH: segmentCH.id,
  };
}

export function resolveBook1Prop37Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D"]);
  if (!points) {
    return undefined;
  }

  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentDB = segmentExistsBetween(objects, "D", "B");
  const segmentDC = segmentExistsBetween(objects, "D", "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentAD = segmentExistsBetween(objects, "A", "D");
  if (!segmentAB || !segmentAC || !segmentDB || !segmentDC || !segmentBC || !segmentAD || !segmentIsParallel(objects, segmentAD, segmentBC)) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C", "D"].includes(point.id));
  for (const E of candidates) {
    if (!arePointsCollinear(points.A, points.D, E, 0.04)) {
      continue;
    }

    const segmentBE = segmentExistsBetween(objects, "B", E.id);
    if (!segmentBE || !segmentIsParallel(objects, segmentBE, segmentAC)) {
      continue;
    }

    for (const F of candidates) {
      if (F.id === E.id || !arePointsCollinear(points.A, points.D, F, 0.04)) {
        continue;
      }

      const segmentCF = segmentExistsBetween(objects, "C", F.id);
      if (!segmentCF || !segmentIsParallel(objects, segmentCF, segmentDB)) {
        continue;
      }

      return {
        pointA: "A",
        pointB: "B",
        pointC: "C",
        pointD: "D",
        pointE: E.id,
        pointF: F.id,
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentCA: segmentAC.id,
        segmentDB: segmentDB.id,
        segmentDC: segmentDC.id,
        segmentBC: segmentBC.id,
        segmentAD: segmentAD.id,
        segmentBE: segmentBE.id,
        segmentEB: segmentBE.id,
        segmentCF: segmentCF.id,
        segmentEA: segmentBetweenOrSupporting(objects, E.id, "A")?.id ?? segmentAD.id,
        segmentDF: segmentBetweenOrSupporting(objects, "D", F.id)?.id ?? segmentAD.id,
      };
    }
  }

  return undefined;
}

export function resolveBook1Prop38Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E", "F"]);
  if (!points) {
    return undefined;
  }

  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentDE = segmentExistsBetween(objects, "D", "E");
  const segmentDF = segmentExistsBetween(objects, "D", "F");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentEF = segmentExistsBetween(objects, "E", "F");
  const segmentBF = segmentBetweenOrSupporting(objects, "B", "F");
  const segmentAD = segmentBetweenOrSupporting(objects, "A", "D");
  if (!segmentAB || !segmentAC || !segmentDE || !segmentDF || !segmentBC || !segmentEF || !segmentBF || !segmentAD) {
    return undefined;
  }

  if (
    !areDistancesEqual(distance(points.B, points.C), distance(points.E, points.F), 9) ||
    !arePointsCollinear(points.B, points.C, points.E, 0.04) ||
    !arePointsCollinear(points.B, points.C, points.F, 0.04) ||
    !segmentIsParallel(objects, segmentBF, segmentAD)
  ) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C", "D", "E", "F"].includes(point.id));
  for (const G of candidates) {
    if (!arePointsCollinear(points.A, points.D, G, 0.04)) {
      continue;
    }

    const segmentBG = segmentExistsBetween(objects, "B", G.id);
    if (!segmentBG || !segmentIsParallel(objects, segmentBG, segmentAC)) {
      continue;
    }

    for (const H of candidates) {
      if (H.id === G.id || !arePointsCollinear(points.A, points.D, H, 0.04)) {
        continue;
      }

      const segmentFH = segmentExistsBetween(objects, "F", H.id);
      if (!segmentFH || !segmentIsParallel(objects, segmentFH, segmentDE)) {
        continue;
      }

      return {
        pointA: "A",
        pointB: "B",
        pointC: "C",
        pointD: "D",
        pointE: "E",
        pointF: "F",
        pointG: G.id,
        pointH: H.id,
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentCA: segmentAC.id,
        segmentDE: segmentDE.id,
        segmentED: segmentDE.id,
        segmentDF: segmentDF.id,
        segmentBC: segmentBC.id,
        segmentEF: segmentEF.id,
        segmentBF: segmentBF.id,
        segmentGH: segmentBetweenOrSupporting(objects, G.id, H.id)?.id ?? segmentAD.id,
        segmentBG: segmentBG.id,
        segmentGB: segmentBG.id,
        segmentFH: segmentFH.id,
        segmentAG: segmentBetweenOrSupporting(objects, "A", G.id)?.id ?? segmentAD.id,
        segmentDH: segmentBetweenOrSupporting(objects, "D", H.id)?.id ?? segmentAD.id,
      };
    }
  }

  return undefined;
}

export function resolveBook1Prop41Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "E"]);
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentCD = segmentExistsBetween(objects, "C", "D");
  const segmentAD = segmentExistsBetween(objects, "A", "D");
  const segmentEB = segmentExistsBetween(objects, "E", "B");
  const segmentEC = segmentExistsBetween(objects, "E", "C");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  if (!points || !segmentAB || !segmentBC || !segmentCD || !segmentAD || !segmentEB || !segmentEC || !segmentAC) {
    return undefined;
  }

  if (
    !arePointsCollinear(points.A, points.D, points.E, 0.04) ||
    !segmentIsParallel(objects, segmentAD, segmentBC) ||
    !segmentIsParallel(objects, segmentAB, segmentCD)
  ) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    pointE: "E",
    segmentAB: segmentAB.id,
    segmentBC: segmentBC.id,
    segmentCD: segmentCD.id,
    segmentDC: segmentCD.id,
    segmentAD: segmentAD.id,
    segmentEB: segmentEB.id,
    segmentBE: segmentEB.id,
    segmentEC: segmentEC.id,
    segmentCE: segmentEC.id,
    segmentAC: segmentAC.id,
  };
}

export function resolveBook1Prop42Context(objects: GeometryObject[]): ProofContext | undefined {
  const points = requiredPointMap(objects, ["A", "B", "C", "D", "H", "K"]);
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");
  const segmentDH = segmentExistsBetween(objects, "D", "H");
  const segmentDK = segmentExistsBetween(objects, "D", "K");
  if (!points || !segmentAB || !segmentAC || !segmentBC || !segmentDH || !segmentDK) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C", "D", "H", "K"].includes(point.id));
  const E = candidates.find(
    (point) =>
      isPointBetween(points.B, point, points.C, 0.04) &&
      areDistancesEqual(distance(points.B, point), distance(point, points.C), 9),
  );
  if (!E) {
    return undefined;
  }

  const segmentAE = segmentExistsBetween(objects, "A", E.id);
  const segmentEC = segmentBetweenOrSupporting(objects, E.id, "C");
  const segmentBE = segmentBetweenOrSupporting(objects, "B", E.id);
  if (!segmentAE || !segmentEC || !segmentBE) {
    return undefined;
  }

  for (const F of candidates) {
    if (F.id === E.id) {
      continue;
    }

    const segmentEF = segmentExistsBetween(objects, E.id, F.id);
    if (!segmentEF || !areAnglesEqual(angleAt(E, points.C, F), angleAt(points.D, points.H, points.K), 0.08)) {
      continue;
    }

    for (const G of candidates) {
      if (G.id === E.id || G.id === F.id) {
        continue;
      }

      const segmentAG = segmentExistsBetween(objects, "A", G.id);
      const segmentCG = segmentExistsBetween(objects, "C", G.id);
      const segmentFG = segmentExistsBetween(objects, F.id, G.id);
      if (!segmentAG || !segmentCG || !segmentFG) {
        continue;
      }

      if (
        !arePointsCollinear(points.A, F, G, 0.04) ||
        !segmentIsParallel(objects, segmentAG, segmentEC) ||
        !segmentIsParallel(objects, segmentFG, segmentEC) ||
        !segmentIsParallel(objects, segmentCG, segmentEF)
      ) {
        continue;
      }

      return {
        pointA: "A",
        pointB: "B",
        pointC: "C",
        pointD: "D",
        pointE: E.id,
        pointF: F.id,
        pointG: G.id,
        pointH: "H",
        pointK: "K",
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentBC: segmentBC.id,
        segmentBE: segmentBE.id,
        segmentEC: segmentEC.id,
        segmentAE: segmentAE.id,
        segmentDH: segmentDH.id,
        segmentDK: segmentDK.id,
        segmentEF: segmentEF.id,
        segmentFE: segmentEF.id,
        segmentAG: segmentAG.id,
        segmentCG: segmentCG.id,
        segmentFG: segmentFG.id,
      };
    }
  }

  return undefined;
}

export function resolveBook1Prop43Context(objects: GeometryObject[]): ProofContext | undefined {
  const requiredPoints = ["A", "B", "C", "D", "E", "F", "G", "H", "K"];
  const points = Object.fromEntries(requiredPoints.map((id) => [id, getPoint(objects, id)]));
  if (requiredPoints.some((id) => !points[id])) {
    return undefined;
  }

  const requiredSegments = ["AB", "BC", "CD", "DA", "AC", "AE", "EK", "KH", "HA", "KF", "FC", "CG", "GK"];
  const segments = Object.fromEntries(
    requiredSegments.map((label) => [label, segmentExistsBetween(objects, label[0], label[1])]),
  );
  if (requiredSegments.some((label) => !segments[label])) {
    return undefined;
  }

  const A = points.A!;
  const C = points.C!;
  const K = points.K!;
  if (!isPointBetween(A, K, C, 0.04)) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
    pointE: "E",
    pointF: "F",
    pointG: "G",
    pointH: "H",
    pointK: "K",
    ...Object.fromEntries(Object.entries(segments).map(([label, segment]) => [`segment${label}`, segment?.id])),
    complementBK: "complementBK",
    complementKD: "complementKD",
  };
}
