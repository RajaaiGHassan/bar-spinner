'use client';

import { DRINKS } from '../drinks';
import { useRef, useState, useEffect, useCallback } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [winningDrink, setWinningDrink] = useState<any>(null);

  const currentRotationRef = useRef(0);
  const spinStartTimeRef = useRef(0);
  const startRotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const size = 600;
  const radius = size * 0.45;
  const segmentCount = DRINKS.length;
  const angleStep = (Math.PI * 2) / segmentCount;

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
      const start = i * angleStep + rotation;
      const end = start + angleStep;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#0c0c0c' : '#141414'; 
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      const midAngle = start + angleStep / 2;
      ctx.rotate(midAngle);
      ctx.fillStyle = '#fff';
      ctx.font = "12px 'Aboreto', cursive";
      ctx.textAlign = "right";
      ctx.fillText(DRINKS[i].name.toUpperCase(), radius - 40, 5);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0c0c0c';
    ctx.fill();
    ctx.strokeStyle = 'gold';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [segmentCount, angleStep, radius]);

  const animateSpin = useCallback((now: number) => {
    if (!spinStartTimeRef.current) spinStartTimeRef.current = now;
    const elapsed = now - spinStartTimeRef.current;
    const t = Math.min(1, elapsed / 4500); 
    const ease = 1 - Math.pow(1 - t, 4); 
    const currentPos = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * ease;
    
    currentRotationRef.current = currentPos;
    drawWheel(currentPos);

    if (t < 1) {
      animFrameRef.current = requestAnimationFrame(animateSpin);
    } else {
      setIsSpinning(false);
      const pointerAngle = -Math.PI / 2;
      let rawAngle = pointerAngle - (currentPos % (Math.PI * 2));
      let norm = (rawAngle % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
      const idx = Math.floor(norm / angleStep) % segmentCount;
      setWinningDrink(DRINKS[idx]);
      setShowPopup(true);
    }
  }, [drawWheel, angleStep, segmentCount]);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowPopup(false);
    startRotationRef.current = currentRotationRef.current;
    targetRotationRef.current = currentRotationRef.current + (12 * Math.PI * 2) + Math.random() * (Math.PI * 2);
    spinStartTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => { drawWheel(0); }, [drawWheel]);

  return (
    <div className="h-dvh w-full bg-[#0c0c0c] flex flex-col items-center justify-between py-10 px-6 font-['Aboreto'] text-white overflow-hidden touch-none">
      
      {/* Header Section */}
      <div className="text-center animate-in fade-in slide-in-from-top duration-1000 shrink-0">
        <h1 className="text-2xl sm:text-3xl tracking-[0.4em] font-bold mb-2 bg-gradient-to-r from-white via-amber-200 to-white bg-[length:200%_100%] animate-[shine_8s_linear_infinite] bg-clip-text text-transparent">
          SWAY SOUL
        </h1>
        <div className="w-10 h-[1px] bg-amber-500/40 mx-auto mt-3"></div>
      </div>

      {/* Responsive Wheel Container */}
      <div className="relative flex items-center justify-center w-full max-w-[min(85vw,450px)] aspect-square shrink">
        <div className="absolute inset-0 rounded-full bg-white/[0.02] backdrop-blur-3xl border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.9)]"></div>
        <canvas 
          ref={canvasRef} 
          className="relative z-10 w-full h-full drop-shadow-2xl"
        />
        {/* Golden Pointer */}
        <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
        </div>
      </div>

      {/* Styled Button Section */}
      <div className="w-full flex justify-center shrink-0 mb-4">
        <button 
          onClick={spinWheel} 
          disabled={isSpinning}
          className="group relative w-full max-w-[300px] py-4 overflow-hidden rounded-full border border-amber-500/30 bg-amber-500/5 transition-all hover:bg-amber-500 hover:text-black active:scale-95 disabled:opacity-30 shadow-lg"
        >
          <span className="relative z-10 tracking-[0.4em] uppercase text-[11px] font-bold">
            {isSpinning ? 'Consulting Soul...' : 'Spin the Destiny'}
          </span>
        </button>
      </div>

      {/* Winner Popup */}
      {showPopup && winningDrink && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md p-6 z-50 animate-in fade-in duration-500"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="ss-panel bg-[rgba(255,159,67,0.08)] backdrop-blur-[30px] border border-white/10 p-10 rounded-[32px] text-center max-w-[340px] w-full shadow-[0_25px_70px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-amber-500 text-[9px] tracking-[0.6em] uppercase mb-6 font-bold">Selection Made</p>
            <h2 className="text-3xl tracking-widest mb-8 leading-tight italic uppercase">
              {winningDrink.name}
            </h2>
            
            <div className="flex justify-between items-center border-y border-white/10 py-4 mb-8">
              <span className="text-amber-200 text-sm font-bold">{winningDrink.price}€</span>
              <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase">{winningDrink.mood}</span>
            </div>

            <p className="text-[10px] text-white/60 mb-10 tracking-[0.15em] leading-relaxed px-2">
              PRESENT THIS TO YOUR BARTENDER TO REDEEM YOUR SELECTION.
            </p>

            <button 
              className="text-[10px] tracking-[0.5em] uppercase border-b border-amber-500/30 pb-1 text-amber-500/80 hover:text-white transition-all"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}