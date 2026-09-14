/**
 * The scroll's tour of the five sites.
 *
 * The camera path itself is solved offline, against the elevation model, by
 * `scripts/build-sacred-valley-glb.py` — every position in `FLIGHT_PATH` is
 * known to stand in open air and every station's sight line is known to clear
 * the ground. What is left for the runtime is timing: how scroll maps onto
 * that path, and which site the copy is currently talking about.
 */

import {
  clamp01,
  lerp,
  samplePath,
  smoothstep,
} from "@/components/landing/sacred-valley-geometry";
import {
  FLIGHT_AIM,
  FLIGHT_PATH,
  FLIGHT_STATIONS,
  METERS_PER_UNIT,
} from "@/components/landing/sacred-valley-place";

export type SiteChapter = (typeof FLIGHT_STATIONS)[number]["id"];

type Station = { readonly id: SiteChapter; readonly index: number };

/**
 * The generated stations, widened to a plain array.
 *
 * Indexing the readonly tuple straight from the generated module hands back
 * `T | undefined` under `noUncheckedIndexedAccess`, which would sprinkle
 * non-null assertions through every one of these functions. Reading it once
 * here, and carrying the station objects themselves through the timeline
 * below, means nothing downstream indexes anything.
 */
const STATIONS: readonly Station[] = FLIGHT_STATIONS;

/**
 * Where a station sits along the path, as an exact share.
 *
 * Derived rather than stored: a progress float rounded for the generated file
 * does not land precisely on its own spline node, and the Catmull-Rom then
 * returns a point a little off the control point — enough to slide the aim off
 * its subject. The index is exact, so this is too.
 */
export function stationPathProgress(station: { index: number }): number {
  return station.index / (FLIGHT_PATH.length - 1);
}

export type CameraKeyframe = {
  position: [number, number, number];
  lookAt: [number, number, number];
};

/**
 * Share of the scroll spent lingering on a site rather than travelling.
 *
 * The sites are wildly unevenly spaced — Moray and Maras are 5 km apart, then
 * it is 30 km to Machu Picchu — so a scroll mapped straight onto the path
 * would blink past the two close ones and grind through the long leg. Holding
 * a fixed budget at each stop and dividing only the remainder by distance is
 * what gives every site the same amount of the reader's attention.
 */
const DWELL_SHARE = 0.46;

/**
 * How far the camera keeps drifting while parked, in metres of ground.
 *
 * Not decoration. An earlier version held the path parameter genuinely
 * constant through each dwell, which meant that across 46% of the page the
 * camera did not move at all: scrolling changed nothing on screen, and a
 * scroll that does nothing reads as a stuck page rather than as a pause. A
 * station is a place the camera slows down to look at, not one where it
 * switches off.
 *
 * Measured in metres rather than in path units, because the two are not
 * proportional. The solved path samples every leg at a roughly constant
 * spacing on the ground, so a leg that is short in kilometres is just as long
 * in path parameter as one that is not — and a fixed path-unit creep moved the
 * camera 1.5 km at Moray and 30 m at the overlook. Converting per station is
 * what makes the drift feel the same at all six.
 */
const DWELL_CREEP_METRES = 1200;

/** Never spend more than this share of a leg creeping at either end of it. */
const DWELL_CREEP_LIMIT = 0.34;

/**
 * Path parameter per metre of ground, near one station.
 *
 * Read off the solved path either side of the station rather than assumed:
 * the flight is a spline through unevenly spaced vantages, so its speed varies
 * several-fold along its length.
 */
function pathUnitsPerMetre(station: Station): number {
  const step = 1 / (FLIGHT_PATH.length - 1);
  const here = samplePath(FLIGHT_PATH, station.index * step);
  const ahead = samplePath(
    FLIGHT_PATH,
    clamp01((station.index + 1) * step),
  );
  const behind = samplePath(
    FLIGHT_PATH,
    clamp01((station.index - 1) * step),
  );
  const span = Math.hypot(
    ahead[0] - behind[0],
    ahead[1] - behind[1],
    ahead[2] - behind[2],
  );
  // Guard the degenerate case of a station whose neighbours coincide with it.
  const metres = Math.max(span, 1e-6) * METERS_PER_UNIT;
  const parameter =
    (Math.min(station.index + 1, FLIGHT_PATH.length - 1) -
      Math.max(station.index - 1, 0)) *
    step;
  void here;
  return parameter / metres;
}

/**
 * What a radian of turning costs, measured in path units.
 *
 * The scroll used to be handed to each leg in proportion to how far the camera
 * travelled, which assumes the view turns at a rate related to distance. It
 * does not. Two transfers — Moray to Maras, and Maras to Ollantaytambo, whose
 * framing bearings are nearly opposed — swing 70 to 90 degrees while barely
 * moving, so they were allotted almost no page for almost all of the tour's
 * rotation. That is the whip: not a smoothing failure but a pacing one, and no
 * amount of damping fixes a path that demands 400 deg/s from a calm reader.
 *
 * So turning is charged for. A leg's share of the scroll is its distance plus
 * this much per radian swept, and the same cost drives the pacing *within* the
 * leg, so the camera slows through the swing and picks up again on the straight.
 *
 * At 0.06 a 90-degree turn costs about as much page as travelling 0.09 of the
 * path — roughly a third of the run down to Machu Picchu, for a swing that
 * covers no ground at all. That is the point.
 */
