import {Circle, Line, Node} from '@motion-canvas/2d';
import {loop, spawn, waitFor} from '@motion-canvas/core';

export interface DeadStarProps {
  center: [number, number];
  radius: number;

  coreColor: string;
  haloColor: string;
  crackColor: string;
  ringColor: string;

  haloLayers?: number;
  haloScaleMin?: number;
  haloScaleMax?: number;
  haloPulseDuration?: number;
  haloOpacity?: number;

  crackCount?: number;
  crackWidth?: number;
  crackFlickerMin?: number;
  crackFlickerMax?: number;

  ringRadiusFactor?: number;
  ringParticleCount?: number;
  ringParticleMin?: number;
  ringParticleMax?: number;
  ringRotationSeconds?: number;
  ringTiltDeg?: number; // converted to scaleY via cos
  ringOpacity?: number;

  embers?: {
    enabled?: boolean;
    minDelay?: number;
    maxDelay?: number;
    maxRadiusFactor?: number; // relative to star radius
    fadeSeconds?: number;
  };
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pointInCircle(radius: number): [number, number] {
  const t = Math.random() * 2 * Math.PI;
  const r = Math.sqrt(Math.random()) * radius; // uniform in disk
  return [Math.cos(t) * r, Math.sin(t) * r];
}

function ringPoint(radius: number, angle: number, scaleY: number): [number, number] {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius * scaleY];
}

export function DeadStar(props: DeadStarProps): Node {
  const {
    center,
    radius,
    coreColor,
    haloColor,
    crackColor,
    ringColor,
    haloLayers = 3,
    haloScaleMin = 1.05,
    haloScaleMax = 1.22,
    haloPulseDuration = 3.6,
    haloOpacity = 0.22,
    crackCount = 8,
    crackWidth = 3,
    crackFlickerMin = 0.4,
    crackFlickerMax = 1.2,
    ringRadiusFactor = 1.35,
    ringParticleCount = 56,
    ringParticleMin = 1.0,
    ringParticleMax = 2.0,
    ringRotationSeconds = 36,
    ringTiltDeg = 18,
    ringOpacity = 0.65,
    embers,
  } = props;

  const group = new Node({position: center});

  // Halo layers behind the core
  for (let i = 0; i < haloLayers; i++) {
    const layer = new Circle({
      size: radius * 2,
      fill: haloColor,
      opacity: haloOpacity * (1 - i / (haloLayers + 1)),
      scale: 1 + (i + 1) * ((haloScaleMin - 1) / haloLayers),
    });
    group.add(layer);
    const d = haloPulseDuration * (1 + i * 0.15);
    const sMin = haloScaleMin + (i * 0.05);
    const sMax = haloScaleMax + (i * 0.05);
    spawn(loop(() => layer.scale(sMax, d).to(sMin, d)));
  }

  // Dead core
  group.add(new Circle({size: radius * 2, fill: coreColor}));

  // Cracks: jagged lines inside disk with irregular flicker
  for (let i = 0; i < crackCount; i++) {
    const segs = Math.floor(rand(3, 6));
    const pts: [number, number][] = [];
    for (let s = 0; s < segs; s++) {
      const p = pointInCircle(radius * 0.95);
      // Slight directional bias for continuity
      if (s > 0) {
        const [px, py] = pts[s - 1];
        const bias: [number, number] = [rand(-10, 10), rand(-10, 10)];
        p[0] = (p[0] + px + bias[0]) / 2;
        p[1] = (p[1] + py + bias[1]) / 2;
      }
      pts.push(p);
    }

    const crack = new Line({
      points: pts,
      stroke: crackColor,
      lineWidth: crackWidth,
      opacity: rand(0.25, 0.7),
    });
    group.add(crack);

    // Irregular flicker and tiny jitter
    spawn(
      loop(function* () {
        const down = rand(crackFlickerMin, crackFlickerMax);
        const up = rand(crackFlickerMin, crackFlickerMax);
        yield* crack.opacity(rand(0.15, 0.4), down).to(rand(0.5, 1.0), up);
        yield* crack.x(crack.x() + rand(-1.5, 1.5), 0.1).to(crack.x() + rand(-1.5, 1.5), 0.1);
      }),
    );
  }

  // Debris ring (elliptical with tilt simulated via scaleY)
  const ring = new Node({opacity: ringOpacity});
  const r = radius * ringRadiusFactor;
  const scaleY = Math.cos((ringTiltDeg * Math.PI) / 180);
  for (let i = 0; i < ringParticleCount; i++) {
    const a = (i / ringParticleCount) * Math.PI * 2 + rand(-0.05, 0.05);
    const [x, y] = ringPoint(r, a, scaleY);
    ring.add(
      new Circle({
        x,
        y,
        size: rand(ringParticleMin, ringParticleMax) * 2,
        fill: ringColor,
        opacity: rand(0.6, 0.95),
      }),
    );
  }
  group.add(ring);
  // slow rotation
  spawn(loop(() => ring.rotation(ring.rotation() + 360, ringRotationSeconds)));

  // Occasional embers along the ring
  if (embers?.enabled) {
    const minDelay = embers.minDelay ?? 4.0;
    const maxDelay = embers.maxDelay ?? 10.0;
    const fade = embers.fadeSeconds ?? 0.8;
    const maxRF = embers.maxRadiusFactor ?? 0.18;
    spawn(
      loop(function* () {
        yield* waitFor(rand(minDelay, maxDelay));
        const a = rand(0, Math.PI * 2);
        const [x, y] = ringPoint(r, a, scaleY);
        const ember = new Circle({x, y, size: 2, fill: ringColor, opacity: 0.9});
        group.add(ember);
        const targetSize = Math.max(4, radius * 2 * maxRF);
        spawn(function* () { yield* ember.size(targetSize, fade); });
        yield* ember.opacity(0, fade);
        ember.remove();
      }),
    );
  }

  return group;
}

