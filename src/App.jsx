import { useState } from "react";
import Upload from "./components/Upload";
import Result from "./components/Result";

const initialState = {
  fileName: "",
  rowCount: 0,
  columnCount: 0,
  columns: [],
  previewRows: [],
  numericSummary: [],
  categoricalSummary: [],
};

export default function App() {
  const [analysis, setAnalysis] = useState(initialState);
  const [gptResult, setGptResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">CSV React + GPT Analyzer</p>
        <h1>CSV 업로드부터 요약 인사이트까지 한 번에</h1>
        <p className="hero-copy">
          작은 CSV 파일을 업로드하면 기본 통계, 패턴, 평균값을 정리하고 GPT가
          핵심 인사이트를 자연어로 요약합니다.
        </p>
      </section>

      <Upload
        setAnalysis={setAnalysis}
        setGptResult={setGptResult}
        setLoading={setLoading}
        setError={setError}
      />

      <Result
        analysis={analysis}
        gptResult={gptResult}
        loading={loading}
        error={error}
      />
    </main>
  );
}
