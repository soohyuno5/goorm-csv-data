import { useMemo, useState } from "react";
import "chart.js/auto";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

function formatNumber(value) {
  return Number(value).toLocaleString();
}

function renderTopValues(topValues) {
  return topValues.map(({ value, count }) => `${value} (${count})`).join(", ");
}

function MetricCards({ analysis }) {
  const numericCount = analysis.numericSummary.length;
  const categoricalCount = analysis.categoricalSummary.length;
  const dateColumns = analysis.dateSummary.map((item) => item.column);

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <span>행</span>
        <strong>{formatNumber(analysis.rowCount)}</strong>
      </div>
      <div className="kpi-card">
        <span>열</span>
        <strong>{formatNumber(analysis.columnCount)}</strong>
      </div>
      <div className="kpi-card">
        <span>수치형</span>
        <strong>{formatNumber(numericCount)}</strong>
      </div>
      <div className="kpi-card">
        <span>범주형</span>
        <strong>{formatNumber(categoricalCount)}</strong>
      </div>
      <div className="kpi-card kpi-card-wide">
        <span>날짜형 컬럼</span>
        <strong>{dateColumns.length ? dateColumns.join(", ") : "없음"}</strong>
      </div>
    </div>
  );
}

function InsightSection({ title, items, emptyText }) {
  return (
    <div className="insight-block">
      <h3>{title}</h3>
      {items?.length ? (
        <ul className="insight-list">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-copy">{emptyText}</p>
      )}
    </div>
  );
}

