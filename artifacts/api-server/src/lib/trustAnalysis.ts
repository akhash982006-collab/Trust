import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "./logger";

const MODEL = "gpt-5.2";
const MAX_TOKENS = 1000;

interface Message {
  role: "user" | "system";
  content: string;
}

async function askAIJSON<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an AI analysis expert. Always respond with valid JSON only, no markdown fences, no explanation.",
      },
      { role: "user", content: prompt },
    ];

    const response = await openai.chat.completions.create({
      model: MODEL,
      max_completion_tokens: MAX_TOKENS,
      messages,
    });

    let text = response.choices[0]?.message?.content ?? "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      return JSON.parse(text) as T;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]) as T;
      }
      const arrMatch = text.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        return JSON.parse(arrMatch[0]) as T;
      }
      logger.warn({ text }, "Could not parse AI response as JSON, using fallback");
      return fallback;
    }
  } catch (err) {
    logger.error({ err }, "AI call failed");
    return fallback;
  }
}

interface ClaimResult {
  sentence: string;
  type: "factual" | "opinion" | "subjective";
}

export async function extractClaims(text: string): Promise<ClaimResult[]> {
  const prompt = `Split this text into individual sentences. For each sentence identify its type.
Return ONLY a raw JSON array, no markdown:
[{"sentence": string, "type": "factual" | "opinion" | "subjective"}]

Text: ${text}`;

  const fallback: ClaimResult[] = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 5)
    .map((s) => ({ sentence: s.trim(), type: "factual" as const }));

  const result = await askAIJSON<ClaimResult[]>(prompt, fallback);
  return Array.isArray(result) ? result : fallback;
}

interface FactCheckResult {
  overallScore: number;
  details: string;
  flaggedClaims: Array<{ claim: string; score: number; reason: string }>;
}

export async function checkFactAccuracy(claims: ClaimResult[]): Promise<FactCheckResult> {
  const claimsText = claims.map((c) => c.sentence).join("\n- ");
  const prompt = `You are a fact-checking expert. Analyze these claims for factual accuracy based on your training knowledge. For each claim rate its accuracy 0-100. Consider: Is this scientifically proven? Is this a known misinformation pattern? Is this a well-established fact?

Return ONLY raw JSON, no markdown:
{"overallScore": number (0-100), "details": string (one sentence summary), "flaggedClaims": [{"claim": string, "score": number, "reason": string}]}

Claims to check:
- ${claimsText}`;

  return askAIJSON<FactCheckResult>(prompt, {
    overallScore: 50,
    details: "Unable to assess factual accuracy",
    flaggedClaims: [],
  });
}

interface BiasResult {
  score: number;
  biasTypes: string[];
  flaggedPhrases: string[];
  details: string;
}

export async function detectBias(text: string): Promise<BiasResult> {
  const prompt = `You are a bias detection expert. Analyze this text for ALL types of bias:
- Political bias (left/right leaning)
- Gender bias (stereotypes)
- Cultural bias (ethnocentrism)
- Loaded language (emotionally charged words)
- Confirmation bias (cherry-picking)

Score 0-100 where 100 = completely unbiased.

Return ONLY raw JSON, no markdown:
{"score": number, "biasTypes": string[], "flaggedPhrases": string[], "details": string}

Text: ${text}`;

  return askAIJSON<BiasResult>(prompt, {
    score: 50,
    biasTypes: [],
    flaggedPhrases: [],
    details: "Unable to assess bias",
  });
}

interface ManipulationResult {
  score: number;
  tacticsDetected: string[];
  flaggedPhrases: string[];
  details: string;
}

export async function detectManipulation(text: string): Promise<ManipulationResult> {
  const prompt = `You are a manipulation detection expert. Analyze this text for manipulation tactics:
- False urgency (act now, limited time)
- Fear mongering (exaggerated threats)
- False authority (experts say, studies show)
- Emotional exploitation (guilt, shame, fear)
- Absolute language (always, never, everyone)
- False scarcity (only X left)
- Conspiracy framing (they don't want you to know)

Score 0-100 where 100 = not manipulative at all.

Return ONLY raw JSON, no markdown:
{"score": number, "tacticsDetected": string[], "flaggedPhrases": string[], "details": string}

Text: ${text}`;

  return askAIJSON<ManipulationResult>(prompt, {
    score: 50,
    tacticsDetected: [],
    flaggedPhrases: [],
    details: "Unable to assess manipulation risk",
  });
}

interface FallacyResult {
  score: number;
  fallaciesFound: Array<{ name: string; quotedText: string; explanation: string }>;
  details: string;
}

export async function detectFallacies(text: string): Promise<FallacyResult> {
  const prompt = `You are a logic expert. Detect logical fallacies in this text. Check for: Ad Hominem, Straw Man, False Dichotomy, Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring, Appeal to Emotion, False Cause, Anecdotal Evidence, Bandwagon.

Score 0-100 where 100 = perfectly logical.

Return ONLY raw JSON, no markdown:
{"score": number, "fallaciesFound": [{"name": string, "quotedText": string, "explanation": string}], "details": string}

Text: ${text}`;

  return askAIJSON<FallacyResult>(prompt, {
    score: 50,
    fallaciesFound: [],
    details: "Unable to assess logical soundness",
  });
}

