import { generateInsights } from "../lib/analysisService.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { analysis } = req.body || {};

    if (!analysis) {
      return res.status(400).json({ error: "analysis payload is required." });
    }

    const insights = await generateInsights(analysis, process.env);
    return res.status(200).json({ insights });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "서버에서 예기치 않은 오류가 발생했습니다.",
    });
  }
}
