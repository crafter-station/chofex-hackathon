import { expect, test } from "bun:test";

import {
  sampleCameraPath,
  scrollToPath,
  shouldLoadWestTerrain,
  type SiteChapter,
  stationAt,
  stationPathProgress,
  stationScrollProgress,
} from "./sacred-valley-flight";
import { TERRAIN_SIZE } from "./sacred-valley-geometry";
import {
  FLIGHT_AIM,
  FLIGHT_PATH,
  FLIGHT_STATIONS,
  METERS_PER_UNIT,
  SACRED_SITES,
} from "./sacred-valley-place";
import { WEST_TERRAIN_EXTENT } from "./west-terrain-place";

const SITE_ORDER: SiteChapter[] = [
  "overlook",
  "pisac",
  "moray",
  "maras",
  "ollantaytambo",
  "machupicchu",
];

test("solves one camera sample per aim sample", () => {
  expect(FLIGHT_PATH.length).toBe(FLIGHT_AIM.length);
  expect(FLIGHT_PATH.length).toBeGreaterThan(FLIGHT_STATIONS.length);
});

test("stops at every site, in flight order", () => {
  expect(FLIGHT_STATIONS.map((station) => station.id)).toEqual(SITE_ORDER);

  // Stations have to advance monotonically, or the scroll would double back.
  const indices = FLIGHT_STATIONS.map((station) => station.index);
  for (let at = 1; at < indices.length; at += 1) {
    expect(indices[at] as number).toBeGreaterThan(indices[at - 1] as number);
  }

  // The tour opens and closes on a station, never mid-flight.
  const first = FLIGHT_STATIONS.at(0);
  const last = FLIGHT_STATIONS.at(-1);
  expect(first).toBeDefined();
  expect(last).toBeDefined();
  expect(stationPathProgress(first as { index: number })).toBe(0);
  expect(stationPathProgress(last as { index: number })).toBe(1);
});

test("maps scroll onto the path without running past either end", () => {
  expect(scrollToPath(0)).toBe(0);
  expect(scrollToPath(1)).toBe(1);
  // Clamped, so overscroll cannot fling the camera off the solved path.
  expect(scrollToPath(-0.5)).toBe(0);
  expect(scrollToPath(2)).toBe(1);
});

test("never stops responding to scroll", () => {
  /*
   * The failure this exists to prevent: an earlier timeline held the path
   * parameter genuinely constant through each dwell, so across 46% of the page
   * scrolling moved nothing on screen. That does not read as a pause, it reads
   * as a stuck page — the most common way scrollytelling feels broken.
   *
   * Two things have to hold. The path must advance at every scroll position,
   * and the camera must actually go somewhere: a parameter creeping by a
   * millimetre would satisfy strict monotonicity and still look frozen.
   */
  let previous = scrollToPath(0);
  let stalls = 0;
  for (let step = 1; step <= 2000; step += 1) {
    const at = scrollToPath(step / 2000);
    if (at <= previous) {
      stalls += 1;
    }
    previous = at;
  }
  expect(stalls).toBe(0);

  /*
   * And it has to move comparably at every stop. The creep is specified in
   * metres precisely because a fixed path-parameter drift is not the same
   * amount of travel at each station — the solved path's speed varies
   * several-fold — which left the opening overlook drifting 30 m while Moray
   * drifted 1.5 km.
   */
  const window = 0.015;
  const drifts = FLIGHT_STATIONS.map((station) => {
    const centre = stationScrollProgress(station.id);
    const from = sampleCameraPath(Math.max(0, centre - window)).position;
    const to = sampleCameraPath(Math.min(1, centre + window)).position;
    return (
      Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]) *
      METERS_PER_UNIT
    );
  });

  // Three percent of the page, parked on a site, still moves the camera a
  // long way further than the eye needs to register that scrolling works.
  for (const moved of drifts) {
    expect(moved).toBeGreaterThan(150);
  }
  /*
   * And comparable across the six. The spread is structural rather than a
   * tuning slip: the first and last stations have no path behind or ahead of
   * them, so their drift is one-sided and a window centred on them catches
   * about half of it. Anything much wider than this would mean a stop that
   * feels dead next to its neighbours — which is the whole complaint this
   * creep exists to answer.
   */
  expect(Math.min(...drifts) * 3.5).toBeGreaterThan(Math.max(...drifts));
});

test("spreads the tour's rotation instead of packing it into two legs", () => {
  /*
   * The whip this rules out was a pacing fault, not a smoothing one, and no
   * amount of damping fixes it: the runtime can refuse to turn faster than its
   * ceiling, but if the path demands 400 deg/s from a calm reader then all the
   * limiter buys is a camera swimming a hundred degrees behind the scroll.
   *
   * It came from two things, both fixed at the source. Scroll used to be
   * handed to each leg by distance alone, so the two legs that turned the most
   * got the least page; and Maras was framed from bearing 344 while both its
   * neighbours look west-north-west, which forced 120 degrees in and 121 back
   * out across the two shortest legs of the tour.
   */
  const direction = (at: number): readonly [number, number, number] => {
    const frame = sampleCameraPath(at);
    const x = frame.lookAt[0] - frame.position[0];
    const y = frame.lookAt[1] - frame.position[1];
    const z = frame.lookAt[2] - frame.position[2];
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  };

  const steps = 4000;
  const rates: number[] = [];
  for (let step = 1; step <= steps; step += 1) {
    const a = direction((step - 1) / steps);
    const b = direction(step / steps);
    const dot = Math.min(
      1,
      Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]),
    );
    // Degrees of view rotation per unit of scroll.
    rates.push(((Math.acos(dot) * 180) / Math.PI) * steps);
  }
  rates.sort((a, b) => a - b);
  const percentile = (share: number): number =>
    rates[Math.floor(rates.length * share)] as number;

  /*
   * Bounds in degrees per unit of scroll. A reader taking a leisurely 12 s
   * over the page divides these by 12, so the peak here is what decides
   * whether the runtime's 75 deg/s ceiling ever has to engage for someone
   * reading normally — and it should not.
   */
  expect(percentile(0.5)).toBeLessThan(400);
  expect(percentile(0.99)).toBeLessThan(2200);
  expect(Math.max(...rates)).toBeLessThan(2400);
});

