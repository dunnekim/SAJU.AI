# 🔮 SAJU.AI

당신의 내면을 읽는 심리 분석 웹앱입니다.  
만세력 계산은 코드가 결정론적으로 처리하고, 심리 분석은 AI가 담당합니다.

---

## 🎯 핵심 특징

- ✅ **정확한 계산**: `lunar-javascript`로 연주/월주/일주/시주를 정확히 계산
- ✅ **오행 매핑 고정**: 천간/지지 → 오행 변환을 코드에 하드코딩
- ✅ **심리 분석**: 계산된 JSON을 기반으로 심리/성향 분석
- ✅ **간소한 입력**: 생년월일 6자리 + 시간만 입력

---

## 🚀 실행 방법

### 1. API Key 설정 (.env)

프로젝트 루트에 `.env` 파일을 만들고 아래처럼 넣어두면, `SAJU.AI`가 자동으로 읽습니다:

```env
OPENAI_API_KEY=sk-...실제키...
```

발급: OpenAI 플랫폼에서 API 키 생성

### 2. 로컬 서버 실행 (권장: .env 자동 로드)

브라우저 모듈(`importmap`) 로딩을 위해 반드시 로컬 서버를 사용하세요.

`.env` 자동 로드를 원하면 아래 서버를 사용하세요:

```bash
node server.mjs
```

### 3. 브라우저 접속

`http://localhost:5500` 열고:
1. 생년월일 6자리 입력 (예: 930721)
2. 태어난 시간 입력 (예: 14:30)
3. 성별 및 연애 상태 선택
4. **"✨ 내 사주 분석하기"** 버튼 클릭

---

## 📁 파일 구조

```
MANSE/
├── index.html      # 메인 HTML (importmap 포함)
├── style.css       # 다크 모던 카드 UI
├── script.js       # 만세력 계산 + Gemini 연결
├── .gitignore      # .env 파일 제외
└── README.md       # 이 파일
```

---

## 🔑 API Key 관리

- **권장**: `.env` + `node server.mjs` (자동 로드)
- **대안**: 웹 UI에 직접 입력 후 “브라우저에 저장”

---

## 🛠️ 기술 스택

- **UI**: HTML5, Tailwind CSS (Utility-first CSS framework)
- **디자인**: saju-kid.com 영감, 미니멀리즘 + 따뜻한 테라코타 색상
- **로직**: ES6+ Modules
- **라이브러리** (CDN):
  - `lunar-javascript`: 만세력(사주) 계산
  - `@google/generative-ai`: Gemini Flash API
  - `marked.js`: Markdown 렌더링
  - `tailwindcss`: Utility CSS 프레임워크

---

## 📖 작동 원리

1. **계산**: 코드가 `lunar-javascript`로 사주(四柱) 계산
2. **분석**: 천간/지지를 오행으로 변환 (하드코딩 매핑)
3. **해석**: 계산된 JSON을 기반으로 심리 분석
4. **출력**: Markdown 형태로 분석 결과 표시

→ **계산과 해석을 분리하여 정확도를 보장합니다.**

---

## ⚠️ 주의사항

- 본 앱은 점/예언이 아니라 **성향·심리 분석**을 목적으로 합니다.
- API 키는 브라우저에서만 사용되며, 서버에 저장되지 않습니다.
- `file://` 프로토콜로는 모듈 로딩이 안 될 수 있으니 꼭 로컬 서버를 사용하세요.

---

## 📚 참고 자료

- [lunar-javascript GitHub](https://github.com/6tail/lunar-javascript)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [RALPH Architecture](https://arxiv.org/abs/2108.04812) (개념 참고)

---

**Made with ❤️ by RALPH Architecture**
