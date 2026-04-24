import Papa from "papaparse";

function isNumericValue(value) {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  return !Number.isNaN(Number(value));
}

function summarizeNumericColumn(rows, column) {
  const values = rows
    .map((row) => Number(row[column]))
    .filter((value) => !Number.isNaN(value));

  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = total / values.length;

  return {
    column,
    count: values.length,
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    avg: Number(avg.toFixed(2)),
  };
}

function summarizeCategoricalColumn(rows, column) {
  const counts = new Map();

  rows.forEach((row) => {
    const rawValue = row[column];
    const value =
      rawValue === null || rawValue === undefined || rawValue === ""
        ? "(empty)"
        : String(rawValue);
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  const topValues = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([value, count]) => ({ value, count }));

  return {
    column,
    uniqueCount: counts.size,
    topValues,
  };
}

function summarizeDateColumn(rows, column) {
  const parsed = rows
    .map((row) => {
      const raw = row[column];
      const date = new Date(raw);
      return Number.isNaN(date.getTime()) ? null : date;
    })
    .filter(Boolean);

  if (!parsed.length || parsed.length / rows.length < 0.7) {
    return null;
  }

  const monthlyMap = new Map();
  parsed.forEach((date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  });

  return {
    column,
    monthlyCounts: [...monthlyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count })),
  };
}

function buildAnalysis(fileName, rows) {
  const cleanRows = rows.filter((row) =>
    Object.values(row || {}).some(
      (value) => value !== null && value !== undefined && String(value).trim() !== "",
    ),
  );

  const columns = Object.keys(cleanRows[0] || {});
  const numericColumns = columns.filter((column) =>
    cleanRows.every((row) => {
      const value = row[column];
      return value === null || value === undefined || value === "" || isNumericValue(value);
    }),
  );
  const categoricalColumns = columns.filter((column) => !numericColumns.includes(column));
  const dateSummary = categoricalColumns
    .map((column) => summarizeDateColumn(cleanRows, column))
    .filter(Boolean);
  const dateColumns = dateSummary.map((item) => item.column);
  const textCategoricalColumns = categoricalColumns.filter(
    (column) => !dateColumns.includes(column),
  );

  return {
    fileName,
    rowCount: cleanRows.length,
    columnCount: columns.length,
    columns,
    previewRows: cleanRows.slice(0, 5),
    sampleRows: cleanRows.slice(0, 40),
    numericSummary: numericColumns
      .map((column) => summarizeNumericColumn(cleanRows, column))
      .filter(Boolean),
    categoricalSummary: textCategoricalColumns.map((column) =>
      summarizeCategoricalColumn(cleanRows, column),
    ),
    dateSummary,
  };
}

async function fetchGptAnalysis(analysis) {
  const response = await fetch("/api/gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ analysis }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "GPT 분석 요청에 실패했습니다.");
  }

  return payload;
}

export default function Upload({
  setAnalysis,
  setInsights,
  setLoading,
  setError,
  setQuestionAnswer,
  setQuestionError,
}) {
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setQuestionAnswer("");
    setQuestionError("");
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const analysis = buildAnalysis(file.name, data);
          setAnalysis(analysis);
          const result = await fetchGptAnalysis(analysis);
          setInsights(result.insights);
        } catch (parseError) {
          setError(parseError.message || "CSV 처리 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      },
      error: (parseError) => {
        setLoading(false);
        setError(parseError.message || "CSV 파일을 읽는 중 오류가 발생했습니다.");
      },
    });
  };

  return (
    <section className="panel upload-panel">
      <div>
        <p className="panel-label">1. 데이터 업로드</p>
        <h2>CSV 파일 선택</h2>
        <p className="panel-copy">
          업로드와 동시에 요약 통계, 샘플 행, 날짜 패턴을 계산하고 GPT가 읽기 좋은
          분석 카드와 차트 추천을 생성합니다.
        </p>
      </div>

      <label className="upload-box" htmlFor="csv-upload">
        <span className="upload-title">CSV 업로드</span>
        <span className="upload-subtitle">
          파일을 선택하면 분석, 추천 차트, 질문 준비까지 자동으로 진행됩니다.
        </span>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </label>
    </section>
  );
}
