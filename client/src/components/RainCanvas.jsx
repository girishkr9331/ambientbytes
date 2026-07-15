import { useEffect, useRef } from 'react';

export default function RainCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Rain drops
    const drops = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      len: Math.random() * 18 + 8,
      speed: Math.random() * 3 + 2,
      opacity: Math.random() * 0.35 + 0.1,
      width: Math.random() < 0.3 ? 1.5 : 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.strokeStyle = `rgba(88, 166, 255, ${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.stroke();

        d.y += d.speed;
        if (d.y > canvas.height + d.len) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
          d.opacity = Math.random() * 0.35 + 0.1;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="rain-canvas" aria-hidden="true" />;
}
