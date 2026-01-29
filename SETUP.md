# 🛠️ FATE.AI 설치 및 환경 가이드

## 1️⃣ 환경변수 (하이브리드 전략)

서버는 **1순위 process.env(클라우드)**, **2순위 .env 파일(로컬)** 순으로 읽습니다.

### 로컬 개발

프로젝트 루트에 `.env` 생성:

```env
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...
```

### 클라우드 (Render 등)

- `.env` 파일은 사용하지 않습니다.
- 대시보드 **Environment** 탭에 다음을 등록:
  - `OPENAI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
- 필요 시 `PORT` (기본 5500, Render는 자동 주입)

---

## 2️⃣ 로컬 서버 실행

**필수**: 브라우저 모듈/API 호출을 위해 HTTP 서버로 제공해야 합니다.

```bash
npm install
npm start
```

- 포트: `process.env.PORT` 또는 **5500**
- 접속: `http://localhost:5500`

---

## 3️⃣ Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. **Table Editor**에서 `saju_reports` 테이블 생성:
   - `hash` (text, primary key 또는 unique)
   - `content` (text)
   - `input_json` (jsonb, nullable)
   - 필요 시 `created_at` 등
3. **Settings → API**에서 `SUPABASE_URL`, `SUPABASE_KEY`(anon 또는 service_role) 복사

---

## 4️⃣ 프론트 → 백엔드 연결

- **로컬 테스트**: `script.js`의 `API_URL`을 `http://localhost:5500/api/analyze`로 두고, 같은 머신에서 서버 실행
- **운영**: `API_URL`을 Render(또는 실제 백엔드) URL로 설정 (예: `https://fate-ai-rgea.onrender.com/api/analyze`)
- **CORS**: `server.mjs`의 `ALLOWED_ORIGINS`에 프론트 출처(localhost, fate.ai.kr, dunnekim.github.io 등)가 포함되어 있어야 합니다.

---

## 5️⃣ 배포 (Render 예시)

- **Build Command**: `npm install`
- **Start Command**: `node server.mjs` (또는 `npm start`)
- **Environment**: 위 세 키 등록
- **Branch**: 배포할 브랜치 지정

---

## 📂 파일 구조

```
MANSE/
├── index.html      # 메인 UI
├── style.css       # 다크 테마 보조 스타일
├── script.js       # 만세력 계산 + API 호출 + UI
├── server.mjs      # HTTP 서버, /api/analyze, Supabase 캐시
├── package.json   # type: module, start → node server.mjs
├── .env            # 로컬용 (저장소 제외)
├── README.md
├── QUICKSTART.md
├── SETUP.md        # 이 파일
└── DESIGN.md
```

---

**Made with 👁️ by FATE.AI**
