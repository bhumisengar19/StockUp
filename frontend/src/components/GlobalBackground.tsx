import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/* ─── helpers ─────────────────────────────────────────────────── */
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface Star {
  x: number; y: number; r: number; opacity: number; speed: number;
}

export default function GlobalBackground() {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const starsRef  = useRef<Star[]>([]);
  const timeRef   = useRef(0);

  /* build star array once */
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    starsRef.current = Array.from({ length: 180 }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.4, 2.2),
      opacity: rand(0.3, 1),
      speed: rand(0.003, 0.012),
    }));
  }, []);

  /* canvas animation loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isDark) {
        /* ── night stars ── */
        starsRef.current.forEach(star => {
          const twinkle = (Math.sin(t * star.speed * 60 + star.x) + 1) / 2;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${star.opacity * 0.5 + twinkle * star.opacity * 0.5})`;
          ctx.fill();
        });
      } else {
        /* ── day birds ── */
        const birds = [
          { bx: 120, by: 80, phase: 0 },
          { bx: 180, by: 60, phase: 0.4 },
          { bx: 230, by: 90, phase: 0.8 },
          { bx: 320, by: 55, phase: 1.2 },
          { bx: 380, by: 75, phase: 0.2 },
          { bx: 550, by: 100, phase: 0.6 },
          { bx: 610, by: 80, phase: 1.0 },
        ];
        ctx.strokeStyle = 'rgba(30,80,160,0.35)';
        ctx.lineWidth = 1.5;
        birds.forEach(b => {
          const drift = Math.sin(t * 0.4 + b.phase) * 8;
          const x = ((b.bx + t * 14) % (canvas.width + 100)) - 50;
          const y = b.by + drift;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 7, y - 4 - Math.abs(Math.sin(t * 2 + b.phase)) * 3, x + 14, y);
          ctx.moveTo(x + 14, y);
          ctx.quadraticCurveTo(x + 21, y - 4 - Math.abs(Math.sin(t * 2 + b.phase + 0.5)) * 3, x + 28, y);
          ctx.stroke();
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <>
      {/* ── fixed full-screen background ── */}
      <div
        className="fixed inset-0 -z-10 transition-all duration-700 ease-in-out"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #020817 0%, #0a1628 30%, #0d1f3c 60%, #0f2347 100%)'
            : 'linear-gradient(180deg, #bfdbfe 0%, #93c5fd 20%, #dbeafe 55%, #eff6ff 80%, #f0f9ff 100%)',
        }}
      />

      {/* ── Sun (light) / Moon (dark) ── */}
      {!isDark && (
        <div
          className="fixed top-8 right-16 -z-10 transition-all duration-700 parallax-layer"
          data-depth="0.04"
          style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fef08a 30%, #fde047 60%, #facc15 100%)',
            boxShadow: '0 0 60px 30px rgba(253,224,71,0.45), 0 0 120px 60px rgba(253,224,71,0.2)',
            animation: 'sunPulse 4s ease-in-out infinite',
          }}
        />
      )}
      {isDark && (
        <div
          className="fixed top-10 right-16 -z-10 transition-all duration-700 parallax-layer"
          data-depth="0.04"
          style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #e2e8f0 40%, #cbd5e1 70%, #94a3b8 100%)',
            boxShadow: '0 0 40px 20px rgba(148,163,184,0.3), 0 0 80px 40px rgba(148,163,184,0.1)',
            animation: 'moonPulse 5s ease-in-out infinite',
          }}
        />
      )}

      {/* ── CSS Clouds ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden parallax-layer" data-depth="0.015">
        {/* Cloud layer 1 — back */}
        <div
          className="cloud-back parallax-layer"
          data-depth="0.02"
          style={{
            opacity: isDark ? 0.12 : 0.7,
            background: isDark
              ? 'rgba(148,163,184,0.6)'
              : 'rgba(255,255,255,0.9)',
            animationDuration: '80s',
            top: '12%', left: '-200px',
          }}
        />
        <div
          className="cloud-back parallax-layer"
          data-depth="0.025"
          style={{
            opacity: isDark ? 0.1 : 0.5,
            background: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(255,255,255,0.85)',
            animationDuration: '65s',
            animationDelay: '-30s',
            top: '25%', left: '-160px',
          }}
        />
        {/* Cloud layer 2 — front */}
        <div
          className="cloud-front parallax-layer"
          data-depth="0.035"
          style={{
            opacity: isDark ? 0.15 : 0.85,
            background: isDark ? 'rgba(100,116,139,0.7)' : 'rgba(255,255,255,0.95)',
            animationDuration: '50s',
            animationDelay: '-10s',
            top: '8%', left: '-260px',
          }}
        />
        <div
          className="cloud-front parallax-layer"
          data-depth="0.04"
          style={{
            opacity: isDark ? 0.12 : 0.75,
            background: isDark ? 'rgba(100,116,139,0.6)' : 'rgba(255,255,255,0.9)',
            animationDuration: '42s',
            animationDelay: '-22s',
            top: '18%', left: '-200px',
          }}
        />
        <div
          className="cloud-front parallax-layer"
          data-depth="0.045"
          style={{
            opacity: isDark ? 0.1 : 0.6,
            background: isDark ? 'rgba(100,116,139,0.5)' : 'rgba(255,255,255,0.85)',
            animationDuration: '55s',
            animationDelay: '-40s',
            top: '35%', left: '-180px',
          }}
        />
      </div>

      {/* ── Canvas: stars (night) & birds (day) ── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-700"
        style={{ opacity: isDark ? 1 : 0.8 }}
      />
    </>
  );
}
