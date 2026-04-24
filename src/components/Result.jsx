function formatNumber(value) {
  return Number(value).toLocaleString();
}

function renderTopValues(topValues) {
  return topValues.map(({ value, count }) => `${value} (${count})`).join(", ");
}

function HorizontalBarChart({ title, items, valueKey, colorClass, emptyMessage, formatter }) {
  if (!items.length) {
    return <p className="empty-copy">{emptyMessage}</p>;
  }

  const maxValue = Math.max(...items.map((item) => item[valueKey]), 1);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="bar-chart">
        {items.map((item) => {
          const width = `${(item[valueKey] / maxValue) * 100}%`;
          return (
            <div className="bar-row" key={item.column || item.label}>
              <div className="bar-meta">
                <span className="bar-label">{item.column || item.label}</span>
                <strong>{formatter(item[valueKey])}</strong>
              </div>
              <div className="bar-track">
                <div className={`bar-fill ${colorClass}`} style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryChart({ items }) {
  if (!items.length) {
    return <p className="empty-copy">범주형 컬럼이 없어 분포 차트를 표시할 수 없습니다.</p>;
  }

  const category = items[0];
  const maxValue = Math.max(...category.topValues.map((item) => item.count), 1);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>상위 범주 분포</h3>
        <p>{category.column}</p>
      </div>
      <div className="bar-chart">
        {category.topValues.map((item) => (
          <div className="bar-row" key={`${category.column}-${item.value}`}>
            <div className="bar-meta">
              <span className="bar-label">{item.value}</span>
              <strong>{formatNumber(item.count)}</strong>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill bar-fill-coral"
                style={{ width: `${(item.count / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCards({ analysis }) {
  const numericCount = analysis.numericSummary.length;
  const categoricalCount = analysis.categoricalSummary.length;
  const widestNumeric =
    analysis.numericSummary
      .slice()
      .sort((a, b) => b.max - a.max)
      .at(0) || null;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <span>총 행 수</span>
        <strong>{formatNumber(analysis.rowCount)}</strong>
      </div>
      <div className="kpi-card">
        <span>총 열 수</span>
        <strong>{formatNumber(analysis.columnCount)}</strong>
      </div>
      <div className="kpi-card">
        <span>수치형 컬럼</span>
        <strong>{formatNumber(numericCount)}</strong>
      </div>
      <div className="kpi-card">
        <span>범주형 컬럼</span>
        <strong>{formatNumber(categoricalCount)}</strong>
      </div>
      {widestNumeric && (
        <div className="kpi-card kpi-card-wide">
          <span>가장 큰 범위의 수치형 컬럼</span>
          <strong>
            {widestNumeric.column}: {formatNumber(widestNumeric.min)} ~{" "}
            {formatNumber(widestNumeric.max)}
          </strong>
        </div>
      )}
    </div>
  );
}

export default function Result({ analysis, gptResult, loading, error }) {
  const hasData = analysis.rowCount > 0;
  const numericChartItems = analysis.numericSummary
    .slice(0, 6)
    .map((item) => ({ ...item, label: item.column }));
  const numericRangeItems = analysis.numericSummary
    .slice(0, 6)
    .map((item) => ({ ...item, label: item.column, range: item.max - item.min }));

  return (
    <section className="result-grid">
      <article className="panel">
        <p className="panel-label">2. 기본 분석 결과</p>
        <h2>요약 정보</h2>
        {hasData ? (
          <>
            <MetricCards analysis={analysis} />
            <div className="stats-grid compact-stats">
              <div className="stat-card">
                <span>파일명</span>
                <strong>{analysis.fileName}</strong>
              </div>
              <div className="stat-card">
                <span>컬럼 목록</span>
                <strong>{analysis.columns.join(", ")}</strong>
              </div>
            </div>
          </>
        ) : (
          <p className="empty-copy">CSV를 업로드하면 기본 요약이 여기에 표시됩니다.</p>
        )}
      </article>

      <article className="panel">
        <p className="panel-label">3. GPT 분석</p>
        <h2>인사이트 요약</h2>
        {loading && <p className="status-copy">GPT가 데이터를 분석 중입니다...</p>}
        {!loading && error && <p className="error-copy">{error}</p>}
        {!loading && !error && gptResult && (
          <div className="gpt-output">
            {gptResult.split("\n").map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        )}
        {!loading && !error && !gptResult && (
          <p className="empty-copy">업로드 후 GPT 결과가 여기에 표시됩니다.</p>
        )}
      </article>

      <article className="panel wide-panel">
        <p className="panel-label">4. 시각화 대시보드</p>
        <h2>차트와 패턴 요약</h2>
        {!hasData && (
          <p className="empty-copy">CSV 업로드 후 차트와 데이터 패턴이 여기에 표시됩니다.</p>
        )}
        {hasData && (
          <div className="chart-grid">
            <HorizontalBarChart
              title="수치형 평균 비교"
              items={numericChartItems}
              valueKey="avg"
              colorClass="bar-fill-blue"
              emptyMessage="수치형 컬럼이 없어 평균 차트를 표시할 수 없습니다."
              formatter={(value) => formatNumber(value)}
            />
            <HorizontalBarChart
              title="수치형 범위 비교"
              items={numericRangeItems.map((item) => ({ ...item, label: item.column }))}
              valueKey="range"
              colorClass="bar-fill-gold"
              emptyMessage="수치형 컬럼이 없어 범위 차트를 표시할 수 없습니다."
              formatter={(value) => formatNumber(value)}
            />
            <CategoryChart items={analysis.categoricalSummary} />
          </div>
        )}
      </article>

      <article className="panel wide-panel">
        <p className="panel-label">5. 미리보기와 통계</p>
        <h2>샘플 데이터와 컬럼 통계</h2>
        {!hasData && (
          <p className="empty-copy">CSV 업로드 후 샘플 데이터와 컬럼 통계가 표시됩니다.</p>
        )}

        {hasData && (
          <>
            <div className="table-wrap">
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

            <div className="summary-columns">
              <div>
                <h3>수치형 평균/범위</h3>
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
                <h3>범주형 패턴</h3>
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
          </>
        )}
      </article>
    </section>
  );
}