const TURN_COST = 0.06;

/** Samples used to measure each leg's turn. Enough to catch a spike. */
const COST_SAMPLES = 48;

/**
 * Where the copy hands over during a transfer. The outgoing panel is gone by
 * 45% of the leg and the incoming one starts at 55%, so the two never overlap
 * and the middle of a long flight is left to the terrain.
 */
const HANDOVER_OUT = 0.45;
const HANDOVER_IN = 0.55;

/** Unit view direction at a path position. */
function facingAt(at: number): readonly [number, number, number] {
  const position = samplePath(FLIGHT_PATH, at);
  const target = samplePath(FLIGHT_AIM, at);
  const x = target[0] - position[0];
  const y = target[1] - position[1];
  const z = target[2] - position[2];
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

/** Angle in radians between the view directions at two path positions. */
function turnBetween(from: number, to: number): number {
  const a = facingAt(from);
  const b = facingAt(to);
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return Math.acos(dot);
}

/**
 * A leg's pacing, as cumulative cost against path position.
 *
 * `cost[i]` is the share of the leg's total effort spent by the time the
 * camera reaches `path[i]`, so reading it backwards turns an even scroll into
 * an uneven walk along the path — slow through the turns, quicker on the
 * straights.
 */
type CostTable = {
  path: number[];
  cost: number[];
  total: number;
};

function buildCostTable(from: number, to: number): CostTable {
  const path: number[] = [from];
  const cost: number[] = [0];
  let running = 0;

  for (let step = 1; step <= COST_SAMPLES; step += 1) {
    const previous = from + ((to - from) * (step - 1)) / COST_SAMPLES;
    const at = from + ((to - from) * step) / COST_SAMPLES;
    running += Math.abs(at - previous) + turnBetween(previous, at) * TURN_COST;
    path.push(at);
    cost.push(running);
  }

  // Guard a degenerate leg, so the lookup below never divides by zero.
  const total = running > 0 ? running : 1;
  return { path, cost: cost.map((value) => value / total), total };
}

/** Path position at a given share of a leg's cost. */
function pathAtCost(table: CostTable, share: number): number {
  const target = clamp01(share);
  for (let index = 1; index < table.cost.length; index += 1) {
    const upper = table.cost[index] as number;
    if (target > upper) {
      continue;
    }
    const lower = table.cost[index - 1] as number;
    const span = upper - lower;
    const local = span <= 0 ? 0 : (target - lower) / span;
    return lerp(
      table.path[index - 1] as number,
      table.path[index] as number,
      local,
    );
  }
  return table.path[table.path.length - 1] as number;
}

type Segment = {
  kind: "dwell" | "travel";
  /** The site being lingered on, or flown away from. */
  from: Station;
  /** The site being flown to; the same as `from` while parked. */
  to: Station;
  /** Path progress at the start and end of this segment. */
  pathStart: number;
  pathEnd: number;
  /** Pacing within a transfer; absent on a dwell, which creeps evenly. */
  table?: CostTable;
  /** Scroll progress at the start and end of this segment. */
  start: number;
  end: number;
};

/**
 * Lay the stations out along the scroll.
 *
 * Each station gets an equal slice of {@link DWELL_SHARE}; the rest is split
 * between them in proportion to how far the camera has to fly.
 */
function buildTimeline(): Segment[] {
  const dwell = DWELL_SHARE / STATIONS.length;

  // How far each dwell drifts either side of its station. The first has
  // nothing behind it and the last nothing ahead, so those creep one way only
  // rather than being clamped flat against the ends of the path.
  const creep = STATIONS.map((station, index) => {
    const here = stationPathProgress(station);
    const previous = STATIONS[index - 1];
    const next = STATIONS[index + 1];
    /*
     * Half the budget each way, or all of it one way at the ends. The first
     * station has no path behind it and the last none ahead, so splitting the
     * drift evenly would leave those two moving half as far as the rest —
     * exactly the unevenness this is specified in metres to avoid.
     */
    const budget = DWELL_CREEP_METRES * pathUnitsPerMetre(station);
    const share = previous && next ? budget / 2 : budget;
    const limit = (other: Station | undefined): number => {
      if (!other) {
        return 0;
      }
      const span = Math.abs(stationPathProgress(other) - here);
      return Math.min(share, span * DWELL_CREEP_LIMIT);
    };
    return { back: limit(previous), forward: limit(next) };
  });

  /*
   * Price every leg before handing any of them scroll, because a leg's share
   * depends on what the others cost. Distance alone gave the two turning legs
   * almost no page for almost all of the tour's rotation.
   */
  const legs = STATIONS.slice(0, -1).map((station, index) => {
    const next = STATIONS[index + 1] as Station;
    const drift = creep[index] ?? { back: 0, forward: 0 };
    return buildCostTable(
      stationPathProgress(station) + drift.forward,
      stationPathProgress(next) - (creep[index + 1]?.back ?? 0),
    );
  });
  const priced = legs.reduce((sum, leg) => sum + leg.total, 0) || 1;

  const segments: Segment[] = [];
  let cursor = 0;

  STATIONS.forEach((station, index) => {
    const here = stationPathProgress(station);
    const drift = creep[index] ?? { back: 0, forward: 0 };
    segments.push({
      kind: "dwell",
      from: station,
      to: station,
      pathStart: here - drift.back,
      pathEnd: here + drift.forward,
      start: cursor,
      end: cursor + dwell,
    });
    cursor += dwell;

    const next = STATIONS[index + 1];
    const table = legs[index];
    if (!next || !table) {
      return;
    }
    const travel = (1 - DWELL_SHARE) * (table.total / priced);
    segments.push({
      kind: "travel",
      from: station,
      to: next,
      pathStart: table.path[0] as number,
      pathEnd: table.path[table.path.length - 1] as number,
      table,
      start: cursor,
      end: cursor + travel,
    });
    cursor += travel;
  });

  // Absorb float drift into the last segment so scroll 1 lands exactly on the
  // final station rather than a hair short of it.
  const last = segments.at(-1);
  if (last) {
    last.end = 1;
  }
  return segments;
}

const TIMELINE = buildTimeline();
const LAST_SEGMENT = TIMELINE[TIMELINE.length - 1] as Segment;

function segmentAt(progress: number): { segment: Segment; local: number } {
  const p = clamp01(progress);
  for (const segment of TIMELINE) {
    if (p <= segment.end) {
      const span = segment.end - segment.start;
      return { segment, local: span <= 0 ? 0 : (p - segment.start) / span };
    }
  }
  return { segment: LAST_SEGMENT, local: 1 };
}

/**
 * Scroll progress to a position along the solved path.
 *
 * Strictly increasing everywhere: a dwell creeps, a transfer eases. There is
 * no scroll position at which the camera stops responding.
 */
export function scrollToPath(progress: number): number {
  const { segment, local } = segmentAt(progress);
  if (segment.kind === "dwell" || !segment.table) {
    return lerp(segment.pathStart, segment.pathEnd, local);
  }
  /*
   * Smoothstep first, so the camera eases out of one station and into the
   * next; the cost table then spends that eased progress unevenly along the
   * path, lingering wherever the view is swinging.
   */
  return pathAtCost(segment.table, smoothstep(0, 1, local));
}

export type StationFocus = {
  /** The site the copy should be showing. */
  id: SiteChapter;
  /** 1 while parked on it, falling to 0 in the middle of a transfer. */
  focus: number;
};

/**
 * Which site the reader is being told about, and how firmly.
 *
 * During a transfer this hands over at the midpoint, so the outgoing panel has
 * left before the incoming one arrives.
 */
export function stationAt(progress: number): StationFocus {
  const { segment, local } = segmentAt(progress);
  if (segment.kind === "dwell") {
    return { id: segment.from.id, focus: 1 };
  }
  if (local < 0.5) {
    return {
      id: segment.from.id,
      focus: 1 - smoothstep(0, HANDOVER_OUT, local),
    };
  }
  return { id: segment.to.id, focus: smoothstep(HANDOVER_IN, 1, local) };
}

/**
 * Scroll position at which the camera is exactly on a station.
 *
 * Not simply the middle of the dwell: the creep is one-sided at the first and
 * last stops, so the moment the path passes through the station sits wherever
 * that drift is balanced. The chapter rail jumps here, and it has to land on
 * the frame the station was framed for.
 */
export function stationScrollProgress(id: SiteChapter): number {
  for (const segment of TIMELINE) {
    if (segment.kind !== "dwell" || segment.from.id !== id) {
      continue;
    }
    const span = segment.pathEnd - segment.pathStart;
    const here = stationPathProgress(segment.from);
    const at = span <= 0 ? 0.5 : (here - segment.pathStart) / span;
    return segment.start + (segment.end - segment.start) * clamp01(at);
  }
  return 0;
}

/** Camera position and aim for a scroll position. */
export function sampleCameraPath(progress: number): CameraKeyframe {
  const at = scrollToPath(progress);
  const position = samplePath(FLIGHT_PATH, at);
  const lookAt = samplePath(FLIGHT_AIM, at);
  return {
    position: [position[0], position[1], position[2]],
    lookAt: [lookAt[0], lookAt[1], lookAt[2]],
  };
}

/**
 * Start fetching the western terrain one station early — as the camera leaves
 * Ollantaytambo — so its 1.7 MB is on disk well before it is in frame.
 */
const WEST_TERRAIN_PRELOAD_AT = (() => {
  const beforeLast = STATIONS.at(-2);
  return beforeLast ? stationPathProgress(beforeLast) - 0.01 : 0.7;
})();

/** Whether the western terrain is worth fetching yet. */
export function shouldLoadWestTerrain(progress: number): boolean {
  return scrollToPath(progress) >= WEST_TERRAIN_PRELOAD_AT;
}
