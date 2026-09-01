"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MeshGradientProps extends React.ComponentProps<"div"> {
  colors?: string[];
  speed?: number;
}

export function MeshGradient({
  colors = ["#FFFFFF", "#EFF6FF", "#DBEAFE", "#BFDBFE"],
  speed = 0.002,
  className,
  children,
  ...props
}: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 800);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Color points for smooth flowing blobs
    const points = [
      { x: 0.2 * width, y: 0.2 * height, vx: 0.4, vy: 0.6, radius: 0.6 * width, color: colors[0] || "#FFFFFF" },
      { x: 0.8 * width, y: 0.3 * height, vx: -0.5, vy: 0.4, radius: 0.7 * width, color: colors[1] || "#EFF6FF" },
      { x: 0.3 * width, y: 0.8 * height, vx: 0.6, vy: -0.3, radius: 0.8 * width, color: colors[2] || "#DBEAFE" },
      { x: 0.7 * width, y: 0.7 * height, vx: -0.3, vy: -0.5, radius: 0.65 * width, color: colors[3] || "#BFDBFE" },
    ];

    let t = 0;
    const render = () => {
      t += speed;
      ctx.clearRect(0, 0, width, height);

      // Base background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Draw flowing radial gradients
      points.forEach((p, idx) => {
        p.x += Math.sin(t + idx) * p.vx * 1.5;
        p.y += Math.cos(t + idx * 1.3) * p.vy * 1.5;

        // Keep inside bounds
        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -100) p.y = height + 100;
        if (p.y > height + 100) p.y = -100;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, speed]);

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)} {...props}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

export default MeshGradient;
