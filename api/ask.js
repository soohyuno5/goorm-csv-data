import { answerQuestion } from "../lib/analysisService.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { question, analysis } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: "question is required." });
    }

    if (!analysis) {
      return res.status(400).json({ error: "analysis is required." });
    }

    const answer = await answerQuestion(question, analysis, process.env);
    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "질문 처리 중 오류가 발생했습니다.",
    });
  }
}
