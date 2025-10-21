import {Node, Rect, makeScene2D} from '@motion-canvas/2d';
import {loop} from '@motion-canvas/core';
import cfg from '../config/starlit-lobby.json';
import {GridFloor} from '../components/GridFloor';
import {TitleText} from '../components/TitleText';
import {Starfield} from '../components/Starfield';
import {Cityscape} from '../components/Cityscape';
import {ShootingStar} from '../components/ShootingStar';

export default makeScene2D(function* (view) {
  const width = view.width();
  const height = view.height();

  // Scene layout metrics
  const horizonY = height * cfg.layout.horizonYOffsetRatio;
  const bottomY = height * cfg.layout.bottomYRatio;

  // Colors
  const bg = cfg.colors.background;
  const city = cfg.colors.city;

  // Background
  view.add(
    <Rect width={width} height={height} fill={bg} position={[0, 0]} />, 
  );

  // Star field in the sky
  view.add(
    Starfield({
      width,
      height,
      count: cfg.stars.count,
      color: cfg.stars.color,
      minRadius: cfg.stars.minRadius,
      maxRadius: cfg.stars.maxRadius,
      twinkle: cfg.stars.twinkle,
      minOpacity: cfg.stars.minOpacity,
      maxOpacity: cfg.stars.maxOpacity,
      minTwinkleDuration: cfg.stars.minTwinkleDuration,
      maxTwinkleDuration: cfg.stars.maxTwinkleDuration,
      flicker: cfg.stars.flicker,
    }),
  );

  // Shooting star / meteoroid (add behind city and grid so it passes beneath them)
  if (cfg.meteor?.enabled) {
    view.add(
      ShootingStar({
        width,
        height,
        color: cfg.meteor.color,
        headRadius: cfg.meteor.headRadius,
        trailCount: cfg.meteor.trailCount,
        trailSpacing: cfg.meteor.trailSpacing,
        trailOpacityDecay: cfg.meteor.trailOpacityDecay,
        angleDeg: cfg.meteor.angleDeg,
        speed: cfg.meteor.speed,
        minDelay: cfg.meteor.minDelay,
        maxDelay: cfg.meteor.maxDelay,
        startXRatioMin: cfg.meteor.startXRatioMin,
        startXRatioMax: cfg.meteor.startXRatioMax,
        startYRatioMin: cfg.meteor.startYRatioMin,
        startYRatioMax: cfg.meteor.startYRatioMax,
        horizontal: cfg.meteor.horizontal,
        randomDirections: cfg.meteor.randomDirections,
        skyBottomY: horizonY,
        skyMargin: cfg.meteor.skyMargin,
        driftYMax: cfg.meteor.driftYMax,
      }),
    );
  }

  // City silhouette near the horizon for a different vibe
  const cityBase = horizonY + height * cfg.city.baseYOffsetRatio;
  view.add(
    Cityscape({
      color: city,
      width,
      height,
      baseY: cityBase,
      bottomY,
      ridge: cfg.city.ridge as number[][],
    }),
  );

  // Grid floor remains for coherence with the original
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
