import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";

const STEPS = [
  "Extracting claims...",
  "Checking factual accuracy...",
  "Detecting bias patterns...",
  "Auditing for manipulation...",
  "Analyzing logical structure...",
  "Computing TrustScore..."
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center max-w-md w-full p-8">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
        <Shield className="w-16 h-16 text-primary relative z-10" />
      </motion.div>

      <div className="w-full space-y-4 relative z-10">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: isPending ? 0.3 : 1, 
                x: 0,
                color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground))"
              }}
              className="flex items-center gap-4 font-mono text-sm"
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary"
                  >
                    <Check className="w-3 h-3" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>
              <span className={`tracking-wider ${isPending ? 'text-muted-foreground' : ''}`}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
