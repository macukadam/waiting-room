import {Node, Txt} from '@motion-canvas/2d';
import {createRef, loop, spawn} from '@motion-canvas/core';

export interface TitleFlickerConfig {
  opacityMin: number;
  opacityDown: number;
  opacityUp: number;
  glitchX1: number;
  glitchX2: number;
  glitchStep: number;
  scaleUp: number;
  scaleUpDuration: number;
  scaleDownDuration: number;
}

export interface TitleTextProps {
  y: number;
  text: string;
  fontFamily: string;
  textAlign?: CanvasTextAlign;
  main: {
    fontSize: number;
    fill: string;
  };
  glow: {
    fontSize: number;
    color: string;
    opacity: number;
    scale: number;
  };
  flicker?: TitleFlickerConfig;
}

export function TitleText(props: TitleTextProps): Node {
  const {
    y,
    text,
    fontFamily,
    textAlign = 'center',
    main,
    glow,
    flicker,
  } = props;

  const title = createRef<Txt>();
  const group = (
    <Node y={y}>
      <Txt
        text={text}
        fontFamily={fontFamily}
        fontSize={glow.fontSize}
        fill={glow.color}
        opacity={glow.opacity}
        scale={glow.scale}
        textAlign={textAlign}
      />
      <Txt
        ref={title}
        text={text}
        fontFamily={fontFamily}
        fontSize={main.fontSize}
        fill={main.fill}
        textAlign={textAlign}
      />
    </Node>
  );

  if (flicker) {
    spawn(
      loop(function* () {
        yield* title().opacity(flicker.opacityMin, flicker.opacityDown).to(1, flicker.opacityUp);
        yield* title().x(flicker.glitchX1, flicker.glitchStep).to(flicker.glitchX2, flicker.glitchStep).to(0, flicker.glitchStep);
        yield* title().scale(flicker.scaleUp, flicker.scaleUpDuration).to(1, flicker.scaleDownDuration);
      }),
    );
  }

  return group;
}

