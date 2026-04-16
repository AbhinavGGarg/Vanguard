'use client';

import { useEffect, useRef } from 'react';

type TrailPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hueShift: number;
};

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const pointerRef = useRef({ x: 0, y: 0, hasMoved: false });
  const rafRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pushTrailPoint = (x: number, y: number, speed = 0.4) => {
      const baseSize = 34 + Math.min(speed * 16, 22);
      const maxLife = 44 + Math.min(speed * 10, 18);
      const hueShift = Math.random();
      pointsRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: maxLife,
        maxLife,
        size: baseSize,
        hueShift,
      });

      if (pointsRef.current.length > 220) {
        pointsRef.current.splice(0, pointsRef.current.length - 220);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      pointerRef.current = { x, y, hasMoved: true };

      const previous = lastPosRef.current;
      if (!previous) {
        pushTrailPoint(x, y, 0.2);
        lastPosRef.current = { x, y };
        return;
      }

      const dx = x - previous.x;
      const dy = y - previous.y;
      const distance = Math.hypot(dx, dy);
      const speed = Math.min(distance / 16, 2.4);
      const segments = Math.min(6, Math.max(1, Math.floor(distance / 18)));

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        pushTrailPoint(previous.x + dx * t, previous.y + dy * t, speed);
      }

      lastPosRef.current = { x, y };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      const nextPoints: TrailPoint[] = [];
      for (const point of pointsRef.current) {
        const lifeRatio = point.life / point.maxLife;
        if (lifeRatio <= 0) continue;

        point.life -= 1;
        point.x += point.vx;
        point.y += point.vy;

        const radius = point.size * (0.7 + lifeRatio * 0.55);
        const alpha = lifeRatio * 0.24;

        const blue = `rgba(59,130,246,${alpha})`;
        const cyan = `rgba(56,189,248,${alpha * 0.92})`;
        const purple = `rgba(139,92,246,${alpha * 0.9})`;

        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        const outerColor = point.hueShift > 0.5 ? purple : cyan;
        gradient.addColorStop(0, blue);
        gradient.addColorStop(0.45, outerColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (point.life > 0) {
          nextPoints.push(point);
        }
      }

      pointsRef.current = nextPoints;
      rafRef.current = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(85rem_55rem_at_12%_8%,rgba(59,130,246,0.2),transparent_58%),radial-gradient(75rem_48rem_at_85%_92%,rgba(14,165,233,0.14),transparent_62%),radial-gradient(54rem_34rem_at_82%_14%,rgba(139,92,246,0.11),transparent_65%),linear-gradient(160deg,#070c16_0%,#090f1b_45%,#070b14_100%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90 [mix-blend-mode:screen]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.16)_70%,rgba(2,6,23,0.34)_100%)]" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(rgba(255,255,255,0.8)_0.45px,transparent_0.45px)] [background-size:3px_3px] [mix-blend-mode:soft-light]" />
    </div>
  );
}
