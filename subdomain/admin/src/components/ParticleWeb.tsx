"use client";

import { useEffect, useRef, memo } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface ParticleWebProps {
  particleCount?: number;
  connectionDistance?: number;
  particleColor?: string;
  lineColor?: string;
  speed?: number;
  mouseRepelRadius?: number;
  mouseRepelForce?: number;
  className?: string;
  mode?: 'network' | 'drift' | 'pulse';
}

const ParticleWeb = memo(function ParticleWeb({
  particleCount = 80,
  connectionDistance = 130,
  particleColor = "160,140,255",
  lineColor = "130,110,255",
  speed = 0.5,
  mouseRepelRadius = 100,
  mouseRepelForce = 2,
  className = "",
  mode = 'network',
}: ParticleWebProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initParticles = (w: number, h: number) => {
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: 0.8 + Math.random() * 1.4,
        opacity: 0.4 + Math.random() * 0.6,
      }));
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist2 = dx * dx + dy * dy;
        const repelRadius2 = mouseRepelRadius * mouseRepelRadius;
        if (dist2 < repelRadius2 && dist2 > 0) {
          const dist = Math.sqrt(dist2);
          const force = (mouseRepelRadius - dist) / mouseRepelRadius;
          p.x += (dx / dist) * force * mouseRepelForce;
          p.y += (dy / dist) * force * mouseRepelForce;
        }
      });

      const pts = particlesRef.current;
      
      if (mode === 'network') {
        const connectionDistance2 = connectionDistance * connectionDistance;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < connectionDistance2) {
              const d = Math.sqrt(d2);
              const alpha = (1 - d / connectionDistance) * 0.4;
              ctx.strokeStyle = `rgba(${lineColor},${alpha})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
            }
          }
          ctx.fillStyle = `rgba(${particleColor},${pts[i].opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(pts[i].x, pts[i].y, pts[i].size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'drift') {
        pts.forEach(p => {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 20);
          gradient.addColorStop(0, `rgba(${particleColor},${p.opacity * 0.2})`);
          gradient.addColorStop(1, `rgba(${particleColor},0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 20, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = `rgba(${particleColor},${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (mode === 'pulse') {
        pts.forEach(p => {
          const pulse = Math.sin(Date.now() * 0.002 + p.x) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(${particleColor},${pulse * p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [particleCount, connectionDistance, particleColor, lineColor, speed, mouseRepelRadius, mouseRepelForce, mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ pointerEvents: "none" }}
    />
  );
});

export default ParticleWeb;
