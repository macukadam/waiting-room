import {Circle, Line, Node} from '@motion-canvas/2d';
import {loop, spawn} from '@motion-canvas/core';

export interface StripedSunProps {
  radius: number;
  color: string;
  center: [number, number];
  stripeGap?: number;
  stripeThickness?: number;
  animatePulse?: boolean;
  pulseScale?: number;
  pulseDuration?: number;
  background?: string;
}

export function StripedSun({
  radius,
  color,
  center,
  stripeGap = 16,
  stripeThickness = 8,
  animatePulse = false,
  pulseScale = 1.03,
  pulseDuration = 2.4,
  background = '#000',
}: StripedSunProps): Node {
  const group = new Node({position: center});

  group.add(
    <Circle size={radius * 2} fill={color} />,
  );

  for (let y = -radius + stripeGap; y < radius; y += stripeGap) {
    const half = Math.max(0, Math.sqrt(Math.max(0, radius * radius - y * y)));
    if (half < 1) continue;
    group.add(
      <Line
        points={[[-half, y], [half, y]]}
        stroke={background}
        lineWidth={stripeThickness}
      />,
    );
  }

  if (animatePulse) {
    spawn(
      loop(() => group.scale(pulseScale, pulseDuration).to(1, pulseDuration)),
    );
  }

  return group;
}

