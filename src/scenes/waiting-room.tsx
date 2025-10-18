import {Circle, Line, Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, createSignal, loop, spawn} from '@motion-canvas/core';
import cfg from '../config/waiting-room.json';

function fract(v: number) {
  return v - Math.floor(v);
}

export default makeScene2D(function* (view) {
  const width = view.width();
  const height = view.height();

  // Scene layout metrics
  const horizonY = height * cfg.layout.horizonYOffsetRatio;
  const bottomY = height * cfg.layout.bottomYRatio;

  // Colors
  const bg = cfg.colors.background;
  const gridStroke = cfg.colors.gridStroke;
  const gridGlow = cfg.colors.gridGlow;
  const sunMain = cfg.colors.sunMain;
  const sunAlt = cfg.colors.sunAlt;
  const mountain = cfg.colors.mountain;
  const textColor = cfg.colors.text;

  // Background
  view.add(
    <Rect
      width={width}
      height={height}
      fill={bg}
      position={[0, 0]}
    />,
  );

  // Helper: sun with horizontal stripe cutouts
  const makeStripedSun = (
    radius: number,
    color: string,
    center: [number, number],
    stripeGap = 16,
    stripeThickness = 8,
  ) => {
    const group = new Node({position: center});
    // Core disc
    group.add(
      <Circle
        size={radius * 2}
        fill={color}
      />,
    );
    // Stripes: draw background-colored line segments limited to circle width
    for (let y = -radius + stripeGap; y < radius; y += stripeGap) {
      const half = Math.max(0, Math.sqrt(Math.max(0, radius * radius - y * y)));
      if (half < 1) continue;
      group.add(
        <Line
          points={[[-half, y], [half, y]]}
          stroke={bg}
          lineWidth={stripeThickness}
        />,
      );
    }
    return group;
  };

  // Place two suns with subtle parallax
  const sunBig = createRef<Node>();
  const sunSmall = createRef<Node>();

  view.add(
    <Node>
      <Node ref={sunBig}>
        {makeStripedSun(
          height * cfg.suns.big.radiusRatio,
          sunMain,
          [width * cfg.suns.big.positionXRatio, height * cfg.suns.big.positionYRatio],
          cfg.suns.big.stripeGap,
          cfg.suns.big.stripeThickness,
        )}
      </Node>
      <Node ref={sunSmall}>
        {makeStripedSun(
          height * cfg.suns.small.radiusRatio,
          sunAlt,
          [width * cfg.suns.small.positionXRatio, height * cfg.suns.small.positionYRatio],
          cfg.suns.small.stripeGap,
          cfg.suns.small.stripeThickness,
        )}
      </Node>
    </Node>,
  );

  // Mountain silhouette along the horizon for depth
  const mountainBase = horizonY + height * cfg.mountains.baseYOffsetRatio;
  const ridge = cfg.mountains.ridge as number[][];
  const ridgePoints = ridge.map(([x, y]) => [x * width, mountainBase + y * height]) as [number, number][];
  view.add(
    <Line
      fill={mountain}
      closed
      points={[
        ...ridgePoints,
        [width / 2, mountainBase],
        [width / 2, bottomY],
        [-width / 2, bottomY],
      ]}
    />,
  );

  // Retro grid floor
  const grid = new Node({});
  view.add(grid);

  const gridPhase = createSignal(0);
  const vanishingPoint: [number, number] = [width * cfg.layout.vanishingXRatio, horizonY];

  // Vertical rails converging to vanishing point
  const verticalCount = cfg.grid.verticalCount;
  for (let i = -verticalCount; i <= verticalCount; i++) {
    const t = i / verticalCount;
    const xBottom = t * width * cfg.grid.railBottomWidthFactor;
    grid.add(
      <Line
        points={[[xBottom, bottomY], vanishingPoint]}
        stroke={gridStroke}
        lineWidth={cfg.grid.verticalLineWidth}
      />,
    );
  }

  // Moving horizontal stripes
  const horizontalCount = cfg.grid.horizontalCount;
  for (let i = 0; i < horizontalCount; i++) {
    // Each line computes its own y from the shared phase.
    const idx = i;
    grid.add(
      <Line
        points={() => {
          const p = fract(gridPhase() + idx / horizontalCount);
          const y = horizonY + (bottomY - horizonY) * Math.pow(p, cfg.grid.perspectiveExponent);
          const w = width * (cfg.grid.hWidthMin + cfg.grid.hWidthMaxExtra * p);
          return [[-w, y], [w, y]];
        }}
        stroke={() => (fract(gridPhase() * cfg.grid.glowAltFrequency + idx / horizontalCount) < 0.5 ? gridStroke : gridGlow)}
        lineWidth={() => cfg.grid.lineBaseWidth + cfg.grid.lineGrowWidth * Math.pow(fract(gridPhase() + idx / horizontalCount), cfg.grid.lineWidthGrowthPower)}
      />,
    );
  }

  // Center text (neon flicker)
  const title = createRef<Txt>();
  // Fake glow by layering blurred-ish scalings
  view.add(
    <Node y={height * cfg.layout.titleYOffsetRatio}>
      <Txt
        text={cfg.title.text}
        fontFamily={cfg.title.fontFamily}
        fontSize={height * cfg.title.glow.fontSizeRatio}
        fill={cfg.colors.textGlow}
        opacity={cfg.title.glow.opacity}
        scale={cfg.title.glow.scale}
        textAlign={'center'}
      />
      <Txt
        ref={title}
        text={cfg.title.text}
        fontFamily={cfg.title.fontFamily}
        fontSize={height * cfg.title.fontSizeRatio}
        fill={textColor}
        textAlign={'center'}
      />
    </Node>,
  );

  // Animate: grid flow (simulated driving), sun pulse, and text flicker
  spawn(loop(() => gridPhase(gridPhase() + 1, cfg.grid.flowDuration)));

  spawn(
    loop(() =>
      all(
        sunBig().scale(cfg.suns.big.pulseScale, cfg.suns.big.pulseDuration).to(1, cfg.suns.big.pulseDuration),
        sunSmall().scale(cfg.suns.small.pulseScale, cfg.suns.small.pulseDuration).to(1, cfg.suns.small.pulseDuration),
      ),
    ),
  );

  spawn(
    loop(function* () {
      yield* title().opacity(cfg.title.flicker.opacityMin, cfg.title.flicker.opacityDown).to(1, cfg.title.flicker.opacityUp);
      yield* title().x(cfg.title.flicker.glitchX1, cfg.title.flicker.glitchStep).to(cfg.title.flicker.glitchX2, cfg.title.flicker.glitchStep).to(0, cfg.title.flicker.glitchStep);
      yield* title().scale(cfg.title.flicker.scaleUp, cfg.title.flicker.scaleUpDuration).to(1, cfg.title.flicker.scaleDownDuration);
    }),
  );

  // Keep the scene running long for live use
  // You can trim in render settings if needed.
  yield* loop(cfg.loop.ticks, function* () {
    // 600 lightweight ticks to keep the scene alive ~indefinitely in preview
    yield;
  });
});
