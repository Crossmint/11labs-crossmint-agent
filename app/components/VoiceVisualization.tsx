'use client';

import { useEffect, useRef } from 'react';

interface VoiceVisualizationProps {
  isSpeaking: boolean;
  status: string;
}

export function VoiceVisualization({ isSpeaking, status }: VoiceVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let animationFrameId: number;
    
    // Function to draw the visualization
    const draw = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (status === 'connected') {
        // When connected:
        if (isSpeaking) {
          // Draw wave when speaking
          drawWave(ctx, canvas.width, canvas.height);
        } else {
          // Draw dots when listening
          drawDots(ctx, canvas.width, canvas.height);
        }
      } else {
        // When not connected (before conversation starts):
        // Draw wave animation
        drawWave(ctx, canvas.width, canvas.height);
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isSpeaking, status]);
  
  // Function to draw a wave pattern
  const drawWave = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ) => {
    const centerY = height / 2;
    const amplitude = height / 4;
    const frequency = 0.05;
    const speed = Date.now() / 500;
    const lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let x = 0; x < width; x++) {
      // Create a wave with varying amplitude
      const y = centerY + Math.sin(x * frequency + speed) * amplitude * 
                (0.5 + 0.5 * Math.sin(x * 0.01 + speed * 0.5));
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = '#ffffff'; // White color for dark background
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };
  
  // Function to draw listening dots
  const drawDots = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerY = height / 2;
    const dotCount = 3; // Three dots as in the image
    const dotRadius = 4; // Base dot size
    const dotSpacing = 60; // Spacing between dots
    const totalWidth = (dotCount - 1) * dotSpacing;
    const startX = (width - totalWidth) / 2;
    
    // Animation timing
    const time = Date.now() / 1000;
    
    for (let i = 0; i < dotCount; i++) {
      const x = startX + i * dotSpacing;
      
      // Create vertical movement for each dot
      // Each dot moves at a different phase to create a wave effect
      const verticalOffset = i * (Math.PI * 2 / 3); // Evenly space the phases
      const yOffset = Math.sin(time * 2 + verticalOffset) * 8; // Vertical movement amplitude
      
      ctx.beginPath();
      ctx.arc(x, centerY + yOffset, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; // White dots for dark background
      ctx.fill();
    }
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-16 rounded-md bg-gray-900"
    />
  );
} 