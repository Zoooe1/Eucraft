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
    .filter(Boolean)
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
  const extensionAB = extendedLineExists(objects, "A", "B");
  const extensionAC = extendedLineExists(objects, "A", "C");
  if (!points || !segments || !extensionAB || !extensionAC) {
    return undefined;
  }

  if (!areDistancesEqual(distance(points.A, points.B), distance(points.A, points.C))) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    extensionAB: extensionAB.id,
    extensionAC: extensionAC.id,
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

  if (!areDistancesEqual(distance(points.A, points.B), distance(points.A, points.C))) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
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
  if (!points || !segments) {
    return undefined;
  }

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: "D",
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
    !areDistancesEqual(distance(points.B, points.C), distance(points.E, points.F))
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

export function resolveBook1Prop9Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAC = segmentExistsBetween(objects, "A", "C");
  if (!A || !B || !C || !segmentAB || !segmentAC) {
    return undefined;
  }

  const candidates = allNamedPoints(objects).filter((point) => !["A", "B", "C"].includes(point.id));
  const sideABPoints = candidates.filter((point) => isPointBetween(A, point, B));
  const sideACPoints = candidates.filter((point) => isPointBetween(A, point, C));

  for (const D of sideABPoints) {
    for (const E of sideACPoints) {
      if (D.id === E.id || !areDistancesEqual(distance(A, D), distance(A, E))) {
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
          !areDistancesEqual(distance(D, F), deLength) ||
          !areDistancesEqual(distance(E, F), deLength) ||
          !areAnglesEqual(angleAt(A, B, F), angleAt(A, F, C), 0.055)
        ) {
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
          segmentAC: segmentAC.id,
          segmentAD: segmentExistsBetween(objects, "A", D.id)?.id ?? segmentAB.id,
          segmentAE: segmentExistsBetween(objects, "A", E.id)?.id ?? segmentAC.id,
          segmentDE: segmentDE.id,
          segmentDF: segmentDF.id,
          segmentEF: segmentEF.id,
          segmentAF: segmentAF.id,
        };
      }
    }
  }

  return undefined;
}

export function resolveBook1Prop10Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  if (!A || !B || !segmentAB) {
    return undefined;
  }

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

    for (const D of candidates) {
      if (D.id === C.id || !isPointBetween(A, D, B)) {
        continue;
      }

      const segmentCD = segmentExistsBetween(objects, C.id, D.id);
      if (!segmentCD || !areDistancesEqual(distance(A, D), distance(D, B))) {
        continue;
      }

      return {
        pointA: "A",
        pointB: "B",
        pointC: C.id,
        pointD: D.id,
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentBC: segmentBC.id,
        segmentCD: segmentCD.id,
        segmentAD: segmentExistsBetween(objects, "A", D.id)?.id,
        segmentBD: segmentExistsBetween(objects, "B", D.id)?.id,
      };
    }
  }

  return undefined;
}
