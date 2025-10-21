import {Line} from '@motion-canvas/2d';

export interface CityscapeProps {
  color: string;
  width: number;
  height: number;
  baseY: number;
  bottomY: number;
  ridge?: number[][]; // [xRatio, yOffsetRatio] pairs; optional, will be generated if not provided
  generateCount?: number; // used when ridge is not provided
  minHeightRatio?: number; // relative to height (negative values go up from base)
  maxHeightRatio?: number; // relative to height (negative values go up from base)
}

// Creates a chunky skyline silhouette similar to Mountains but more rectangular.
export function Cityscape({
  color,
  width,
  height,
  baseY,
  bottomY,
  ridge,
  generateCount = 20,
  minHeightRatio = -0.18,
  maxHeightRatio = -0.04,
}: CityscapeProps) {
  let ridgePoints: [number, number][];
  if (ridge && ridge.length > 1) {
    ridgePoints = ridge.map(([xr, yr]) => [xr * width, baseY + yr * height]);
  } else {
    const pts: [number, number][] = [];
    for (let i = 0; i <= generateCount; i++) {
      const t = i / generateCount;
      const xr = -0.5 + t; // map to [-0.5, 0.5]
      // Force a more blocky feel by snapping heights a bit
      const raw = Math.random() * (maxHeightRatio - minHeightRatio) + minHeightRatio;
      const snapped = Math.round(raw / 0.02) * 0.02;
      pts.push([xr * width, baseY + snapped * height]);
    }
    ridgePoints = pts;
  }

  return (
    <Line
      fill={color}
      closed
      points={[
        ...ridgePoints,
        [width / 2, baseY],
        [width / 2, bottomY],
        [-width / 2, bottomY],
      ]}
    />
  );
}

