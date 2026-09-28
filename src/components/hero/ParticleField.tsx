import { useEffect, useRef } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const LINK_DISTANCE = 120;
const POINTER_DISTANCE = 170;

/**
 * Subtle node network behind the hero. Canvas 2D, capped DPR and particle count,
 * paused when off-screen or when the tab is hidden, static under reduced motion.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Kept across effect runs so scrolling away and back doesn't reshuffle the field.
  const particlesRef = useRef<Particle[]>([]);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ threshold: 0 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let particles = particlesRef.current;
    let frame = 0;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(width < 720 ? 32 : 78, Math.round((width * height) / 16000));
      if (particles.length !== target) {
        particles = Array.from({ length: target }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
        }));
        particlesRef.current = particles;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(92, 200, 214, ${0.13 * (1 - dist / LINK_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (pd < POINTER_DISTANCE) {
          ctx.strokeStyle = `rgba(242, 169, 59, ${0.22 * (1 - pd / POINTER_DISTANCE)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(141, 153, 166, 0.55)';
        ctx.fillRect(a.x - 1, a.y - 1, 2, 2);
      }
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    const running = inView && !reducedMotion && document.visibilityState === 'visible';
    if (running) frame = requestAnimationFrame(step);
    else draw();

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState === 'visible' && inView && !reducedMotion) frame = requestAnimationFrame(step);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    ro.observe(canvas);
    const host = canvas.parentElement?.parentElement ?? canvas;
    host.addEventListener('pointermove', onPointer);
    host.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      host.removeEventListener('pointermove', onPointer);
      host.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [inView, reducedMotion]);

  return (
    <div ref={wrapRef} className="particles" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
