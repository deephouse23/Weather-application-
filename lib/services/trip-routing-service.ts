/**
 * Trip Routing Service
 *
 * Pure routing logic — no fetches. Used by /api/travel/trip-score to:
 *  - measure great-circle distance between two points (haversine)
 *  - find the nearest waypoint on an interstate corridor to a given point
 *  - match an origin/destination pair to the best US interstate corridor and
 *    return the slice of waypoints that connects them
 *  - compute the great-circle midpoint between two airports for fly-mode
 *    en-route hazard scoring
 */

export interface MatchedCorridor {
  name: string;
  matchedSegment: {
    startIdx: number;
    endIdx: number;
    /** Waypoints from startIdx to endIdx inclusive, in route-of-travel order. */
    waypoints: number[][];
  };
  /** Total number of waypoints on the parent corridor. */
  totalCorridorLength: number;
}

/** How close (km) origin/dest must be to a corridor path to consider it a match. */
const CORRIDOR_MATCH_RADIUS_KM = 150;
const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Great-circle distance in meters between two lat/lon points (haversine).
 * Stable for short and antipodal pairs; sufficient for routing distances.
 */
export function haversineMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const phi1 = toRad(a.lat);
  const phi2 = toRad(b.lat);
  const dPhi = toRad(b.lat - a.lat);
  const dLambda = toRad(b.lon - a.lon);

  const sinDPhi = Math.sin(dPhi / 2);
  const sinDLambda = Math.sin(dLambda / 2);
  const h =
    sinDPhi * sinDPhi +
    Math.cos(phi1) * Math.cos(phi2) * sinDLambda * sinDLambda;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

/**
 * Find the index of the waypoint nearest to `point`. Each waypoint is
 * `[lat, lon]` to match the public/data/us-interstates.json schema.
 */
export function nearestWaypointIndex(
  point: { lat: number; lon: number },
  waypoints: number[][],
): { idx: number; distanceM: number } {
  let bestIdx = 0;
  let bestDist = Infinity;

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    if (!wp || wp.length < 2) continue;
    const dist = haversineMeters(point, { lat: wp[0], lon: wp[1] });
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }

  return { idx: bestIdx, distanceM: bestDist };
}

/**
 * Match origin + destination to a corridor. We pick the corridor where both
 * endpoints are within ~150 km of *some* waypoint on the path AND where the
 * sum of (origin→nearest, dest→nearest) is minimized — that combination
 * favors corridors that genuinely connect the two cities over corridors that
 * happen to pass near just one of them.
 *
 * Returns the slice of waypoints between the two nearest indices (inclusive),
 * oriented in route-of-travel order so the caller can iterate origin→dest.
 */
export function matchCorridor(
  origin: { lat: number; lon: number },
  dest: { lat: number; lon: number },
  corridors: { name: string; waypoints: number[][] }[],
): MatchedCorridor | null {
  const radiusM = CORRIDOR_MATCH_RADIUS_KM * 1000;

  let best: {
    name: string;
    waypoints: number[][];
    originIdx: number;
    destIdx: number;
    sumDistM: number;
  } | null = null;

  for (const corridor of corridors) {
    if (!corridor.waypoints || corridor.waypoints.length < 2) continue;

    const originHit = nearestWaypointIndex(origin, corridor.waypoints);
    const destHit = nearestWaypointIndex(dest, corridor.waypoints);

    if (originHit.distanceM > radiusM || destHit.distanceM > radiusM) continue;
    if (originHit.idx === destHit.idx) continue; // Need a real segment.

    const sum = originHit.distanceM + destHit.distanceM;
    if (!best || sum < best.sumDistM) {
      best = {
        name: corridor.name,
        waypoints: corridor.waypoints,
        originIdx: originHit.idx,
        destIdx: destHit.idx,
        sumDistM: sum,
      };
    }
  }

  if (!best) return null;

  const startIdx = Math.min(best.originIdx, best.destIdx);
  const endIdx = Math.max(best.originIdx, best.destIdx);
  let slice = best.waypoints.slice(startIdx, endIdx + 1);

  // Orient origin → destination so callers see the route in travel order.
  if (best.originIdx > best.destIdx) {
    slice = [...slice].reverse();
  }

  return {
    name: best.name,
    matchedSegment: {
      startIdx,
      endIdx,
      waypoints: slice,
    },
    totalCorridorLength: best.waypoints.length,
  };
}

/**
 * Great-circle (spherical) midpoint between two lat/lon points. Used as a
 * stand-in for "somewhere over the route" when scoring en-route hazards on
 * fly-mode trips. For short/medium domestic flights this is well within the
 * accuracy needed for SIGMET proximity checks.
 *
 * Reference: https://www.movable-type.co.uk/scripts/latlong.html#midpoint
 */
export function greatCircleMidpoint(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): { lat: number; lon: number } {
  const phi1 = toRad(a.lat);
  const phi2 = toRad(b.lat);
  const lambda1 = toRad(a.lon);
  const dLambda = toRad(b.lon - a.lon);

  const Bx = Math.cos(phi2) * Math.cos(dLambda);
  const By = Math.cos(phi2) * Math.sin(dLambda);

  const phiM = Math.atan2(
    Math.sin(phi1) + Math.sin(phi2),
    Math.sqrt((Math.cos(phi1) + Bx) ** 2 + By * By),
  );
  const lambdaM = lambda1 + Math.atan2(By, Math.cos(phi1) + Bx);

  // Normalize longitude into -180..180.
  const lonNorm = ((toDeg(lambdaM) + 540) % 360) - 180;

  return { lat: toDeg(phiM), lon: lonNorm };
}
