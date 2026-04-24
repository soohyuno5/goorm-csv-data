export function extractOutputText(data) {
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

export async function callOpenAI(prompt, model, apiKey) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

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
    throw new Error(data?.error?.message || "OpenAI API 요청에 실패했습니다.");
  }

  return extractOutputText(data);
}

export function parseJsonSafely(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("GPT 응답을 JSON으로 해석하지 못했습니다.");
  }
}

export function buildInsightsPrompt(analysis) {
  return `
당신은 CSV 데이터를 분석하는 한국어 데이터 분석가입니다.
아래 분석 JSON을 바탕으로 반드시 JSON만 반환하세요.

반환 형식:
{
  "overview": "한 문장 요약",
  "highlights": ["핵심 인사이트 1", "핵심 인사이트 2", "핵심 인사이트 3"],
  "cautions": ["주의 포인트 1", "주의 포인트 2"],
  "suggestedQuestions": ["후속 질문 1", "후속 질문 2", "후속 질문 3"],
  "recommendedChart": {
    "type": "bar|line|doughnut|pie",
    "targetColumn": "컬럼명 또는 빈 문자열",
    "metric": "avg|range|count|trend",
    "reason": "이 차트를 추천하는 이유"
  }
}

추천 규칙:
- 날짜형 요약이 있으면 line을 우선 고려
- 범주형 상위 빈도가 뚜렷하면 doughnut 또는 pie
- 수치형 비교면 bar
- targetColumn은 가능한 경우만 채우고, 없으면 빈 문자열

분석 JSON:
${JSON.stringify(analysis, null, 2)}
`;
}

export function buildQuestionPrompt(question, analysis) {
  return `
당신은 CSV 데이터를 설명하는 한국어 데이터 분석가입니다.
사용자의 질문에 4문장 이내로, 읽기 쉽게 답하세요.
모르는 내용은 추측하지 말고 현재 제공된 분석 정보 기준으로만 답하세요.

사용자 질문:
${question}

분석 JSON:
${JSON.stringify(analysis, null, 2)}
`;
}

export async function generateInsights(analysis, env = process.env) {
  const model = env.OPENAI_MODEL || "gpt-4.1-mini";
  const apiKey = env.OPENAI_API_KEY;
  const prompt = buildInsightsPrompt(analysis);
  const rawText = await callOpenAI(prompt, model, apiKey);
  return parseJsonSafely(rawText);
}

export async function answerQuestion(question, analysis, env = process.env) {
  const model = env.OPENAI_MODEL || "gpt-4.1-mini";
  const apiKey = env.OPENAI_API_KEY;
  const prompt = buildQuestionPrompt(question, analysis);
  return callOpenAI(prompt, model, apiKey);
}
