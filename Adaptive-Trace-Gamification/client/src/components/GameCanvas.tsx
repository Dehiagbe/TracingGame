import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Hand, RefreshCcw, Volume2, VolumeX } from "lucide-react";
import { useCreateAttempt } from "@/hooks/use-attempts";

// ==========================================
// VOICE ASSISTANT HELPER
// ==========================================
const speak = (text: string, enabled: boolean) => {
  if (!enabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

// ==========================================
// TYPES & CONSTANTS
// ==========================================
type Point = { x: number; y: number };
type ShapeType = 
  | "Horizontal Line" | "Vertical Line" | "Zig-Zag" | "Wave" 
  | "Circle" | "Square" | "Triangle" | "Rectangle" 
  | "Star" | "Diamond" | "Pentagon" | "Hexagon" 
  | "Heart" | "Crescent" | "Oval";

interface GameCanvasProps {
  onComplete: () => void;
  currentShapeIndex: number;
}

const SHAPES: ShapeType[] = [
  "Horizontal Line", "Vertical Line", "Zig-Zag", "Wave",
  "Circle", "Square", "Triangle", "Rectangle",
  "Star", "Diamond", "Pentagon", "Hexagon",
  "Heart", "Crescent", "Oval"
];

// Visual constants
const PATH_COLOR = "#4A4A4A";
const TRACED_COLOR = "#2ECC71";
const POINTER_COLOR = "#F59E0B"; // accent orange
const GHOST_COLOR = "rgba(59, 130, 246, 0.5)"; // blue semi-transparent
const INTRO_COLOR = "rgba(46, 204, 113, 0.4)"; // light green
const SAFE_ZONE_BUFFER = 40; // px radius tolerance
const IDLE_TIMEOUT_MS = 5000;

// ==========================================
// HELPER: GEOMETRY GENERATORS
// ==========================================
function generatePath(type: ShapeType, width: number, height: number): Point[] {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.85; // 85% of viewport
  const radius = size / 2;
  const points: Point[] = [];

  const interpolate = (start: Point, end: Point, steps: number) => {
    for(let k=0; k<=steps; k++) {
      points.push({
        x: start.x + (end.x - start.x) * (k/steps),
        y: start.y + (end.y - start.y) * (k/steps)
      });
    }
  };

  switch (type) {
    case "Horizontal Line":
      for (let i = 0; i <= 100; i++) {
        points.push({ x: (width - size) / 2 + (size * i) / 100, y: cy });
      }
      break;
    case "Vertical Line":
      for (let i = 0; i <= 100; i++) {
        points.push({ x: cx, y: (height - size) / 2 + (size * i) / 100 });
      }
      break;
    case "Zig-Zag":
      {
        const zigSteps = 4;
        const zigW = size;
        const zigH = size / 3;
        const startX = cx - zigW/2;
        for(let i=0; i<zigSteps; i++) {
          const x1 = startX + (i * zigW) / zigSteps;
          const y1 = cy + (i % 2 === 0 ? -zigH/2 : zigH/2);
          const x2 = startX + ((i+1) * zigW) / zigSteps;
          const y2 = cy + ((i+1) % 2 === 0 ? -zigH/2 : zigH/2);
          interpolate({x: x1, y: y1}, {x: x2, y: y2}, 25);
        }
      }
      break;
    case "Wave":
      for (let i = 0; i <= 200; i++) {
        const x = (width - size) / 2 + (size * i) / 200;
        const y = cy + Math.sin((i / 200) * Math.PI * 4) * (size / 6);
        points.push({ x, y });
      }
      break;
    case "Circle":
      for (let i = 0; i <= 360; i++) {
        const rad = (i * Math.PI) / 180;
        points.push({ x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) });
      }
      break;
    case "Square":
      interpolate({x: cx-radius, y: cy-radius}, {x: cx+radius, y: cy-radius}, 50);
      interpolate({x: cx+radius, y: cy-radius}, {x: cx+radius, y: cy+radius}, 50);
      interpolate({x: cx+radius, y: cy+radius}, {x: cx-radius, y: cy+radius}, 50);
      interpolate({x: cx-radius, y: cy+radius}, {x: cx-radius, y: cy-radius}, 50);
      break;
    case "Rectangle":
      {
        const rw = radius;
        const rh = radius / 1.5;
        interpolate({x: cx-rw, y: cy-rh}, {x: cx+rw, y: cy-rh}, 50);
        interpolate({x: cx+rw, y: cy-rh}, {x: cx+rw, y: cy+rh}, 50);
        interpolate({x: cx+rw, y: cy+rh}, {x: cx-rw, y: cy+rh}, 50);
        interpolate({x: cx-rw, y: cy+rh}, {x: cx-rw, y: cy-rh}, 50);
      }
      break;
    case "Triangle":
      {
        const p1 = { x: cx, y: cy - radius };
        const p2 = { x: cx + radius, y: cy + radius * 0.7 };
        const p3 = { x: cx - radius, y: cy + radius * 0.7 };
        interpolate(p1, p2, 60);
        interpolate(p2, p3, 60);
        interpolate(p3, p1, 60);
      }
      break;
    case "Star":
      for (let i = 0; i <= 10; i++) {
        const r = i % 2 === 0 ? radius : radius / 2.5;
        const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
        points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
        if (i < 10) {
          const nextR = (i+1) % 2 === 0 ? radius : radius / 2.5;
          const nextAngle = ((i+1) * Math.PI * 2) / 10 - Math.PI / 2;
          interpolate(
            {x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle)},
            {x: cx + nextR * Math.cos(nextAngle), y: cy + nextR * Math.sin(nextAngle)},
            20
          );
        }
      }
      break;
    case "Diamond":
      interpolate({x: cx, y: cy-radius}, {x: cx+radius/1.5, y: cy}, 50);
      interpolate({x: cx+radius/1.5, y: cy}, {x: cx, y: cy+radius}, 50);
      interpolate({x: cx, y: cy+radius}, {x: cx-radius/1.5, y: cy}, 50);
      interpolate({x: cx-radius/1.5, y: cy}, {x: cx, y: cy-radius}, 50);
      break;
    case "Pentagon":
      for (let i = 0; i <= 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const p = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
        if (i > 0) {
          const prevAngle = ((i-1) * Math.PI * 2) / 5 - Math.PI / 2;
          const prevP = { x: cx + radius * Math.cos(prevAngle), y: cy + radius * Math.sin(prevAngle) };
          points.pop(); // Remove duplicate vertex
          interpolate(prevP, p, 40);
        } else {
          points.push(p);
        }
      }
      break;
    case "Hexagon":
      for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const p = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
        if (i > 0) {
          const prevAngle = ((i-1) * Math.PI * 2) / 6;
          const prevP = { x: cx + radius * Math.cos(prevAngle), y: cy + radius * Math.sin(prevAngle) };
          points.pop();
          interpolate(prevP, p, 30);
        } else {
          points.push(p);
        }
      }
      break;
    case "Heart":
      for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * Math.PI * 2;
        const x = cx + 16 * Math.pow(Math.sin(t), 3) * (radius / 18);
        const y = cy - (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * (radius / 18);
        points.push({ x, y });
      }
      break;
    case "Crescent":
      for (let i = -90; i <= 90; i++) {
        const rad = (i * Math.PI) / 180;
        points.push({ x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) });
      }
      for (let i = 90; i >= -90; i--) {
        const rad = (i * Math.PI) / 180;
        points.push({ x: cx + (radius * 0.6) * Math.cos(rad) + radius*0.4, y: cy + radius * Math.sin(rad) });
      }
      break;
    case "Oval":
      for (let i = 0; i <= 360; i++) {
        const rad = (i * Math.PI) / 180;
        points.push({ x: cx + radius * Math.cos(rad), y: cy + (radius * 0.6) * Math.sin(rad) });
      }
      break;
    default:
      for (let i = 0; i <= 360; i++) {
        const rad = (i * Math.PI) / 180;
        points.push({ x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) });
      }
  }
  return points;
}