function buildChartConfig(analysis, recommendedChart) {
  const fallbackNumeric = analysis.numericSummary.slice(0, 6);
  const fallbackCategory = analysis.categoricalSummary[0];
  const fallbackDate = analysis.dateSummary[0];

  const type = recommendedChart?.type || "bar";
  const targetColumn = recommendedChart?.targetColumn;
  const metric = recommendedChart?.metric || "avg";

  if (type === "line" && fallbackDate) {
    return {
      component: Line,
      title: `${fallbackDate.column} 추이`,
      description: recommendedChart?.reason || "",
      data: {
        labels: fallbackDate.monthlyCounts.map((item) => item.label),
        datasets: [
          {
            label: fallbackDate.column,
            data: fallbackDate.monthlyCounts.map((item) => item.count),
            borderColor: "#2f6fed",
            backgroundColor: "rgba(47, 111, 237, 0.12)",
            tension: 0.28,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    };
  }

  if ((type === "doughnut" || type === "pie") && fallbackCategory) {
    return {
      component: type === "pie" ? Pie : Doughnut,
      title: `${fallbackCategory.column} 분포`,
      description: recommendedChart?.reason || "",
      data: {
        labels: fallbackCategory.topValues.map((item) => item.value),
        datasets: [
          {
            label: fallbackCategory.column,
            data: fallbackCategory.topValues.map((item) => item.count),
            backgroundColor: ["#2f6fed", "#5b8def", "#8eb4ff", "#df8b4e", "#efb167", "#d5ddeb"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    };
  }

  const targetItems = targetColumn
    ? fallbackNumeric.filter((item) => item.column === targetColumn)
    : fallbackNumeric;
  const items = targetItems.length ? targetItems : fallbackNumeric;
  const values =
    metric === "range" ? items.map((item) => item.max - item.min) : items.map((item) => item.avg);

  return {
    component: Bar,
    title: metric === "range" ? "범위 비교" : "평균 비교",
    description: recommendedChart?.reason || "",
    data: {
      labels: items.map((item) => item.column),
      datasets: [
        {
          label: metric === "range" ? "범위" : "평균",
          data: values,
          backgroundColor: metric === "range" ? "#df8b4e" : "#2f6fed",
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      indexAxis: metric === "range" ? "y" : "x",
      scales: {
        y: metric === "range" ? undefined : { beginAtZero: true },
        x: metric === "range" ? { beginAtZero: true } : undefined,
      },
    },
  };
}

function RecommendedChart({ analysis, recommendedChart }) {
  const chartConfig = useMemo(
    () => buildChartConfig(analysis, recommendedChart),
    [analysis, recommendedChart],
  );

  if (!analysis.rowCount) {
    return <p className="empty-copy">CSV를 업로드하면 차트가 표시됩니다.</p>;
  }

  const ChartComponent = chartConfig.component;

  return (
    <div className="chart-card chart-canvas-card">
      <div className="chart-header">
        <h3>{chartConfig.title}</h3>
        {chartConfig.description ? <p>{chartConfig.description}</p> : null}
      </div>
      <div className="chart-canvas-wrap">
        <ChartComponent data={chartConfig.data} options={chartConfig.options} />
      </div>
    </div>
  );
}

async function askQuestion({ question, analysis }) {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, analysis }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "질문 요청에 실패했습니다.");
  }

  return payload.answer;
}

function AskDataPanel({
  analysis,
  suggestedQuestions,
  questionLoading,
  setQuestionLoading,
  questionError,
  setQuestionError,
  questionAnswer,
  setQuestionAnswer,
}) {
  const [question, setQuestion] = useState("");

  const submitQuestion = async (nextQuestion) => {
    if (!nextQuestion.trim() || !analysis.rowCount) {
      return;
    }

    setQuestionLoading(true);
    setQuestionError("");
    try {
      const answer = await askQuestion({ question: nextQuestion, analysis });
      setQuestionAnswer(answer);
      setQuestion(nextQuestion);
    } catch (error) {
      setQuestionError(error.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <article className="panel">
      <div className="section-heading">
        <h2>질문하기</h2>
      </div>
      <div className="ask-panel">
        <div className="ask-form">
          <textarea
            className="question-input"
            rows={4}
            placeholder="예: 어떤 컬럼의 변동폭이 가장 큰가요?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button
            className="primary-button"
            type="button"
            disabled={questionLoading || !analysis.rowCount}
            onClick={() => submitQuestion(question)}
          >
            {questionLoading ? "질문 중..." : "질문하기"}
          </button>
        </div>

        <div className="ask-side">
          <h3>추천 질문</h3>
          <div className="question-chip-wrap">
            {suggestedQuestions?.length ? (
              suggestedQuestions.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  className="question-chip"
                  type="button"
                  onClick={() => submitQuestion(item)}
                >
                  {item}
                </button>
              ))
            ) : (
              <p className="empty-copy">업로드 후 질문이 표시됩니다.</p>
            )}
          </div>
        </div>
      </div>

      {questionError ? <p className="error-copy">{questionError}</p> : null}
      {questionAnswer ? (
        <div className="answer-card">
          <h3>답변</h3>
          <p>{questionAnswer}</p>
        </div>
      ) : null}
    </article>
  );
}

export default function Result({
  analysis,
  insights,
  loading,
  error,
  questionLoading,
  setQuestionLoading,
  questionError,
  setQuestionError,
  questionAnswer,
  setQuestionAnswer,
}) {
  const hasData = analysis.rowCount > 0;

  return (
    <section className="dashboard-grid">
      <article className="panel dashboard-summary">
        <div className="section-heading">
          <h2>요약</h2>
        </div>
        {hasData ? (
          <>
            <MetricCards analysis={analysis} />
            <div className="stats-grid compact-stats">
              <div className="stat-card">
                <span>파일명</span>
                <strong>{analysis.fileName}</strong>
              </div>
              <div className="stat-card">
                <span>컬럼</span>
                <strong>{analysis.columns.join(", ")}</strong>
              </div>
            </div>
          </>
        ) : (
          <p className="empty-copy">CSV를 업로드하면 요약이 표시됩니다.</p>
        )}
      </article>

      <article className="panel dashboard-insights">
        <div className="section-heading">
          <h2>인사이트</h2>
        </div>
        {loading ? <p className="status-copy">분석 중입니다...</p> : null}
        {!loading && error ? <p className="error-copy">{error}</p> : null}
        {!loading && !error && hasData ? (
          <div className="insight-layout">
            <div className="overview-card">
              <p>{insights.overview || "요약이 없습니다."}</p>
            </div>
            <InsightSection
              title="핵심"
              items={insights.highlights}
              emptyText="표시할 내용이 없습니다."
            />
            <InsightSection
              title="주의"
              items={insights.cautions}
              emptyText="표시할 내용이 없습니다."
            />
          </div>
        ) : null}
        {!loading && !error && !hasData ? (
          <p className="empty-copy">CSV를 업로드하면 인사이트가 표시됩니다.</p>
        ) : null}
      </article>

      <article className="panel dashboard-chart">
        <div className="section-heading">
          <h2>차트</h2>
        </div>
        <div className="chart-grid single-chart">
          <RecommendedChart
            analysis={analysis}
            recommendedChart={insights.recommendedChart}
          />
        </div>
      </article>

      <article className="panel dashboard-data">
        <div className="section-heading">
          <h2>데이터</h2>
        </div>
        {!hasData ? (
          <p className="empty-copy">CSV를 업로드하면 데이터가 표시됩니다.</p>
        ) : (
          <div className="data-layout">
            <div className="table-wrap data-table-panel">
              <table>
                <thead>
                  <tr>
                    {analysis.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.previewRows.map((row, index) => (
                    <tr key={index}>
                      {analysis.columns.map((column) => (
                        <td key={`${index}-${column}`}>{String(row[column] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="data-summary-stack">
              <div>
                <h3>수치형</h3>
                {analysis.numericSummary.length ? (
                  <ul className="summary-list">
                    {analysis.numericSummary.map((item) => (
                      <li key={item.column}>
                        <strong>{item.column}</strong>: 평균 {formatNumber(item.avg)}, 최소{" "}
                        {formatNumber(item.min)}, 최대 {formatNumber(item.max)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-copy">수치형 컬럼이 없습니다.</p>
                )}
              </div>

              <div>
                <h3>범주형</h3>
                {analysis.categoricalSummary.length ? (
                  <ul className="summary-list">
                    {analysis.categoricalSummary.map((item) => (
                      <li key={item.column}>
                        <strong>{item.column}</strong>: 고유값 {item.uniqueCount}개, 상위값{" "}
                        {renderTopValues(item.topValues)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-copy">범주형 컬럼이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </article>

      <div className="dashboard-ask">
        <AskDataPanel
          analysis={analysis}
          suggestedQuestions={insights.suggestedQuestions}
          questionLoading={questionLoading}
          setQuestionLoading={setQuestionLoading}
          questionError={questionError}
          setQuestionError={setQuestionError}
          questionAnswer={questionAnswer}
          setQuestionAnswer={setQuestionAnswer}
        />
      </div>
    </section>
  );
}
