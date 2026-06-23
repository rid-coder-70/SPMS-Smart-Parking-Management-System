import React, { useRef, useEffect } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    let animationFrameId: number;
    let lastTime = performance.now();
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      // 1. High-DPI screen scaling for crystal clear rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 12000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          // Base speed adjusted for time-based animation (pixels per millisecond)
          vx: (Math.random() - 0.5) * 0.04, 
          vy: (Math.random() - 0.5) * 0.04,
          radius: Math.random() * 1.5 + 1,
        });
      }
    };

    const draw = (currentTime: number) => {
      // 2. Delta time calculation for frame-rate independence
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Cap deltaTime to prevent particles from jumping if you switch tabs
      const dt = Math.min(deltaTime, 32); 

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Update positions
      particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Smooth edge collision
        if (p.x <= 0) { p.x = 0; p.vx *= -1; }
        else if (p.x >= window.innerWidth) { p.x = window.innerWidth; p.vx *= -1; }
        
        if (p.y <= 0) { p.y = 0; p.vy *= -1; }
        else if (p.y >= window.innerHeight) { p.y = window.innerHeight; p.vy *= -1; }
      });

      // Pre-calculated max distances for faster math
      const maxDist = 150; // Increased distance for better network forming
      const maxDistSq = maxDist * maxDist;

      // Draw lines between particles
      ctx.lineWidth = 0.6; // Slightly thicker lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            // Stronger opacity for better visibility on white background
            const opacity = 1 - dist / maxDist;
            ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.7})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // --- HOVER EFFECT: Draw lines to mouse ---
        if (mouse.x !== -1000) {
          const dxMouse = particles[i].x - mouse.x;
          const dyMouse = particles[i].y - mouse.y;
          const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
          const mouseMaxDist = 180;
          const mouseMaxDistSq = mouseMaxDist * mouseMaxDist;

          if (distMouseSq < mouseMaxDistSq) {
            const distMouse = Math.sqrt(distMouseSq);
            const opacity = 1 - distMouse / mouseMaxDist;
            ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.85})`; // Brighter connection to mouse
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'; // Stronger particle color
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    resize();
    
    // Kickstart the loop properly with a timestamp
    lastTime = performance.now();
    draw(lastTime);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};