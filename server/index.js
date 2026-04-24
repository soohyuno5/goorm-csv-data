import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const outputItems = Array.isArray(data?.output) ? data.output : [];
  const textParts = outputItems.flatMap((item) => {
    const contentItems = Array.isArray(item?.content) ? item.content : [];
    return contentItems
      .map((content) => {
        if (typeof content?.text === "string") {
          return content.text;
        }
        if (typeof content?.output_text === "string") {
          return content.output_text;
        }
        return "";
      })
      .filter(Boolean);
  });

  return textParts.join("\n").trim();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/gpt", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const { analysis } = req.body || {};

    if (!analysis) {
      return res.status(400).json({ error: "analysis payload is required." });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다.",
      });
    }

    const prompt = `
당신은 CSV 데이터를 빠르게 요약하는 데이터 분석가입니다.
아래 JSON을 바탕으로 한국어로 5줄 이내로 답하세요.
- 전체 데이터 개요
- 눈에 띄는 패턴
- 수치형 평균/범위에서 보이는 특징
- 범주형 상위 패턴
- 추가로 확인해볼 포인트 1개

CSV 분석 JSON:
${JSON.stringify(analysis, null, 2)}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "OpenAI API 요청에 실패했습니다.";
      return res.status(response.status).json({ error: message });
    }

    const result = extractOutputText(data);

    if (!result) {
      return res.status(502).json({
        error: "OpenAI 응답은 받았지만 텍스트 결과를 추출하지 못했습니다.",
      });
    }

    return res.json({ result });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "서버에서 예기치 않은 오류가 발생했습니다.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
