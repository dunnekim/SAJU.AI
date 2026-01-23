# 🚀 빠른 시작 가이드

## 1️⃣ Google Gemini API Key 설정

### 방법 1: config.js 사용 (권장)

```bash
# Windows PowerShell
copy config.example.js config.js

# macOS/Linux
cp config.example.js config.js
```

그 다음 `config.js` 파일을 열어서:
```javascript
export const config = {
  GEMINI_API_KEY: "AIzaSyD여기에_실제_키_입력"
};
```

### 방법 2: 웹 UI에서 직접 입력

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. **"Create API Key"** 클릭
3. API 키 복사 후 웹 페이지에 입력

---

## 2️⃣ 로컬 서버 실행

**중요**: 브라우저 `importmap` 모듈 로딩을 위해 반드시 로컬 서버를 사용해야 합니다!

### Windows (PowerShell)
```powershell
# Python이 설치되어 있다면
python -m http.server 5500

# 또는 Node.js가 있다면
npx http-server -p 5500
```

### macOS/Linux
```bash
# Python 3
python3 -m http.server 5500

# 또는 Node.js
npx http-server -p 5500
```

---

## 3️⃣ 브라우저에서 테스트

1. 브라우저에서 `http://localhost:5500` 열기
2. 생년월일시 입력 (예: 1993-07-21 14:30)
3. **Google API Key** 필드에 발급받은 키 입력
4. ✅ "브라우저에 저장" 체크하면 다음에 자동으로 불러옴
5. **"✨ 내 사주 분석하기"** 버튼 클릭
6. 콘솔(F12)에서 다음 흐름 확인:
   - ✅ `calculateSaju()` 호출 → JSON 생성
   - ✅ `analyzeSaju()` 호출 → Gemini Flash 해석
   - ✅ Markdown 렌더링

---

## 🔍 RALPH 아키텍처 검증 체크리스트

### ✅ Step 1: 결정론적 계산 (script.js)
```javascript
// 천간/지지 → 오행 매핑이 하드코딩되어 있는가?
const GAN_TO_ELEMENT = { "甲": "wood", "乙": "wood", ... };
const JI_TO_ELEMENT = { "子": "water", "丑": "earth", ... };

// lunar-javascript로 사주 4주를 추출하는가?
const solar = Solar.fromYmdHms(y, m, d, hh, mm, 0);
const lunar = solar.getLunar();
```

### ✅ Step 2: JSON 생성 (No LLM)
```json
{
  "four_pillars": {
    "year": { "gan": "癸", "ji": "酉" },
    "month": { "gan": "己", "ji": "未" },
    "day": { "gan": "癸", "ji": "酉" },
    "hour": { "gan": "己", "ji": "未" }
  },
  "five_elements_count": { "wood": 0, "fire": 0, "earth": 4, "metal": 2, "water": 2 },
  "day_master": "癸"
}
```

### ✅ Step 3: Gemini 시스템 프롬프트
```javascript
const systemInstruction = `
1. TRUTH GROUNDING: Do NOT calculate the pillars yourself. 
   The JSON provided is the absolute truth.
2. NO MAGIC: Do not predict the future. Focus on personality.
3. TONE: Professional, insightful, dry, and analytical. (Use Korean)
`;
```

### ✅ Step 4: 결과 출력
- Markdown 형태로 렌더링
- **핵심 기질 (Day Master)** 분석
- **오행의 균형** 코멘트
- **제언** (실용적 조언)

---

## ⚠️ 문제 해결

### 1. "Failed to fetch" 에러
- 로컬 서버로 실행했는지 확인 (`file://`는 안 됨!)
- API 키가 올바른지 확인

### 2. "간지 값을 추출할 수 없습니다" 에러
- 날짜가 유효한지 확인 (예: 2월 30일은 존재하지 않음)
- 시간 형식이 `HH:mm`인지 확인

### 3. 결과가 이상하게 나옴
- 콘솔(F12)에서 `calculateSaju()` 출력 JSON 확인
- `five_elements_count`가 올바른지 검증
- Gemini가 JSON을 재계산했는지 의심되면 시스템 프롬프트 강화

---

## 📂 파일 구조

```
MANSE/
├── index.html      # UI + importmap
├── style.css       # saju-kid 스타일 UI
├── script.js       # 만세력 계산 + Gemini 연결
├── .gitignore      # .env 제외
├── README.md       # 상세 문서
└── SETUP.md        # 이 파일 (빠른 시작)
```

---

## 🎉 완료!

이제 **만세력 계산은 코드가**, **해석은 Gemini가** 담당하는 정확한 사주 분석기가 완성되었습니다!

**RALPH = Retrieve → Analyze → LLM → Present → Human**

---

Made with 💜 by RALPH Architecture
