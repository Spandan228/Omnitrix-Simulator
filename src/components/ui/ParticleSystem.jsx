import React, { useEffect, useRef } from 'react';

const ParticleSystem = ({ active, color = '#22c55e' }) => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        particles.current = Array.from({ length: 50 }).map(() => ({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            radius: Math.random() * 4 + 2,
            alpha: 1,
            life: Math.random() * 0.5 + 0.5
        }));

        let lastTime = performance.now();

        const animate = (time) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let aliveParticles = 0;

            particles.current.forEach(p => {
                if (p.alpha <= 0) return;
                aliveParticles++;

                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= dt * (1 / p.life);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            if (aliveParticles > 0) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [active, color]);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 w-[400px] h-[400px]"
        />
    );
};

export default ParticleSystem;
