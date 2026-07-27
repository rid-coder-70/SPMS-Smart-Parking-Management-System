import { useRef, useEffect } from "react";
export const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let particles = [];
    let animationFrameId;
    let lastTime = performance.now();
    let mouse = { x: -1e3, y: -1e3 };
    const resize = () => {
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
      const numParticles = Math.floor(window.innerWidth * window.innerHeight / 12e3);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          // Base speed adjusted for time-based animation (pixels per millisecond)
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04,
          radius: Math.random() * 1.5 + 1
        });
      }
    };
    const draw = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      const dt = Math.min(deltaTime, 32);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x <= 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x >= window.innerWidth) {
          p.x = window.innerWidth;
          p.vx *= -1;
        }
        if (p.y <= 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y >= window.innerHeight) {
          p.y = window.innerHeight;
          p.vy *= -1;
        }
      });
      const maxDist = 150;
      const maxDistSq = maxDist * maxDist;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const opacity = 1 - dist / maxDist;
            ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.7})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        if (mouse.x !== -1e3) {
          const dxMouse = particles[i].x - mouse.x;
          const dyMouse = particles[i].y - mouse.y;
          const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
          const mouseMaxDist = 180;
          const mouseMaxDistSq = mouseMaxDist * mouseMaxDist;
          if (distMouseSq < mouseMaxDistSq) {
            const distMouse = Math.sqrt(distMouseSq);
            const opacity = 1 - distMouse / mouseMaxDist;
            ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.85})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(249, 115, 22, 0.8)";
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1e3;
      mouse.y = -1e3;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    resize();
    lastTime = performance.now();
    draw(lastTime);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas
    ref={canvasRef}
    className="fixed inset-0 pointer-events-none z-0"
  />;
};
