import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAnalyzeText, AnalyzeResponse } from "@workspace/api-client-react";
import InputPanel from "./components/InputPanel";
import LoadingState from "./components/LoadingState";
import ResultsPanel from "./components/ResultsPanel";
import { AnimatePresence, motion } from "framer-motion";

const queryClient = new QueryClient();

function TrustLayerApp() {
  const [appState, setAppState] = useState<"INPUT" | "LOADING" | "RESULTS">("INPUT");
  const [results, setResults] = useState<AnalyzeResponse | null>(null);

  const analyzeMutation = useAnalyzeText();

  const handleAnalyze = async (text: string) => {
    setAppState("LOADING");
    const startTime = Date.now();
    try {
      const data = await analyzeMutation.mutateAsync({ data: { text } });
      setResults(data);
      // Ensure minimum loading animation time of 6 seconds for UX
      const elapsed = Date.now() - startTime;
      const minDuration = 6000;
      const remaining = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setAppState("RESULTS");
      }, remaining);
    } catch (err) {
      setAppState("INPUT");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground selection:bg-primary/30">
      <AnimatePresence mode="wait">
        {appState === "INPUT" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full min-h-[100dvh]"
          >
            <InputPanel onAnalyze={handleAnalyze} />
          </motion.div>
        )}

        {appState === "LOADING" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          >
            <LoadingState />
          </motion.div>
        )}

        {appState === "RESULTS" && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full min-h-[100dvh]"
          >
            <ResultsPanel results={results} onReset={() => setAppState("INPUT")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TrustLayerApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
