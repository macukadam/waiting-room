import {Node, Rect, makeScene2D} from '@motion-canvas/2d';
import {loop} from '@motion-canvas/core';
import cfg from '../config/waiting-room.json';
import {StripedSun} from '../components/StripedSun';
import {GridFloor} from '../components/GridFloor';
import {Mountains} from '../components/Mountains';
import {TitleText} from '../components/TitleText';

export default makeScene2D(function* (view) {
  const width = view.width();
  const height = view.height();

  // Scene layout metrics
  const horizonY = height * cfg.layout.horizonYOffsetRatio;
  const bottomY = height * cfg.layout.bottomYRatio;

  // Colors
  const bg = cfg.colors.background;
  const sunMain = cfg.colors.sunMain;
  const sunAlt = cfg.colors.sunAlt;
  const mountain = cfg.colors.mountain;

  // Background
  view.add(
    <Rect
      width={width}
      height={height}
      fill={bg}
      position={[0, 0]}
    />,
  );

  // Place two suns with subtle parallax
  view.add(
    <Node>
      {StripedSun({
        radius: height * cfg.suns.big.radiusRatio,
        color: sunMain,
        center: [width * cfg.suns.big.positionXRatio, height * cfg.suns.big.positionYRatio],
        stripeGap: cfg.suns.big.stripeGap,
        stripeThickness: cfg.suns.big.stripeThickness,
        animatePulse: true,
        pulseScale: cfg.suns.big.pulseScale,
        pulseDuration: cfg.suns.big.pulseDuration,
        background: bg,
      })}
      {StripedSun({
        radius: height * cfg.suns.small.radiusRatio,
        color: sunAlt,
        center: [width * cfg.suns.small.positionXRatio, height * cfg.suns.small.positionYRatio],
        stripeGap: cfg.suns.small.stripeGap,
        stripeThickness: cfg.suns.small.stripeThickness,
        animatePulse: true,
        pulseScale: cfg.suns.small.pulseScale,
        pulseDuration: cfg.suns.small.pulseDuration,
        background: bg,
      })}
    </Node>,
  );

  // Mountain silhouette along the horizon for depth
  const mountainBase = horizonY + height * cfg.mountains.baseYOffsetRatio;
  view.add(
    Mountains({
      color: mountain,
      width,
      height,
      baseY: mountainBase,
      bottomY,
      ridge: cfg.mountains.ridge as number[][],
    }),
  );

  // Retro grid floor
  view.add(
    GridFloor({
      width,
      bottomY,
      horizonY,
      vanishingX: width * cfg.layout.vanishingXRatio,
      stroke: cfg.colors.gridStroke,
      glow: cfg.colors.gridGlow,
      verticalCount: cfg.grid.verticalCount,
      horizontalCount: cfg.grid.horizontalCount,
      railBottomWidthFactor: cfg.grid.railBottomWidthFactor,
      verticalLineWidth: cfg.grid.verticalLineWidth,
      hWidthMin: cfg.grid.hWidthMin,
      hWidthMaxExtra: cfg.grid.hWidthMaxExtra,
      lineBaseWidth: cfg.grid.lineBaseWidth,
      lineGrowWidth: cfg.grid.lineGrowWidth,
      lineWidthGrowthPower: cfg.grid.lineWidthGrowthPower,
      flowDuration: cfg.grid.flowDuration,
      glowAltFrequency: cfg.grid.glowAltFrequency,
      perspectiveExponent: cfg.grid.perspectiveExponent,
    }),
  );

  // Center text (neon flicker)
  view.add(
    TitleText({
      y: height * cfg.layout.titleYOffsetRatio,
      text: cfg.title.text,
      fontFamily: cfg.title.fontFamily,
      main: {
        fontSize: height * cfg.title.fontSizeRatio,
        fill: cfg.colors.text,
      },
      glow: {
        fontSize: height * cfg.title.glow.fontSizeRatio,
        color: cfg.colors.textGlow,
        opacity: cfg.title.glow.opacity,
        scale: cfg.title.glow.scale,
      },
      flicker: cfg.title.flicker,
    }),
  );

  // Keep the scene running long for live use
  // You can trim in render settings if needed.
  yield* loop(cfg.loop.ticks, function* () {
    // 600 lightweight ticks to keep the scene alive ~indefinitely in preview
    yield;
  });
});