interface SourceDiversityResult {
  score: number;
  citationsFound: number;
  diversityRating: "poor" | "fair" | "good" | "excellent";
  details: string;
  recommendations: string[];
}

export async function assessSourceDiversity(text: string): Promise<SourceDiversityResult> {
  const prompt = `You are a source quality expert. Analyze this text for citation and source quality:
- Are claims backed by any citations?
- Are diverse sources referenced?
- Is it based on consensus or fringe views?
- Does it rely on anecdotal evidence?
- Is there scientific backing?

Score 0-100 where 100 = excellent sourcing.

Return ONLY raw JSON, no markdown:
{"score": number, "citationsFound": number, "diversityRating": "poor" | "fair" | "good" | "excellent", "details": string, "recommendations": string[]}

Text: ${text}`;

  return askAIJSON<SourceDiversityResult>(prompt, {
    score: 50,
    citationsFound: 0,
    diversityRating: "poor",
    details: "Unable to assess source diversity",
    recommendations: [],
  });
}

interface SentenceScore {
  score: number;
  flags: string[];
  tooltip: string;
}

async function scoreSentence(sentence: string): Promise<SentenceScore> {
  const prompt = `Rate this sentence for trustworthiness 0-100. Consider: factual accuracy, bias, manipulation.
Return ONLY: {"score": number, "flags": string[], "tooltip": string}

Sentence: "${sentence}"`;

  return askAIJSON<SentenceScore>(prompt, {
    score: 50,
    flags: [],
    tooltip: "Unable to assess sentence",
  });
}

function aggregateScore(
  factScore: number,
  biasScore: number,
  manipScore: number,
  sourceScore: number,
  logicScore: number,
): number {
  return Math.round(
    factScore * 0.35 +
      biasScore * 0.2 +
      manipScore * 0.2 +
      sourceScore * 0.15 +
      logicScore * 0.1,
  );
}

function getLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Highly Trustworthy", color: "#10b981" };
  if (score >= 70) return { label: "Mostly Reliable", color: "#4f8ef7" };
  if (score >= 50) return { label: "Use Caution", color: "#f59e0b" };
  if (score >= 30) return { label: "Significant Concerns", color: "#f97316" };
  return { label: "High Risk Content", color: "#ef4444" };
}

export interface AnalysisResult {
  overallTrustScore: number;
  label: string;
  color: string;
  sentences: Array<{
    text: string;
    score: number;
    flags: string[];
    tooltip: string;
  }>;
  modules: {
    factAccuracy: { score: number; details: string };
    biasLevel: { score: number; details: string };
    manipulationRisk: { score: number; details: string };
    sourceDiversity: { score: number; details: string };
    logicSoundness: { score: number; details: string };
  };
  flagsFound: string[];
  recommendations: string[];
}

const analysisCache = new Map<string, { result: AnalysisResult; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function analyzeText(text: string): Promise<AnalysisResult> {
  const cacheKey = text.trim();
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info("Returning cached analysis result");
    return cached.result;
  }

  const [claims, biasResult, manipResult, fallacyResult, sourceResult] = await Promise.all([
    extractClaims(text),
    detectBias(text),
    detectManipulation(text),
    detectFallacies(text),
    assessSourceDiversity(text),
  ]);

  const factResult = await checkFactAccuracy(claims);

  const sentenceScores = await Promise.all(
    claims.map(async (claim) => {
      const score = await scoreSentence(claim.sentence);
      return {
        text: claim.sentence,
        score: score.score,
        flags: score.flags,
        tooltip: score.tooltip,
      };
    }),
  );

  const overallTrustScore = aggregateScore(
    factResult.overallScore,
    biasResult.score,
    manipResult.score,
    sourceResult.score,
    fallacyResult.score,
  );

  const { label, color } = getLabel(overallTrustScore);

  const flagsFound: string[] = [
    ...biasResult.biasTypes,
    ...manipResult.tacticsDetected,
    ...fallacyResult.fallaciesFound.map((f) => f.name),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const recommendations: string[] = [
    ...sourceResult.recommendations,
    ...(factResult.overallScore < 50
      ? ["Verify factual claims with reputable sources before sharing"]
      : []),
    ...(biasResult.score < 50 ? ["Seek out diverse perspectives on this topic"] : []),
    ...(manipResult.score < 50 ? ["Be aware of emotional manipulation tactics in this text"] : []),
    ...(fallacyResult.score < 50
      ? ["Analyze the logical structure of arguments presented"]
      : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const result: AnalysisResult = {
    overallTrustScore,
    label,
    color,
    sentences: sentenceScores,
    modules: {
      factAccuracy: { score: factResult.overallScore, details: factResult.details },
      biasLevel: { score: biasResult.score, details: biasResult.details },
      manipulationRisk: { score: manipResult.score, details: manipResult.details },
      sourceDiversity: { score: sourceResult.score, details: sourceResult.details },
      logicSoundness: { score: fallacyResult.score, details: fallacyResult.details },
    },
    flagsFound,
    recommendations,
  };

  analysisCache.set(cacheKey, { result, timestamp: Date.now() });

  return result;
}
