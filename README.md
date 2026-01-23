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

### 1. 페이지 접속

#### 방법 A: URL 파라미터로 자동 등록 (권장)
```
https://your-page.com/?key=sk-proj-...
```
- URL에 `?key=인증키` 형태로 접속하면 자동으로 등록됩니다
- 보안을 위해 URL에서 키가 자동으로 제거됩니다
- 이후 방문 시 키 입력 없이 바로 사용 가능

#### 방법 B: 모달에서 수동 입력
- 처음 방문 시 **인증 키 입력 모달**이 자동으로 표시됩니다
- 인증 키를 입력하고 "저장하고 시작하기" 클릭
- 키는 **브라우저 LocalStorage**에만 저장됩니다 (서버 전송 없음)

인증 키 발급: [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. 사주 분석

1. 생년월일 6자리 입력 (예: 930721)
2. 태어난 시간대 선택 (예: 오시 11:00~13:00)
3. 성별 및 연애 상태 선택
4. **"✨ 내 사주 분석하기"** 버튼 클릭

### 3. 인증 키 변경

- 하단 푸터의 "🔑 인증 키 변경" 버튼을 클릭하면 다시 입력 가능합니다

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
  - `OpenAI API`: 심리 분석 (gpt-4o-mini)
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
- 인증 키는 브라우저 LocalStorage에만 저장되며, 서버로 전송되지 않습니다.
- GitHub Pages 배포 시에도 안전하게 사용할 수 있습니다 (키는 코드에 포함되지 않음).
- URL 파라미터로 키를 전달할 때는 HTTPS를 사용하세요.
- `file://` 프로토콜로는 모듈 로딩이 안 될 수 있으니 로컬 서버 사용을 권장합니다.

---

## 📚 참고 자료

- [lunar-javascript GitHub](https://github.com/6tail/lunar-javascript)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

**Made with 🔮 by SAJU.AI**
