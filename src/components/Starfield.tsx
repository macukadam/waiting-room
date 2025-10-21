import {Circle, Node} from '@motion-canvas/2d';
import {createRef, loop, spawn} from '@motion-canvas/core';

export interface StarfieldProps {
  width: number;
  height: number;
  count?: number;
  color?: string;
  minRadius?: number;
  maxRadius?: number;
  twinkle?: boolean;
  minOpacity?: number;
  maxOpacity?: number;
  minTwinkleDuration?: number;
  maxTwinkleDuration?: number;
  flicker?: {
    enabled?: boolean;
    probability?: number; // chance per cycle to trigger a short flicker burst
    burstOpacity?: number;
    minIn?: number;
    maxIn?: number;
    minOut?: number;
    maxOut?: number;
    scaleUp?: number; // temporary scale up during burst
  };
}

export function Starfield({
  width,
  height,
  count = 120,
  color = '#ffffff',
  minRadius = 1,
  maxRadius = 2.5,
  twinkle = true,
  minOpacity = 0.35,
  maxOpacity = 0.95,
  minTwinkleDuration = 0.8,
  maxTwinkleDuration = 1.8,
  flicker,
}: StarfieldProps): Node {
  const group = new Node({});

  // Helper to get a random in [a, b]
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  for (let i = 0; i < count; i++) {
    const r = rand(minRadius, maxRadius);
    const x = rand(-width / 2, width / 2);
    const y = rand(-height / 2, height / 2);
    const op = rand(minOpacity, maxOpacity);

    const star = createRef<Circle>();
    group.add(
      <Circle ref={star} x={x} y={y} size={r * 2} fill={color} opacity={op} />, 
    );

    spawn(
      loop(function* () {
        if (twinkle) {
          const o1 = rand(minOpacity, maxOpacity);
          const d1 = rand(minTwinkleDuration, maxTwinkleDuration);
          const o2 = rand(minOpacity, maxOpacity);
          const d2 = rand(minTwinkleDuration, maxTwinkleDuration);
          yield* star().opacity(o1, d1).to(o2, d2);
        }

        if (flicker?.enabled) {
          const p = flicker.probability ?? 0.07;
          if (Math.random() < p) {
            const inD = rand(flicker.minIn ?? 0.02, flicker.maxIn ?? 0.08);
            const outD = rand(flicker.minOut ?? 0.08, flicker.maxOut ?? 0.16);
            const burst = flicker.burstOpacity ?? 1.0;
            const scaleUp = flicker.scaleUp ?? 1.35;
            // short burst: brighten and enlarge slightly, then return to baseline
            // run scale in parallel with opacity
            spawn(function* () {
              yield* star().scale(scaleUp, inD).to(1, outD);
            });
            yield* star().opacity(burst, inD).to(rand(minOpacity, maxOpacity), outD);
          }
        }
      }),
    );
  }

  return group;
}
