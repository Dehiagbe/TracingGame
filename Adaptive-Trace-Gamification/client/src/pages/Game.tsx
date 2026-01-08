import { useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { AnimatePresence, motion } from "framer-motion";

export default function Game() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);

  const handleShapeComplete = () => {
    // Small delay handled by canvas, this just swaps the state
    setCurrentShapeIndex((prev) => prev + 1);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative">
      <GameCanvas 
        key={currentShapeIndex} // Force remount on shape change
        currentShapeIndex={currentShapeIndex} 
        onComplete={handleShapeComplete} 
      />

      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <WelcomeOverlay onStart={() => setIsPlaying(true)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
