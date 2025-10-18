import {Line, Node} from '@motion-canvas/2d';
import {createSignal, loop, spawn} from '@motion-canvas/core';

function fract(v: number) {
  return v - Math.floor(v);
}

export interface GridFloorProps {
  width: number;
  bottomY: number;
  horizonY: number;
  vanishingX: number;
  stroke: string;
  glow: string;
  verticalCount: number;
  horizontalCount: number;
  railBottomWidthFactor: number;
  verticalLineWidth: number;
  hWidthMin: number;
  hWidthMaxExtra: number;
  lineBaseWidth: number;
  lineGrowWidth: number;
  lineWidthGrowthPower: number;
  flowDuration: number;
  glowAltFrequency: number;
  perspectiveExponent: number;
}

export function GridFloor(props: GridFloorProps): Node {
  const {
    width,
    bottomY,
    horizonY,
    vanishingX,
    stroke,
    glow,
    verticalCount,
    horizontalCount,
    railBottomWidthFactor,
    verticalLineWidth,
    hWidthMin,
    hWidthMaxExtra,
    lineBaseWidth,
    lineGrowWidth,
    lineWidthGrowthPower,
    flowDuration,
    glowAltFrequency,
    perspectiveExponent,
  } = props;

  const grid = new Node({});
  const gridPhase = createSignal(0);
  const vanishingPoint: [number, number] = [vanishingX, horizonY];

  for (let i = -verticalCount; i <= verticalCount; i++) {
    const t = i / verticalCount;
    const xBottom = t * width * railBottomWidthFactor;
    grid.add(
      <Line
        points={[[xBottom, bottomY], vanishingPoint]}
        stroke={stroke}
        lineWidth={verticalLineWidth}
      />,
    );
  }

  for (let i = 0; i < horizontalCount; i++) {
    const idx = i;
    grid.add(
      <Line
        points={() => {
          const p = fract(gridPhase() + idx / horizontalCount);
          const y = horizonY + (bottomY - horizonY) * Math.pow(p, perspectiveExponent);
          const w = width * (hWidthMin + hWidthMaxExtra * p);
          return [[-w, y], [w, y]];
        }}
        stroke={() => (fract(gridPhase() * glowAltFrequency + idx / horizontalCount) < 0.5 ? stroke : glow)}
        lineWidth={() => lineBaseWidth + lineGrowWidth * Math.pow(fract(gridPhase() + idx / horizontalCount), lineWidthGrowthPower)}
      />,
    );
  }

  spawn(loop(() => gridPhase(gridPhase() + 1, flowDuration)));

  return grid;
}

