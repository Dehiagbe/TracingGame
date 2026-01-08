import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function WelcomeOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ✏️
        </div>
        
        <h1 className="text-3xl font-bold font-display text-foreground mb-4">
          Ready to Trace?
        </h1>
        
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          Follow the dashed lines. Stay inside the safe zone. Let's see how precise you can be!
        </p>
        
        <button
          onClick={onStart}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-current" />
          Start Game
        </button>
      </motion.div>
    </div>
  );
}