// ==========================================
// COMPONENT
// ==========================================
export function GameCanvas({ onComplete, currentShapeIndex }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [isGameActive, setIsGameActive] = useState(true);
  const [assistanceCount, setAssistanceCount] = useState(0);
  const [progress, setProgress] = useState(0); 
  const [ghostActive, setGhostActive] = useState(false);
  const [introActive, setIntroActive] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isTracing, setIsTracing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Refs for mutable game loop state
  const pathRef = useRef<Point[]>([]);
  const tracedIndicesRef = useRef<Set<number>>(new Set());
  const lastPointerRef = useRef<Point | null>(null);
  const animationFrameRef = useRef<number>();
  const ghostProgressRef = useRef(0);
  const introProgressRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  
  const { mutate: submitAttempt } = useCreateAttempt();
  const currentShape = SHAPES[currentShapeIndex % SHAPES.length];

  const initLevel = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const { clientWidth, clientHeight } = containerRef.current;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    canvas.style.width = `${clientWidth}px`;
    canvas.style.height = `${clientHeight}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    pathRef.current = generatePath(currentShape, clientWidth, clientHeight);
    tracedIndicesRef.current = new Set();
    setProgress(0);
    setAssistanceCount(0);
    setGhostActive(false);
    setIntroActive(true);
    introProgressRef.current = 0;
    ghostProgressRef.current = 0;
    setIsGameActive(true);
    setLastInteraction(Date.now());
    startTimeRef.current = Date.now();
    
    speak(`Let's trace a ${currentShape}`, voiceEnabled);
  }, [currentShape, voiceEnabled]);

  useEffect(() => {
    initLevel();
    window.addEventListener('resize', initLevel);
    return () => window.removeEventListener('resize', initLevel);
  }, [initLevel]);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasRef.current;
    const logicalWidth = width / (window.devicePixelRatio || 1);
    const logicalHeight = height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Draw Base Path
    ctx.beginPath();
    ctx.strokeStyle = PATH_COLOR;
    ctx.lineWidth = logicalWidth < 600 ? 30 : 50;
    ctx.setLineDash([15, 25]);
    if (pathRef.current.length > 0) {
      ctx.moveTo(pathRef.current[0].x, pathRef.current[0].y);
      for (let i = 1; i < pathRef.current.length; i++) {
        ctx.lineTo(pathRef.current[i].x, pathRef.current[i].y);
      }
    }
    ctx.stroke();

    // 2. Draw Traced Points (Solid Green)
    if (tracedIndicesRef.current.size > 0) {
      ctx.fillStyle = TRACED_COLOR;
      const pointSize = (logicalWidth < 600 ? 15 : 25) + 2; // Slightly larger to overlap
      tracedIndicesRef.current.forEach(idx => {
        const p = pathRef.current[idx];
        if (p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, pointSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 3. Draw Intro / Ghost Light
    if (introActive || ghostActive) {
      const p = introActive ? introProgressRef.current : ghostProgressRef.current;
      const idx = Math.floor(p * (pathRef.current.length - 1));
      const point = pathRef.current[idx];
      if (point) {
        ctx.beginPath();
        ctx.fillStyle = introActive ? INTRO_COLOR : GHOST_COLOR;
        ctx.arc(point.x, point.y, 35, 0, Math.PI * 2);
        ctx.fill();
        
        if (ghostActive) {
          ctx.beginPath();
          ctx.strokeStyle = GHOST_COLOR;
          ctx.lineWidth = 12;
          ctx.setLineDash([]);
          // Find the last point the user traced, or start of path
          const lastTracedIdx = Array.from(tracedIndicesRef.current).sort((a,b) => a-b).pop() || 0;
          const startPoint = pathRef.current[lastTracedIdx];
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      }
    }

    // 4. Draw User Pointer
    if (isTracing && lastPointerRef.current) {
      ctx.beginPath();
      ctx.fillStyle = POINTER_COLOR;
      ctx.arc(lastPointerRef.current.x, lastPointerRef.current.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [ghostActive, introActive, isTracing]);

  const checkCompletion = useCallback(() => {
    const totalPoints = pathRef.current.length;
    const tracedPoints = tracedIndicesRef.current.size;
    
    // Strict requirement: User must trace 98% of the shape
    if (tracedPoints >= totalPoints * 0.98 && isGameActive) {
      setIsGameActive(false);
      speak("Great job!", voiceEnabled);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: [TRACED_COLOR, POINTER_COLOR]
      });

      const durationMs = Date.now() - startTimeRef.current;
      submitAttempt({
        shape: currentShape,
        attentionScore: 100,
        precisionScore: 100,
        assistanceCount,
        durationMs,
      });

      setTimeout(onComplete, 2000);
    }
  }, [isGameActive, currentShape, assistanceCount, submitAttempt, onComplete]);

  useEffect(() => {
    const loop = () => {
      draw();
      
      if (introActive) {
        introProgressRef.current += 0.015;
        if (introProgressRef.current >= 1) {
          setIntroActive(false);
        }
      } else if (isGameActive && !isTracing && Date.now() - lastInteraction > IDLE_TIMEOUT_MS) {
        if (!ghostActive) {
          setGhostActive(true);
          setAssistanceCount(prev => prev + 1);
          speak("Watch me, then you try!", voiceEnabled);
        }
        ghostProgressRef.current += 0.008;
        if (ghostProgressRef.current >= 1) {
          ghostProgressRef.current = 0;
        }
      } else {
        if (ghostActive) setGhostActive(false);
      }
      
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current!);
  }, [draw, isGameActive, isTracing, lastInteraction, ghostActive, introActive]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isGameActive || introActive) return;
    setIsTracing(true);
    setLastInteraction(Date.now());
    setGhostActive(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsTracing(false);
    setLastInteraction(Date.now());
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isTracing || !isGameActive || !canvasRef.current) return;
    setLastInteraction(Date.now());

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPointerRef.current = { x, y };

    // Find all points within buffer and mark them traced
    pathRef.current.forEach((point, idx) => {
      if (tracedIndicesRef.current.has(idx)) return;
      const dx = x - point.x;
      const dy = y - point.y;
      if (Math.sqrt(dx*dx + dy*dy) <= SAFE_ZONE_BUFFER) {
        tracedIndicesRef.current.add(idx);
      }
    });

    setProgress(tracedIndicesRef.current.size / pathRef.current.length);
    checkCompletion();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full touch-none select-none bg-background">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block w-full h-full touch-none"
      />
      
      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 text-foreground font-display font-bold text-xl"
        >
          {currentShape}
        </motion.div>
        
        <div className="flex gap-2">
           <motion.div className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md text-primary">
              <span className="font-mono font-bold">{Math.round(progress * 100)}%</span>
           </motion.div>
           {assistanceCount > 0 && (
             <motion.div 
               initial={{ scale: 0 }} animate={{ scale: 1 }}
               className="bg-accent/10 p-2 rounded-full shadow-md text-accent-foreground flex items-center gap-1"
             >
               <Hand className="w-4 h-4" />
               <span className="font-bold text-sm">{assistanceCount}</span>
             </motion.div>
           )}
        </div>
      </div>

      <button 
        onClick={initLevel}
        className="absolute bottom-6 right-6 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
      >
        <RefreshCcw className="w-6 h-6" />
      </button>

      {/* Voice Toggle - Bottom Left */}
      <button 
        onClick={() => {
          const next = !voiceEnabled;
          setVoiceEnabled(next);
          speak(next ? "Voice on" : "Voice off", true);
        }}
        className="absolute bottom-6 left-6 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
      >
        {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {introActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="bg-green-100 text-green-700 px-6 py-3 rounded-full font-bold shadow-lg text-lg animate-pulse">
              Look at the shape...
            </span>
          </motion.div>
        )}
        {ghostActive && !introActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-12 left-0 right-0 text-center pointer-events-none"
          >
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold shadow-sm">
              Watch closely... then you try!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
