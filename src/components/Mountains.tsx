import {Line} from '@motion-canvas/2d';

export interface MountainsProps {
  color: string;
  width: number;
  height: number;
  baseY: number;
  bottomY: number;
  ridge: number[][]; // [xRatio, yOffsetRatio] pairs
}

export function Mountains({color, width, height, baseY, bottomY, ridge}: MountainsProps) {
  const ridgePoints = ridge.map(([xr, yr]) => [xr * width, baseY + yr * height]);
  return (
    <Line
      fill={color}
      closed
      points={[
        ...ridgePoints as [number, number][],
        [width / 2, baseY],
        [width / 2, bottomY],
        [-width / 2, bottomY],
      ]}
    />
  );
}
