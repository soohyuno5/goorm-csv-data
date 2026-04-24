# Goorm CSV Data

CSV 파일을 업로드하면 기본 통계, 패턴 요약, 간단한 시각화, GPT 기반 인사이트 요약을 제공하는 프로젝트입니다.

이 저장소에는 두 가지 결과물이 들어 있습니다.

- React + GPT 웹앱
- CSV EDA용 Python 노트북

## Features

- CSV 파일 업로드
- `papaparse` 기반 CSV 파싱
- 행 수, 열 수, 컬럼 목록, 샘플 데이터 미리보기
- 수치형 컬럼 평균/최소/최대 계산
- 범주형 컬럼 상위 빈도 집계
- GPT 인사이트 요약
- 간단한 대시보드형 차트 UI
- Jupyter Notebook 기반 EDA 및 시각화 템플릿

## Tech Stack

- React
- Vite
- Express
- OpenAI Responses API
- Papa Parse
- Python
- pandas
- matplotlib
- seaborn

## Project Structure

```text
.
├─ src/
│  ├─ components/
│  │  ├─ Upload.jsx
│  │  └─ Result.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ server/
│  └─ index.js
├─ data_eda_template.ipynb
├─ package.json
├─ vite.config.js
└─ .env.example
```

## Web App Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

`.env.example`를 참고해서 루트 폴더에 `.env` 파일을 만듭니다.

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

### 3. Run development server

```bash
npm run dev
```

기본 주소:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

## How It Works

1. 사용자가 CSV 파일을 업로드합니다.
2. 프런트엔드에서 CSV를 파싱합니다.
3. 기본 통계와 패턴 요약을 계산합니다.
4. 계산된 요약 정보를 `/api/gpt`로 전송합니다.
5. 서버가 OpenAI API를 호출해 인사이트를 생성합니다.
6. 화면에 요약 카드, 표, 차트, GPT 분석 결과를 표시합니다.

## Notebook Usage

`data_eda_template.ipynb`는 CSV 파일을 선택해서 바로 EDA를 수행할 수 있는 노트북입니다.

포함 내용:

- 데이터 개요 출력
- 결측치 확인
- 수치형 요약 통계
- 범주형 요약 통계
- 상관관계 확인
- 히스토그램 / 박스플롯 / 범주형 빈도 차트 / 날짜 추이 차트

## Recommended Test File

예시 테스트 파일:

- `100 Sales Records.csv`

이 파일로 다음 항목을 빠르게 확인할 수 있습니다.

- 수치형 평균 비교
- 범주형 상위 패턴
- 날짜 컬럼 존재 여부
- GPT 인사이트 요약 동작

## Build

```bash
npm run build
```

## Notes

- `.env` 파일은 민감 정보가 포함되므로 Git에 포함되지 않도록 `.gitignore`에 제외되어 있습니다.
- 개발 환경에 따라 프런트와 API 서버를 각각 따로 실행해야 할 수 있습니다.

## License

개인 학습 및 실습용 프로젝트입니다.
