# Goorm CSV Data

CSV 파일을 업로드하면 데이터 개요, GPT 인사이트, 추천 차트, 후속 질문 기능을 한 화면에서 확인할 수 있는 React + GPT 웹앱입니다.

이 저장소에는 두 가지 결과물이 포함되어 있습니다.

- React + GPT 기반 CSV 분석 웹앱
- Python 기반 CSV EDA 노트북 템플릿

## 배포 주소

- 프로덕션: [https://goorm-csv-data.vercel.app](https://goorm-csv-data.vercel.app)

## 주요 기능

- CSV 업로드 및 파싱
- 행 수, 열 수, 컬럼 목록, 샘플 데이터 미리보기
- 수치형, 범주형, 날짜형 컬럼 자동 요약
- GPT 구조화 분석
- GPT 추천 차트 시각화
- 데이터 질문하기
- 로컬 스토리지 상태 저장 및 복원
- 로컬 스토리지 비우기

## 화면 구성

- 상단 제목과 현재 분석 중인 데이터 이름 표시
- 로컬 저장 용량 표시 및 초기화 버튼
- KPI 요약 카드
- GPT 인사이트 카드
- Chart.js 기반 추천 차트
- 데이터 테이블과 수치형/범주형 요약
- 후속 질문 입력창과 추천 질문

## 기술 스택

- React
- Vite
- Express
- OpenAI Responses API
- Chart.js
- react-chartjs-2
- Papa Parse
- Python
- pandas
- matplotlib
- seaborn

## 프로젝트 구조

```text
.
├─ api/
│  ├─ ask.js
│  ├─ gpt.js
│  └─ health.js
├─ lib/
│  └─ analysisService.js
├─ server/
│  └─ index.js
├─ src/
│  ├─ components/
│  │  ├─ Result.jsx
│  │  └─ Upload.jsx
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ data_eda_template.ipynb
├─ package.json
├─ vercel.json
├─ vite.config.js
├─ .env.example
└─ .gitignore
```

## 로컬 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. `.env` 파일 생성

루트 경로에 `.env` 파일을 만들고 OpenAI API 키를 설정합니다.

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

### 3. 개발 서버 실행

```bash
npm run dev
```

기본 주소:

- 프런트엔드: `http://localhost:5173`
- API 서버: `http://localhost:3001`

## Vercel 배포

이 프로젝트는 Vercel 배포를 위한 설정이 포함되어 있습니다.

필수 환경 변수:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

권장 값:

```env
OPENAI_MODEL=gpt-4.1-mini
```

## 동작 흐름

1. 사용자가 CSV 파일을 업로드합니다.
2. 프런트엔드에서 CSV를 파싱합니다.
3. 기본 통계와 샘플 데이터를 계산합니다.
4. 요약 정보를 `/api/gpt`로 전송합니다.
5. 서버가 OpenAI API를 호출해 구조화된 인사이트를 생성합니다.
6. 화면에 KPI, 인사이트, 추천 차트, 데이터 표를 표시합니다.
7. 사용자는 `/api/ask`를 통해 추가 질문을 보낼 수 있습니다.

## 질문하기 예시

- 어떤 컬럼의 변동폭이 가장 큰가요?
- 어떤 지역이나 상품군의 성과가 높나요?
- 날짜 흐름에 따라 매출 추이가 보이나요?
- 다음으로 어떤 분석을 해보면 좋을까요?

## 로컬 스토리지

현재 세션 상태를 로컬 스토리지에 저장합니다.

- 업로드한 데이터의 분석 결과
- GPT 인사이트 결과
- 최근 질문과 답변

상단의 `로컬 스토리지 비우기` 버튼을 누르면 저장 데이터와 현재 화면 상태가 함께 초기화됩니다.

## 노트북 템플릿

`data_eda_template.ipynb`는 CSV 파일을 선택해서 바로 EDA를 수행할 수 있는 노트북입니다.

포함 내용:

- 데이터 개요
- 결측치 확인
- 수치형 요약 통계
- 범주형 요약 통계
- 상관관계 확인
- 히스토그램, 박스플롯, 범주형 빈도 차트, 날짜 추이 차트

## 빌드

```bash
npm run build
```

## 참고

- `.env` 파일은 민감 정보가 포함되므로 Git에 포함하지 않습니다.
- `.vercel` 폴더는 로컬 배포 메타데이터이므로 Git에 포함하지 않습니다.
- 화면은 PC와 태블릿 기준으로 최적화되어 있습니다.

## License

개인 학습 및 실습용 프로젝트입니다.
