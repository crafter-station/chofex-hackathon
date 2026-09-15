"use client";

import { useEffect, useRef } from "react";

import {
  LENS_RADIUS,
  LIQUID_FRAGMENT,
  LIQUID_VERTEX,
} from "@/components/landing-v2/liquid-shader";
import {
  advancePointer,
  magnetTarget,
  type Pointer,
  pointerSpeed,
  RESTING_POINTER,
  springDistort,
} from "@/components/landing-v2/magnet";
import {
  PALETTE_EASE,
  paletteAt,
  scrollPalettePosition,
} from "@/components/landing-v2/palette";

/**
 * Plain WebGL, no Three.
 *
 * The backdrop is one triangle and one fragment program with nothing to load,
 * so a scene graph here would be several hundred kilobytes of library standing
 * between a uniform and a draw call. The hero's terrain is a different problem
 * and keeps its own renderer.
 */

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Surfaced rather than swallowed: a shader that fails to compile leaves a
    // blank page, and a blank page with a silent console is unfindable.
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, LIQUID_VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, LIQUID_FRAGMENT);
  if (!vertex || !fragment) {
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export type BackdropCanvasProps = {
  readonly quality: "low" | "high";
  readonly reducedMotion?: boolean;
  readonly onContextLost?: () => void;
  readonly onPainted?: () => void;
};

export function BackdropCanvas({
  quality,
  reducedMotion = false,
  onContextLost,
  onPainted,
}: BackdropCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerTarget = useRef({ x: 0.5, y: 0.66 });
  const paintedRef = useRef(false);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      onContextLost?.();
      return;
    }

    const program = link(gl);
    if (!program) {
      onContextLost?.();
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // One oversized triangle rather than a quad: no seam down the diagonal and
    // one fewer vertex to think about.
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    // Binding the program: a WebGL call that only looks like a React hook.
    // biome-ignore lint/correctness/useHookAtTopLevel: not a hook, a GL call.
    gl.useProgram(program);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uRes = uniform("uRes");
    const uLens = uniform("uLens");
    const uLensR = uniform("uLensR");
    const uDistort = uniform("uDistort");
    const uVel = uniform("uVel");
    const uScroll = uniform("uScroll");
    const uSettle = uniform("uSettle");
    const uBase = uniform("uBase");
    const uDim = uniform("uDim");
    const uRim = uniform("uRim");
    const uLow = uniform("uLow");
    const uEdge = uniform("uEdge");
    const uBulk = uniform("uBulk");

    /*
     * No glass without a cursor to carry it. On a touch screen the lens has
     * nothing to follow and simply sits in the middle of the page as a smudge
     * the reader cannot move or explain.
     */
    const lensRadius = window.matchMedia("(pointer: fine)").matches
      ? LENS_RADIUS
      : 0;

    let pointer: Pointer = RESTING_POINTER;
    let distort = 0;
    let flow = 0;
    let frame = 0;
    const opening = paletteAt(0);
    const palette = {
      rim: [...opening.rim] as [number, number, number],
      low: [...opening.low] as [number, number, number],
      edge: [...opening.edge] as [number, number, number],
      bulk: [...opening.bulk] as [number, number, number],
    };

    const ease = (
      current: [number, number, number],
      next: readonly [number, number, number],
      t: number,
    ) => {
      current[0] += (next[0] - current[0]) * t;
      current[1] += (next[1] - current[1]) * t;
      current[2] += (next[2] - current[2]) * t;
    };

    const resize = () => {
      // Capped at 1.5: every pixel of this runs five blurred taps of three
      // octaves each, and a 3x retina buffer costs four times that for a field
      // whose whole job is to be out of focus.
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        quality === "high" ? 1.5 : 1,
      );
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width === width && canvas.height === height) {
        return;
      }
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const render = () => {
      frame = requestAnimationFrame(render);
      resize();

      const reduced = reducedRef.current;

      // Position moves the glass; velocity drives the magnet.
      pointer = advancePointer({
        ...pointer,
        targetX: pointerTarget.current.x,
        targetY: pointerTarget.current.y,
      });
      distort = reduced
        ? 0
        : springDistort(distort, magnetTarget(pointerSpeed(pointer), reduced));

      const viewport = Math.max(1, window.innerHeight);
      const scrolled = window.scrollY / viewport;
      flow += (scrolled - flow) * 0.1;

      const wanted = paletteAt(
        scrollPalettePosition(
          window.scrollY,
          document.documentElement.scrollHeight,
          viewport,
        ),
      );
      const t = reduced ? 1 : PALETTE_EASE;
      ease(palette.rim, wanted.rim, t);
      ease(palette.low, wanted.low, t);
      ease(palette.edge, wanted.edge, t);
      ease(palette.bulk, wanted.bulk, t);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uLens, pointer.x, 1 - pointer.y);
      gl.uniform1f(uLensR, lensRadius);
      gl.uniform1f(uDistort, distort);
      // uLens flips y, so the velocity the shader drags along flips with it.
      gl.uniform2f(uVel, pointer.velocityX, -pointer.velocityY);
      gl.uniform1f(uScroll, flow);
      /*
       * The pooling is the hero's, and only the hero's.
       *
       * It exists so the drawing has black to sit in and the colour has a floor
       * to lie on. Carried down the page it becomes a permanent bright band
       * across the bottom of the viewport — which is where the next section's
       * first line always is — so it lets go within the first screen and the
       * sections get the field's own uneven patches instead.
       */
      gl.uniform1f(uSettle, Math.max(0, 1 - flow * 1.2));
      // Where the drawn range meets the ground in the hero's framing. Measured
      // off the rendered frame rather than derived — the camera is parked, so
      // it is a constant, and tying it to the terrain's projection would be a
      // lot of machinery for one number.
      gl.uniform1f(uBase, 0.5);
      // Full strength in the hero, then down to a glow the sections can be read
      // over. See the note in the shader for the measurements behind it.
      gl.uniform1f(uDim, 1 - Math.min(1, flow * 0.9) * 0.55);
      gl.uniform3f(uRim, ...palette.rim);
      gl.uniform3f(uLow, ...palette.low);
      gl.uniform3f(uEdge, ...palette.edge);
      gl.uniform3f(uBulk, ...palette.bulk);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!paintedRef.current) {
        paintedRef.current = true;
        onPainted?.();
      }
    };

    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      onContextLost?.();
    };
    canvas.addEventListener("webglcontextlost", lost, { once: true });

    /*
     * Listened for on the window, not on the canvas. The backdrop sits behind
     * every section and takes no pointer events itself, so the cursor is
     * almost always over something else — a heading, a card, the footer — and
     * a canvas-local listener would see it perhaps twice a page.
     */
    const track = (event: globalThis.PointerEvent) => {
      pointerTarget.current = {
        x: event.clientX / Math.max(1, window.innerWidth),
        y: event.clientY / Math.max(1, window.innerHeight),
      };
    };
    window.addEventListener("pointermove", track, { passive: true });

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", track);
      canvas.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [onContextLost, onPainted, quality]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 size-full"
    />
  );
}
