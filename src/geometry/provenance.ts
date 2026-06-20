import type { GeometryObject, GeometryCreationMethod, Point, Segment } from "./types";
import { getCircle, getPoint, getSegment } from "./operations";

export type ProvenanceMethod =
  | "given"
  | "free-point"
  | "straightedge"
  | "compass"
  | "set-compass-width"
  | "intersection"
  | "extend-line"
  | "theorem-action"
  | "system";

function objectById(objects: GeometryObject[], objectId: string): GeometryObject | undefined {
  return objects.find((object) => object.id === objectId);
}

function unique(ids: Array<string | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function normalizedCreatedBy(object: GeometryObject | undefined): ProvenanceMethod | undefined {
  const createdBy = object?.createdBy;
  const source = object?.source;

  if (!object) {
    return undefined;
  }

  if (object.type === "segment" && (createdBy === "Post.1" || source === "Post.1")) {
    return "straightedge";
  }

  if (object.type === "circle" && (createdBy === "Post.3" || source === "Post.3")) {
    return "compass";
  }

  if (object.type === "circle" && (createdBy === "I.2" || createdBy === "free-compass-transfer")) {
    return "set-compass-width";
  }

  if (object.type === "extended-line" && (createdBy === "Post.2" || source === "Post.2")) {
    return "extend-line";
  }

  const normalized: Record<string, ProvenanceMethod> = {
    given: "given",
    free: "free-point",
    "free-point": "free-point",
    snap: "free-point",
    straightedge: "straightedge",
    compass: "compass",
    "set-compass-width": "set-compass-width",
    "compass-transfer": "set-compass-width",
    intersection: "intersection",
    "extend-line": "extend-line",
    "theorem-action": "theorem-action",
    system: "system",
  };

  return createdBy ? normalized[createdBy] : undefined;
}

function normalizeMethod(method: ProvenanceMethod | GeometryCreationMethod): ProvenanceMethod | undefined {
  const normalized: Record<string, ProvenanceMethod> = {
    given: "given",
    free: "free-point",
    "free-point": "free-point",
    snap: "free-point",
    straightedge: "straightedge",
    "Post.1": "straightedge",
    compass: "compass",
    "Post.3": "compass",
    "set-compass-width": "set-compass-width",
    "compass-transfer": "set-compass-width",
    "I.2": "set-compass-width",
    intersection: "intersection",
    "extend-line": "extend-line",
    "Post.2": "extend-line",
    "theorem-action": "theorem-action",
    system: "system",
  };

  return normalized[method];
}

export function isFreePoint(objects: GeometryObject[], pointId: string): boolean {
  const point = getPoint(objects, pointId);
  return normalizedCreatedBy(point) === "free-point";
}

export function wasCreatedBy(objects: GeometryObject[], objectId: string, method: ProvenanceMethod | GeometryCreationMethod): boolean {
  return normalizedCreatedBy(objectById(objects, objectId)) === normalizeMethod(method);
}

function directDependencies(object: GeometryObject): string[] {
  if (object.type === "point") {
    return unique([...(object.dependencies ?? []), ...(object.parentObjectIds ?? [])]);
  }

  if (object.type === "segment") {
    return unique([...(object.dependencies ?? []), object.p1, object.p2]);
  }

  if (object.type === "circle") {
    return unique([...(object.dependencies ?? []), object.center, object.through, object.radiusSegment?.p1, object.radiusSegment?.p2]);
  }

  return unique([...(object.dependencies ?? []), object.from, object.through, object.baseSegment]);
}

export function dependsOnObject(
  objects: GeometryObject[],
  objectId: string | undefined,
  dependencyId: string | undefined,
  visited = new Set<string>(),
): boolean {
  if (!objectId || !dependencyId) {
    return false;
  }

  if (objectId === dependencyId) {
    return true;
  }

  if (visited.has(objectId)) {
    return false;
  }

  const object = objectById(objects, objectId);
  if (!object) {
    return false;
  }

  visited.add(objectId);
  const dependencies = directDependencies(object);
  return dependencies.includes(dependencyId) || dependencies.some((id) => dependsOnObject(objects, id, dependencyId, visited));
}

function segmentEndpoints(segment: Segment | undefined): [string, string] | undefined {
  return segment ? [segment.p1, segment.p2] : undefined;
}

function sameEndpointPair(a: [string, string] | undefined, b: [string, string] | undefined): boolean {
  return Boolean(a && b && ((a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])));
}

export function circleUsesRadiusSegment(objects: GeometryObject[], circleId: string, segmentId: string): boolean {
  const circle = getCircle(objects, circleId);
  const segment = getSegment(objects, segmentId);
  if (!circle || !segment) {
    return false;
  }

  return (
    sameEndpointPair(segmentEndpoints(segment), circle.radiusSegment ? [circle.radiusSegment.p1, circle.radiusSegment.p2] : undefined) ||
    sameEndpointPair(segmentEndpoints(segment), circle.through ? [circle.center, circle.through] : undefined)
  );
}

export function pointIsIntersectionOf(
  objects: GeometryObject[],
  pointId: string,
  objectAId: string | undefined,
  objectBId: string | undefined,
): boolean {
  const point = getPoint(objects, pointId);
  if (!point || !objectAId || !objectBId || normalizedCreatedBy(point) !== "intersection") {
    return false;
  }

  const parents = point.parentObjectIds ?? point.dependencies ?? [];
  return parents.includes(objectAId) && parents.includes(objectBId);
}

export function segmentEndpointIsConstructed(objects: GeometryObject[], segmentId: string, endpointId: string): boolean {
  const segment = getSegment(objects, segmentId);
  const point = getPoint(objects, endpointId);
  return Boolean(segment && point && (segment.p1 === endpointId || segment.p2 === endpointId) && normalizedCreatedBy(point) !== "free-point" && normalizedCreatedBy(point) !== "given");
}

export function objectDependsOnCircleUsingRadiusSegment(
  objects: GeometryObject[],
  objectId: string | undefined,
  segmentId: string,
  visited = new Set<string>(),
): boolean {
  if (!objectId || visited.has(objectId)) {
    return false;
  }

  const object = objectById(objects, objectId);
  if (!object) {
    return false;
  }

  visited.add(objectId);
  if (object.type === "circle" && circleUsesRadiusSegment(objects, object.id, segmentId)) {
    return true;
  }

  return directDependencies(object).some((id) => objectDependsOnCircleUsingRadiusSegment(objects, id, segmentId, visited));
}

export function pointHasIntersectionProvenance(point: Point | undefined): boolean {
  return Boolean(point && normalizedCreatedBy(point) === "intersection" && (point.parentObjectIds?.length || point.dependencies?.length));
}

export function objectWasCreatedByTheoremAction(object: GeometryObject | undefined, propositionId?: string): boolean {
  return Boolean(
    object &&
      normalizedCreatedBy(object) === "theorem-action" &&
      (!propositionId || object.createdByProposition === propositionId || object.source === propositionId || object.constructionStepId === propositionId),
  );
}
