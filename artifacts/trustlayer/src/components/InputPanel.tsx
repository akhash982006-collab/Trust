import React, { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLES = {
  "Medical Example": "Vaccines have been scientifically proven to cause autism in children according to multiple independent studies. Parents must stop vaccinating their children immediately. Scientists who support vaccines are secretly funded by Big Pharma corporations who profit from keeping your children sick.",
  "Political Example": "The opposition party has single-handedly destroyed our nation's economy through deliberate sabotage. Every true patriot knows that only our movement represents real values. Anyone who disagrees is either a traitor or too ignorant to understand what is really happening to our country.",
  "Marketing Example": "This revolutionary supplement cures diabetes, cancer, and heart disease naturally using ancient secrets doctors refuse to share. Big pharma has suppressed this for decades. Only 3 bottles left at this price — offer expires in 2 hours. Order now before it disappears forever."
};

export default function InputPanel({ onAnalyze }: { onAnalyze: (text: string) => void }) {
  const [text, setText] = useState("");
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col min-h-[100dvh] justify-center items-center">
      <div className="flex flex-col items-center mb-12 w-full">
        <div className="h-16 w-16 rounded-2xl bg-card border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(79,142,247,0.15)] mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          TrustLayer
        </h1>
        <p className="text-muted-foreground text-lg tracking-wide">
          Every AI needs a conscience. We built it.
        </p>
      </div>

      <div className="w-full relative group mb-8">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-lg blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
        <div className="relative bg-card rounded-lg border border-border overflow-hidden focus-within:border-primary/50 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 3000))}
            placeholder="Paste any AI-generated text here to analyze its trustworthiness..."
            className="w-full h-64 bg-transparent p-6 text-base md:text-lg resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/50 font-mono"
            spellCheck={false}
          />
          <div className="absolute bottom-4 right-4 text-xs font-mono text-muted-foreground">
            {text.length} / 3000
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {Object.entries(EXAMPLES).map(([label, content]) => (
          <button
            key={label}
            onClick={() => setText(content)}
            className="px-4 py-2 rounded-full text-sm font-mono border border-border bg-card hover:bg-muted hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
          >
            {label}
          </button>
        ))}
      </div>

      <Button 
        onClick={() => text.trim() && onAnalyze(text)}
        disabled={!text.trim()}
        className="w-full max-w-md h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-[0_0_40px_rgba(139,92,246,0.3)] disabled:opacity-50 border-0 rounded-lg"
      >
        Analyze Trust
      </Button>

      <div className="mt-12 text-xs font-mono text-muted-foreground/60 flex items-center gap-2">
        <Shield className="w-3 h-3" />
        No data stored. Powered by Replit AI.
      </div>
    </div>
  );
}
