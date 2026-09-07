"use client";

import { useEffect, useRef, type ReactNode } from "react";

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(e0: number, e1: number, v: number) {
  const x = clamp((v - e0) / (e1 - e0));
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Scroll-triggered reveal driven by a smoothstep-eased, lerp-smoothed
 * requestAnimationFrame loop (same easing/smoothing approach as a
 * scroll-scrubbed cinematic engine) instead of a fixed-duration CSS
 * keyframe. The rAF loop only runs while the current value is still
 * converging toward its target, and prefers-reduced-motion snaps
 * straight to the resting state.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let target = 0;
    let current = 0;
    let rafId: number | null = null;
    let started = false;
    let timeoutId: number | null = null;

    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${y}px, 0)`;
    el.style.willChange = "transform, opacity";

    function paint(progress: number) {
      const eased = smoothstep(0, 1, progress);
      el!.style.opacity = String(eased);
      el!.style.transform = `translate3d(0, ${(1 - eased) * y}px, 0)`;
    }

    function tick() {
      rafId = null;
      current = reduceMotion.matches ? target : lerp(current, target, 0.14);
      if (Math.abs(current - target) < 0.002) current = target;

      paint(current);

      if (current !== target) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function requestTick() {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        target = entry.isIntersecting ? 1 : 0;

        if (!started && entry.isIntersecting) {
          started = true;
          timeoutId = window.setTimeout(requestTick, reduceMotion.matches ? 0 : delay);
        } else if (started) {
          requestTick();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
