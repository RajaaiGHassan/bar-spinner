'use client';

import { DRINKS } from '../drinks';
import { useRef, useState, useEffect, useCallback } from 'react';

type Drink = {
  name: string;
  price: string;
  color: string;
  mood: string;
};

function getDrinkIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('whiskey') || lower.includes('rye') || lower.includes('maker') || lower.includes('old fashioned')) return '🥃';
  if (lower.includes('mezcal') || lower.includes('tequila')) return '🥃';
  if (lower.includes('bourbon')) return '🥃';
  return '🍸';
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [winningDrink, setWinningDrink] = useState<Drink | null>(null);

  // Refs to keep track of animation state without resetting on re-renders
  const currentRotationRef = useRef(0);
  const spinStartTimeRef = useRef(0);
  const startRotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Wheel constants
  const size = 600;
  const radius = size * 0.44;
  const textRadius = radius * 0.72;
  const segmentCount = DRINKS.length;
  const angleStep = (Math.PI * 2) / segmentCount;

  const getShortName = (name: string, maxLen = 10) =>
    name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name;

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < segmentCount; i++) {
      const drink = DRINKS[i];
      const start = i * angleStep + rotation;
      const end = start + angleStep;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = drink.color || '#888';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      const midAngle = start + angleStep / 2;
      const x = Math.cos(midAngle) * textRadius;
      const y = Math.sin(midAngle) * textRadius;
      ctx.translate(x, y);

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${radius * 0.045}px "Inter", sans-serif`;
      ctx.shadowBlur = 2;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const shortName = getShortName(drink.name);
      const icon = getDrinkIcon(drink.name);
      ctx.fillText(`${icon} ${shortName}`, 0, 0);
      ctx.restore();
    }

    // Center decoration
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.16, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1625';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.11, 0, 2 * Math.PI);
    ctx.fillStyle = '#EAB308';
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = `bold ${radius * 0.07}px "Inter"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🍸", centerX, centerY + 2);
  }, [segmentCount, angleStep, radius, textRadius]);

  const getSelectedDrinkIndex = useCallback((rotation: number) => {
    const pointerAngle = -Math.PI / 2;
    let rawAngle = pointerAngle - rotation;
    let norm = rawAngle % (Math.PI * 2);
    if (norm < 0) norm += Math.PI * 2;

    for (let i = 0; i < segmentCount; i++) {
      const start = i * angleStep;
      const end = (i + 1) * angleStep;
      if (norm >= start && norm < end) return i;
    }
    return 0;
  }, [angleStep, segmentCount]);

  const animateSpin = useCallback((now: number) => {
    if (!spinStartTimeRef.current) spinStartTimeRef.current = now;
    const elapsed = now - spinStartTimeRef.current;
    const duration = 2500; // 2.5 seconds
    const t = Math.min(1, elapsed / duration);

    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    const currentPos = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * ease;
    currentRotationRef.current = currentPos;
    drawWheel(currentPos);

    if (t < 1) {
      animFrameRef.current = requestAnimationFrame(animateSpin);
    } else {
      setIsSpinning(false);
      const finalRotation = targetRotationRef.current % (Math.PI * 2);
      currentRotationRef.current = finalRotation;
      drawWheel(finalRotation);

      const idx = getSelectedDrinkIndex(finalRotation);
      setWinningDrink(DRINKS[idx]);
      setShowPopup(true);
      
      spinStartTimeRef.current = 0;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [drawWheel, getSelectedDrinkIndex]);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowPopup(false);

    const extraSpins = 7 + Math.random() * 5;
    const randomOffset = Math.random() * (Math.PI * 2);
    
    startRotationRef.current = currentRotationRef.current;
    targetRotationRef.current = currentRotationRef.current + (extraSpins * Math.PI * 2) + randomOffset;
    spinStartTimeRef.current = 0;
    
    animFrameRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => {
    drawWheel(currentRotationRef.current);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawWheel]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* The Wheel */}
        <div className="relative p-4 bg-white/5 rounded-full border border-white/10 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto rounded-full"
            style={{ width: 'min(90vw, 500px)', height: 'min(90vw, 500px)' }}
          />
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 w-full max-w-sm text-center">
          <h1 className="text-3xl font-black text-yellow-500 mb-2 italic">DRINK ROULETTE</h1>
          <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs">Let fate pour your glass</p>
          
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`w-full py-5 rounded-2xl text-xl font-black uppercase transition-all transform active:scale-95 ${
              isSpinning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:bg-yellow-400'
            }`}
          >
            {isSpinning ? 'Mixing...' : 'Spin the Wheel'}
          </button>
        </div>
      </div>

      {/* Pop-up Winner */}
      {showPopup && winningDrink && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowPopup(false)}>
          <div className="bg-slate-900 border-2 border-yellow-500 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(234,179,8,0.3)] max-w-xs w-full animate-in zoom-in duration-300">
            <div className="text-7xl mb-4 drop-shadow-lg">{getDrinkIcon(winningDrink.name)}</div>
            <h2 className="text-yellow-500 font-black text-sm tracking-widest mb-1">YOUR DESTINY</h2>
            <p className="text-white text-3xl font-bold leading-tight mb-4">{winningDrink.name}</p>
            <div className="h-px bg-white/10 w-full mb-4" />
            <div className="flex justify-between items-center text-white/70 font-mono">
              <span>{winningDrink.price}€</span>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded">{winningDrink.mood}</span>
            </div>
            <p className="mt-8 text-yellow-500 text-xs font-bold animate-pulse">SHOW TO BARTENDER 🥂</p>
          </div>
        </div>
      )}
    </div>
  );
}