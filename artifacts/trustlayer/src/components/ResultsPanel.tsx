import React from "react";
import { AnalyzeResponse } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Scale, BookOpen, Brain, Drama } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function ScoreColor(score: number) {
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-blue-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 30) return "text-orange-400";
  return "text-red-500";
}

function ScoreBg(score: number) {
  if (score >= 90) return "bg-emerald-400/10 border-emerald-400/20";
  if (score >= 70) return "bg-blue-400/10 border-blue-400/20";
  if (score >= 50) return "bg-yellow-400/10 border-yellow-400/20";
  if (score >= 30) return "bg-orange-400/10 border-orange-400/20";
  return "bg-red-500/10 border-red-500/20";
}

function ScoreBorderLeft(score: number) {
  if (score >= 90) return "border-l-emerald-400";
  if (score >= 70) return "border-l-blue-400";
  if (score >= 50) return "border-l-yellow-400";
  if (score >= 30) return "border-l-orange-400";
  return "border-l-red-500";
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

export default function ResultsPanel({ results, onReset }: { results: AnalyzeResponse, onReset: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Analyze New Text
        </button>
        <button 
          onClick={() => {
            const win = window.open('', '_blank');
            if (!win) return;
            const scoreColor = results.overallTrustScore >= 90 ? '#10b981' : results.overallTrustScore >= 70 ? '#4f8ef7' : results.overallTrustScore >= 50 ? '#f59e0b' : results.overallTrustScore >= 30 ? '#f97316' : '#ef4444';
            win.document.write(`<!DOCTYPE html><html><head><title>TrustLayer Report</title><meta charset="utf-8"><style>
              body { font-family: 'Inter', sans-serif; background: #0f0f13; color: #f1f5f9; margin: 0; padding: 40px; }
              h1 { font-size: 2rem; background: linear-gradient(135deg,#4f8ef7,#8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .score-ring { font-size: 5rem; font-weight: bold; color: ${scoreColor}; }
              .label { display: inline-block; padding: 6px 20px; border-radius: 999px; border: 1px solid ${scoreColor}; color: ${scoreColor}; font-size: 0.9rem; }
              .module { margin: 12px 0; } .bar-bg { background: #2d2d3d; border-radius: 4px; height: 8px; } .bar-fill { height: 8px; border-radius: 4px; }
              .sentence { padding: 6px 12px; border-left: 4px solid; margin: 6px 0; border-radius: 0 4px 4px 0; }
              .flag { display: inline-block; padding: 4px 12px; margin: 4px; border-radius: 999px; background: rgba(239,68,68,0.15); color: #ef4444; font-size: 0.8rem; }
              .rec { padding: 6px 0; border-bottom: 1px solid #2d2d3d; color: #94a3b8; }
              .section { background: #16161f; border: 1px solid #2d2d3d; border-radius: 12px; padding: 24px; margin: 20px 0; }
              .muted { color: #94a3b8; font-size: 0.85rem; }
            </style></head><body>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <h1>TrustLayer Analysis Report</h1>
            </div>
            <p class="muted">Generated: ${new Date().toLocaleString()}</p>
            <div class="section" style="text-align:center">
              <p class="muted">OVERALL TRUST SCORE</p>
              <div class="score-ring">${results.overallTrustScore}</div>
              <div><span class="label">${results.label}</span></div>
            </div>
            <div class="section">
              <h2>Module Analysis</h2>
              ${[
                ['Factual Accuracy', results.modules.factAccuracy],
                ['Bias Level', results.modules.biasLevel],
                ['Manipulation Risk', results.modules.manipulationRisk],
                ['Source Diversity', results.modules.sourceDiversity],
                ['Logic Soundness', results.modules.logicSoundness],
              ].map(([name, mod]: [string, {score:number,details:string}]) => {
                const c = mod.score >= 70 ? '#10b981' : mod.score >= 40 ? '#f59e0b' : '#ef4444';
                return `<div class="module"><div style="display:flex;justify-content:space-between"><span>${name}</span><span style="color:${c}">${mod.score}/100</span></div><div class="bar-bg"><div class="bar-fill" style="width:${mod.score}%;background:${c}"></div></div><p class="muted">${mod.details}</p></div>`;
              }).join('')}
            </div>
            <div class="section">
              <h2>Sentence Analysis</h2>
              ${results.sentences.map(s => {
                const c = s.score >= 90 ? '#10b981' : s.score >= 70 ? '#4f8ef7' : s.score >= 50 ? '#f59e0b' : s.score >= 30 ? '#f97316' : '#ef4444';
                return `<div class="sentence" style="border-color:${c};background:${c}18">${s.text} <span style="color:${c};font-size:0.8rem">[${s.score}]</span></div>`;
              }).join('')}
            </div>
            <div class="section">
              <h2 style="color:#ef4444">Issues Found</h2>
              ${results.flagsFound.map(f => `<span class="flag">${f}</span>`).join('') || '<p class="muted">No significant issues detected.</p>'}
            </div>
            <div class="section">
              <h2 style="color:#10b981">Recommendations</h2>
              ${results.recommendations.map(r => `<div class="rec">→ ${r}</div>`).join('')}
            </div>
            <p class="muted" style="text-align:center;margin-top:40px">Powered by TrustLayer — Every AI needs a conscience.</p>
            </body></html>`);
            win.document.close();
          }}
          className="px-4 py-2 bg-card border border-border rounded text-sm font-mono hover:bg-muted transition-colors"
        >
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold font-mono tracking-tight mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Analysis Results
            </h2>
            
            <div className="space-y-3 leading-relaxed font-serif text-lg">
              {results.sentences.map((s, i) => (
                <Tooltip key={i} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <span 
                      className={`inline-block pl-3 border-l-4 ${ScoreBorderLeft(s.score)} mr-2 mb-2 cursor-help hover:bg-foreground/5 transition-colors`}
                    >
                      {s.text}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm font-sans p-4 border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`font-bold ${ScoreColor(s.score)}`}>
                        Score: {s.score}
                      </div>
                    </div>
                    {s.flags.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Flags:</span>
                        <ul className="list-disc pl-4 text-xs mt-1 text-red-400">
                          {s.flags.map((f, j) => <li key={j}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {s.tooltip}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
              <h3 className="text-sm font-bold font-mono tracking-tight text-red-400 uppercase mb-4">Issues Found</h3>
              <ul className="space-y-3">
                {results.flagsFound.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {f}
                  </li>
                ))}
                {results.flagsFound.length === 0 && (
                  <li className="text-sm text-muted-foreground">No significant issues detected.</li>
                )}
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-xl">
              <h3 className="text-sm font-bold font-mono tracking-tight text-emerald-400 uppercase mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {results.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Score Dashboard */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-xl flex flex-col items-center relative overflow-hidden">
            <div className="absolute -inset-20 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <h3 className="text-sm font-bold font-mono tracking-widest text-muted-foreground uppercase mb-8">Overall Trust Score</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96" cy="96" r="88"
                  fill="none" stroke="currentColor" strokeWidth="8"
                  className="text-border"
                />
                <motion.circle
                  initial={{ strokeDasharray: "0 1000" }}
                  animate={{ strokeDasharray: `${(results.overallTrustScore / 100) * 553} 1000` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="96" cy="96" r="88"
                  fill="none" stroke="currentColor" strokeWidth="8"
                  strokeLinecap="round"
                  className={ScoreColor(results.overallTrustScore)}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-6xl font-bold font-mono tracking-tighter">
                  <AnimatedCounter value={results.overallTrustScore} />
                </span>
              </div>
            </div>
            
            <div className={`px-4 py-2 rounded-full font-mono text-sm border font-bold ${ScoreBg(results.overallTrustScore)} ${ScoreColor(results.overallTrustScore)}`}>
              {results.label}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-xl space-y-6">
            <h3 className="text-sm font-bold font-mono tracking-widest text-muted-foreground uppercase">Module Analysis</h3>
            
            <ModuleBar 
              label="Factual Accuracy" 
              icon={<Search className="w-4 h-4" />}
              score={results.modules.factAccuracy.score} 
            />
            <ModuleBar 
              label="Bias Level" 
              icon={<Scale className="w-4 h-4" />}
              score={results.modules.biasLevel.score} 
            />
            <ModuleBar 
              label="Manipulation Risk" 
              icon={<Drama className="w-4 h-4" />}
              score={results.modules.manipulationRisk.score} 
            />
            <ModuleBar 
              label="Source Diversity" 
              icon={<BookOpen className="w-4 h-4" />}
              score={results.modules.sourceDiversity.score} 
            />
            <ModuleBar 
              label="Logic Soundness" 
              icon={<Brain className="w-4 h-4" />}
              score={results.modules.logicSoundness.score} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleBar({ label, icon, score }: { label: string, icon: React.ReactNode, score: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2 font-mono text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon} {label}
        </div>
        <div className={ScoreColor(score)}>{score}</div>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className={`h-full ${score >= 70 ? 'bg-emerald-400' : score >= 40 ? 'bg-yellow-400' : 'bg-red-500'}`}
        />
      </div>
    </div>
  );
}