test("holds each site in frame while it creeps past it", () => {
  for (const station of FLIGHT_STATIONS) {
    const centre = stationScrollProgress(station.id);
    // The camera passes exactly through the solved vantage.
    expect(scrollToPath(centre)).toBeCloseTo(stationPathProgress(station), 6);
    const { id, focus } = stationAt(centre);
    expect(id).toBe(station.id);
    expect(focus).toBe(1);
  }
});

test("gives every site a comparable share of the scroll", () => {
  // Moray and Maras are 5 km apart and Machu Picchu is 30 km further on. A
  // scroll mapped straight onto distance would blink past the close pair.
  const held = new Map<SiteChapter, number>();
  for (let step = 0; step <= 2000; step += 1) {
    const { id, focus } = stationAt(step / 2000);
    if (focus === 1) {
      held.set(id, (held.get(id) ?? 0) + 1);
    }
  }
  expect(held.size).toBe(FLIGHT_STATIONS.length);
  const shares = [...held.values()];
  expect(Math.min(...shares) / Math.max(...shares)).toBeGreaterThan(0.9);
});

test("hands the copy over once per transfer, without overlapping panels", () => {
  let previous = stationAt(0).id;
  const seen: SiteChapter[] = [previous];
  for (let step = 1; step <= 3000; step += 1) {
    const { id } = stationAt(step / 3000);
    if (id !== previous) {
      seen.push(id);
      previous = id;
    }
  }
  // Each site becomes current exactly once, in order — never flickering back.
  expect(seen).toEqual(SITE_ORDER);
});

test("fades the panel out before the next one arrives", () => {
  // Scanned rather than assumed to be the midpoint between the two stations:
  // the creep is one-sided at the first stop, so its scroll position sits at
  // the start of its dwell rather than the middle.
  const from = stationScrollProgress("overlook");
  const to = stationScrollProgress("pisac");
  let quietest = 1;
  for (let step = 0; step <= 400; step += 1) {
    quietest = Math.min(
      quietest,
      stationAt(from + ((to - from) * step) / 400).focus,
    );
  }
  expect(quietest).toBeLessThan(0.05);
});

test("aims at each site when parked on it", () => {
  for (const station of FLIGHT_STATIONS) {
    if (station.id === "overlook") {
      continue;
    }
    const site = SACRED_SITES[station.id as keyof typeof SACRED_SITES];
    const frame = sampleCameraPath(stationScrollProgress(station.id));
    expect(frame.lookAt[0]).toBeCloseTo(site.position[0], 3);
    expect(frame.lookAt[2]).toBeCloseTo(site.position[2], 3);
  }
});

test("stands above its subject at every station", () => {
  for (const station of FLIGHT_STATIONS) {
    const frame = sampleCameraPath(stationScrollProgress(station.id));
    expect(frame.position[1]).toBeGreaterThan(frame.lookAt[1]);
  }
});

test("meets the corridor with no gap between the two meshes", () => {
  /*
   * The western terrain used to stop 16 km short of the corridor, on the
   * theory that the gorge between them was ground nobody would look at. The
   * camera flies straight over it, so the hole was in frame for the whole
   * crossing — and nothing layered on top of a hole turns it back into ground.
   *
   * The builder snaps this mesh onto the corridor's own sampling lattice, so
   * the join is not a tolerance to be met but an identity: the western mesh's
   * eastern column *is* the corridor's western column.
   */
  const corridorWest = -TERRAIN_SIZE.width / 2;
  expect(WEST_TERRAIN_EXTENT[2]).toBeCloseTo(corridorWest, 2);
  // And it reaches well past the citadel on the far side.
  expect(WEST_TERRAIN_EXTENT[0]).toBeLessThan(
    SACRED_SITES.machupicchu.position[0],
  );
});

test("keeps the whole flight over terrain that exists", () => {
  const halfWidth = TERRAIN_SIZE.width / 2;
  const halfDepth = TERRAIN_SIZE.depth / 2;

  for (let step = 0; step <= 800; step += 1) {
    const { position } = sampleCameraPath(step / 800);
    const overCorridor =
      Math.abs(position[0]) <= halfWidth && Math.abs(position[2]) <= halfDepth;
    const overWest =
      position[0] >= WEST_TERRAIN_EXTENT[0] &&
      position[0] <= WEST_TERRAIN_EXTENT[2] &&
      position[2] >= WEST_TERRAIN_EXTENT[1] &&
      position[2] <= WEST_TERRAIN_EXTENT[3];
    // With the gorge filled in, there is nowhere left to fly over nothing.
    expect(overCorridor || overWest).toBe(true);
  }
});

test("fetches the western terrain before it is in frame, not after", () => {
  expect(shouldLoadWestTerrain(0)).toBe(false);
  expect(shouldLoadWestTerrain(stationScrollProgress("maras"))).toBe(false);
  // Parked on Ollantaytambo, the last stop before the run west.
  expect(shouldLoadWestTerrain(stationScrollProgress("ollantaytambo"))).toBe(
    true,
  );
  expect(shouldLoadWestTerrain(1)).toBe(true);
});
