import { useEffect, useMemo, useState } from "react";
import Upload from "./components/Upload";
import Result from "./components/Result";

const STORAGE_KEY = "csv-analyzer-state";

const initialState = {
  fileName: "",
  rowCount: 0,
  columnCount: 0,
  columns: [],
  previewRows: [],
  sampleRows: [],
  numericSummary: [],
  categoricalSummary: [],
  dateSummary: [],
};

const initialInsights = {
  overview: "",
  highlights: [],
  cautions: [],
  suggestedQuestions: [],
  recommendedChart: null,
};

function getStoredState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatStorageSize(bytes) {
  if (!bytes) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function App() {
  const storedState = getStoredState();

  const [analysis, setAnalysis] = useState(storedState?.analysis || initialState);
  const [insights, setInsights] = useState(storedState?.insights || initialInsights);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState(storedState?.questionAnswer || "");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextState = {
      analysis,
      insights,
      questionAnswer,
    };

    const hasData =
      analysis.fileName ||
      insights.overview ||
      insights.highlights.length ||
      insights.cautions.length ||
      questionAnswer;

    if (!hasData) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [analysis, insights, questionAnswer]);

  const storageUsage = useMemo(() => {
    if (typeof window === "undefined") {
      return "0 B";
    }

    const raw = window.localStorage.getItem(STORAGE_KEY) || "";
    return formatStorageSize(new Blob([raw]).size);
  }, [analysis, insights, questionAnswer]);

  const clearStoredData = () => {
    setAnalysis(initialState);
    setInsights(initialInsights);
    setError("");
    setQuestionError("");
    setQuestionAnswer("");
    setLoading(false);
    setQuestionLoading(false);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar simple-topbar">
        <div className="topbar-banner">CSV 업로드 후 요약, 차트, 질문 기능을 사용할 수 있습니다.</div>
        <div className="topbar-user">담당 분석: GPT</div>
      </header>

      <div className="content-shell standalone-shell">
        <section className="hero">
          <p className="eyebrow">CSV Analyzer</p>
          <h1>csv 데이터 분석</h1>
          <p className="hero-copy">
            업로드한 데이터를 정리해서 한눈에 볼 수 있게 구성합니다.
          </p>

          <div className="storage-bar">
            <div className="storage-item">
              <span>현재 데이터</span>
              <strong>{analysis.fileName || "없음"}</strong>
            </div>
            <div className="storage-item">
              <span>로컬 저장 용량</span>
              <strong>{storageUsage}</strong>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={clearStoredData}
              disabled={!analysis.fileName && !questionAnswer && !insights.overview}
            >
              로컬 스토리지 비우기
            </button>
          </div>
        </section>

        <Upload
          setAnalysis={setAnalysis}
          setInsights={setInsights}
          setLoading={setLoading}
          setError={setError}
          setQuestionAnswer={setQuestionAnswer}
          setQuestionError={setQuestionError}
        />

        <Result
          analysis={analysis}
          insights={insights}
          loading={loading}
          error={error}
          questionLoading={questionLoading}
          setQuestionLoading={setQuestionLoading}
          questionError={questionError}
          setQuestionError={setQuestionError}
          questionAnswer={questionAnswer}
          setQuestionAnswer={setQuestionAnswer}
        />
      </div>
    </main>
  );
}
