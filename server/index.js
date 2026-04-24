import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { answerQuestion, generateInsights } from "../lib/analysisService.js";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/gpt", async (req, res) => {
  try {
    const { analysis } = req.body || {};

    if (!analysis) {
      return res.status(400).json({ error: "analysis payload is required." });
    }

    const insights = await generateInsights(analysis, process.env);
    return res.json({ insights });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "서버에서 예기치 않은 오류가 발생했습니다.",
    });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question, analysis } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: "question is required." });
    }

    if (!analysis) {
      return res.status(400).json({ error: "analysis is required." });
    }

    const answer = await answerQuestion(question, analysis, process.env);
    return res.json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "질문 처리 중 오류가 발생했습니다.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
