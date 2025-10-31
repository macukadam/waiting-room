import {Node, Rect, makeScene2D} from '@motion-canvas/2d';
import {loop} from '@motion-canvas/core';
import cfg from '../config/dead-star.json';
import {GridFloor} from '../components/GridFloor';
import {TitleText} from '../components/TitleText';
import {Mountains} from '../components/Mountains';
import {DeadStar} from '../components/DeadStar';

export default makeScene2D(function* (view) {
  const width = view.width();
  const height = view.height();

  // Scene layout metrics
  const horizonY = height * cfg.layout.horizonYOffsetRatio;
  const bottomY = height * cfg.layout.bottomYRatio;

  // Colors
  const bg = cfg.colors.background;
  const mountain = cfg.colors.mountain;

  // Background
  view.add(<Rect width={width} height={height} fill={bg} position={[0, 0]} />);

  // Dead Star in the sky
  view.add(
    DeadStar({
      center: [width * cfg.deadStar.positionXRatio, height * cfg.deadStar.positionYRatio],
      radius: height * cfg.deadStar.radiusRatio,
      coreColor: cfg.colors.deadCore,
      haloColor: cfg.colors.deadHalo,
      crackColor: cfg.colors.deadCracks,
      ringColor: cfg.colors.deadRing,
      haloLayers: cfg.deadStar.haloLayers,
      haloScaleMin: cfg.deadStar.haloScaleMin,
      haloScaleMax: cfg.deadStar.haloScaleMax,
      haloPulseDuration: cfg.deadStar.haloPulseDuration,
      haloOpacity: cfg.deadStar.haloOpacity,
      crackCount: cfg.deadStar.crackCount,
      crackWidth: cfg.deadStar.crackWidth,
      crackFlickerMin: cfg.deadStar.crackFlickerMin,
      crackFlickerMax: cfg.deadStar.crackFlickerMax,
      ringRadiusFactor: cfg.deadStar.ringRadiusFactor,
      ringParticleCount: cfg.deadStar.ringParticleCount,
      ringParticleMin: cfg.deadStar.ringParticleMin,
      ringParticleMax: cfg.deadStar.ringParticleMax,
      ringRotationSeconds: cfg.deadStar.ringRotationSeconds,
      ringTiltDeg: cfg.deadStar.ringTiltDeg,
      ringOpacity: cfg.deadStar.ringOpacity,
      embers: cfg.deadStar.embers,
    }),
  );

  // Horizon mountains
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

  // Retro grid floor for coherence
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

  // Title
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

  // Keep the scene alive
  yield* loop(cfg.loop.ticks, function* () {
    yield;
  });
});

