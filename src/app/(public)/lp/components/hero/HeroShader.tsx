"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uBg;
  uniform vec3 uTeal;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.8, 0.6, -0.6, 0.8);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    vec2 mouse = (uMouse - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.03;

    float base = fbm(p * 2.4 + vec2(t, -t * 0.6));
    float detail = fbm(p * 5.0 - vec2(t * 0.8, t * 0.35));
    float mouseGlow = smoothstep(0.95, 0.0, distance(p, mouse));

    float field = smoothstep(0.32, 0.95, base) * 0.5 + detail * 0.18 + mouseGlow * 0.28;
    field = clamp(field, 0.0, 0.75);

    gl_FragColor = vec4(mix(uBg, uTeal, field), 1.0);
  }
`;

type Rgb = readonly [number, number, number];

const FALLBACK_BG: Rgb = [0.06, 0.1, 0.12];
const FALLBACK_TEAL: Rgb = [0.25, 0.78, 0.72];

/** Converte um token CSS (oklch, etc.) em RGB normalizado para o shader. */
function readTokenColor(source: Element, token: string, fallback: Rgb): Rgb {
  try {
    const raw = getComputedStyle(source).getPropertyValue(token).trim();
    if (!raw) {
      return fallback;
    }
    if (typeof CSS !== "undefined" && typeof CSS.supports === "function" && !CSS.supports("color", raw)) {
      return fallback;
    }

    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const context = probe.getContext("2d");
    if (!context) {
      return fallback;
    }

    context.fillStyle = raw;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return [red / 255, green / 255, blue / 255];
  } catch {
    return fallback;
  }
}

function supportsWebGl() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Ruído suave em teal atrás da hero. A posição do mouse é interpolada com
 * spring e o loop pausa fora da tela ou com a aba oculta.
 */
export function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const [supported] = useState(() =>
    typeof document === "undefined" ? false : supportsWebGl(),
  );
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const mouseX = useSpring(pointerX, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(pointerY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
      });
    } catch {
      canvas.style.display = "none";
      return undefined;
    }

    const gl = renderer.gl;
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0.5, 0.5] },
        uBg: { value: [...readTokenColor(canvas, "--lp-bg", FALLBACK_BG)] },
        uTeal: { value: [...readTokenColor(canvas, "--color-primary", FALLBACK_TEAL)] },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const startedAt = performance.now();
    let frame = 0;
    let running = false;
    let onScreen = true;

    const paint = (elapsed: number) => {
      program.uniforms.uTime.value = elapsed;
      program.uniforms.uMouse.value = [mouseX.get(), mouseY.get()];
      renderer.render({ scene: mesh });
    };

    const loop = () => {
      paint((performance.now() - startedAt) / 1000);
      frame = window.requestAnimationFrame(loop);
    };

    const syncRunning = () => {
      if (reduceMotion) {
        if (running) {
          window.cancelAnimationFrame(frame);
          running = false;
        }
        paint(0);
        return;
      }

      const shouldRun = onScreen && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        frame = window.requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        window.cancelAnimationFrame(frame);
      }
    };

    const resize = () => {
      const target = canvas.parentElement ?? canvas;
      const rect = target.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      renderer.setSize(width, height);
      // OGL grava width/height inline; devolve o controle ao layout responsivo.
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      program.uniforms.uRes.value = [width, height];

      if (reduceMotion || !running) {
        paint(reduceMotion ? 0 : (performance.now() - startedAt) / 1000);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      pointerX.set(Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1));
      pointerY.set(Math.min(Math.max(1 - (event.clientY - rect.top) / rect.height, 0), 1));
    };

    const handleVisibility = () => syncRunning();

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            onScreen = entry?.isIntersecting ?? true;
            syncRunning();
          });

    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("visibilitychange", handleVisibility);

    resize();
    syncRunning();

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (running) {
        window.cancelAnimationFrame(frame);
      }
      program.remove();
      geometry.remove();
    };
  }, [mouseX, mouseY, pointerX, pointerY, reduceMotion]);

  if (!supported) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-0 h-full w-full opacity-30"
    />
  );
}
