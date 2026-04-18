import { Router, type IRouter } from "express";
import { analyzeText } from "../lib/trustAnalysis";
import { AnalyzeTextBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text } = parsed.data;

  if (text.length < 20) {
    res.status(400).json({ error: "Please enter at least 20 characters" });
    return;
  }

  if (text.length > 3000) {
    res.status(400).json({ error: "Text must be 3000 characters or fewer" });
    return;
  }

  try {
    req.log.info({ textLength: text.length }, "Starting text analysis");
    const result = await analyzeText(text);
    req.log.info({ overallScore: result.overallTrustScore }, "Analysis complete");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
