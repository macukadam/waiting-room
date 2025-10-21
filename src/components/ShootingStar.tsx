import {Circle, Node} from '@motion-canvas/2d';
import {createRef, loop, spawn, waitFor} from '@motion-canvas/core';

export interface ShootingStarProps {
  width: number;
  height: number;
  color?: string;
  headRadius?: number;
  trailCount?: number; // number of small trail dots
  trailSpacing?: number; // spacing between trail dots in px
  trailOpacityDecay?: number; // per dot decay [0..1]
  angleDeg?: number; // travel angle relative to +X (screen coords)
  speed?: number; // px per second along path
  minDelay?: number; // min delay between meteors
  maxDelay?: number; // max delay between meteors
  startXRatioMin?: number; // spawn range
  startXRatioMax?: number;
  startYRatioMin?: number;
  startYRatioMax?: number;
  horizontal?: boolean; // move only along X, keep Y constant
  trailDrift?: number; // how much each trail dot drifts backward over its life
  randomDirections?: boolean; // randomize direction left->right or right->left
  skyBottomY?: number; // maximum Y for star path (usually horizonY - margin)
  skyMargin?: number; // extra margin from skyBottomY
  driftYMax?: number; // random vertical drift amount when moving horizontally
}

export function ShootingStar({
  width,
  height,
  color = '#cfe9ff',
  headRadius = 3.5,
  trailCount = 6,
  trailSpacing = 12,
  trailOpacityDecay = 0.14,
  angleDeg = 22,
  speed = 600,
  minDelay = 2.5,
  maxDelay = 6.0,
  startXRatioMin = -0.55,
  startXRatioMax = -0.10,
  startYRatioMin = -0.45,
  startYRatioMax = -0.15,
  horizontal = true,
  trailDrift,
  randomDirections = true,
  skyBottomY,
  skyMargin = 24,
  driftYMax = 40,
}: ShootingStarProps): Node {
  const root = new Node({});
  root.opacity(0); // hidden until first pass starts
  const head = createRef<Circle>();
  root.add(<Circle ref={head} size={headRadius * 2} fill={color} />);

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  // Animate meteors repeatedly
  spawn(
    loop(function* () {
      // random delay between meteors
      yield* waitFor(rand(minDelay, maxDelay));

      let start: [number, number];
      let end: [number, number];
      if (horizontal) {
        const margin = Math.max(80, width * 0.06);
        const safeBottom = (skyBottomY ?? (startYRatioMax * height)) - skyMargin;
        const safeTop = -height / 2 + skyMargin;
        const y = Math.min(safeBottom, Math.max(safeTop, rand(startYRatioMin * height, startYRatioMax * height)));
        const leftStart: [number, number] = [(-width / 2) - margin, y];
        const rightEnd: [number, number] = [(width / 2) + margin, y];
        const rightStart: [number, number] = [(width / 2) + margin, y];
        const leftEnd: [number, number] = [(-width / 2) - margin, y];
        // random slight vertical drift but keep within safe sky band
        const dy = rand(-driftYMax, driftYMax);
        const yEnd = Math.min(safeBottom, Math.max(safeTop, y + dy));
        if (randomDirections && Math.random() < 0.5) {
          start = rightStart;
          end = [leftEnd[0], yEnd];
        } else {
          start = leftStart;
          end = [rightEnd[0], yEnd];
        }
      } else {
        // angled fallback
        start = [
          rand(startXRatioMin * width, startXRatioMax * width),
          rand(startYRatioMin * height, startYRatioMax * height),
        ];
        const angle = (angleDeg * Math.PI) / 180;
        const dir = [Math.cos(angle), Math.sin(angle)];
        const travel = Math.hypot(width, height) * 1.1;
        end = [start[0] + dir[0] * travel, start[1] + dir[1] * travel];
      }

      const travelLen = Math.hypot(end[0] - start[0], end[1] - start[1]);
      const duration = travelLen / speed;

      // initialize head
      head().position(start);
      head().opacity(1);
      root.opacity(1);

      // trail emitter
      const spacing = Math.max(2, trailSpacing);
      const interval = Math.max(0.012, spacing / speed);
      const life = Math.max(interval * trailCount, 0.4);
      const drift = trailDrift ?? spacing * 1.5;
      spawn(function* () {
        let t = 0;
        while (t < duration) {
          const p = head().position();
          const dot = new Circle({
            x: p.x,
            y: p.y,
            size: Math.max(1, headRadius * 1.2) * 2,
            fill: color,
            opacity: Math.max(0.3, 1 - trailOpacityDecay),
          });
          root.add(dot);
          spawn(function* () { yield* dot.x(dot.x() - drift, life); });
          spawn(function* () { yield* dot.size(Math.max(1, headRadius) * 2, life); });
          yield* dot.opacity(0, life);
          dot.remove();
          yield* waitFor(interval);
          t += interval;
        }
      });

      // fade near the end of the pass
      spawn(function* () {
        yield* waitFor(Math.max(0, duration - 0.2));
        yield* head().opacity(0, 0.2);
      });

      // fly across
      yield* head().position(end, duration);
      // hide until next pass
      root.opacity(0);
    }),
  );

  return root;
}
