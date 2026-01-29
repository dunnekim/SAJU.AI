# 🚀 FATE.AI 빠른 시작

## 1단계: `.env` 파일 생성 (로컬용)

프로젝트 루트에 `.env` 파일을 만들고:

```env
OPENAI_API_KEY=sk-proj-...본인의실제키...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...본인의_anon_또는_service_role_키...
```

- OpenAI 발급: [OpenAI Platform](https://platform.openai.com/api-keys)
- Supabase: [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 → Settings → API

---

## 2단계: 의존성 & 서버 실행

```bash
npm install
npm start
```

콘솔에 다음이 보이면 성공:
```
🌑 SHADOW REPORT V3.5 Server running: http://localhost:5500
- Supabase Cache: Active
```

---

## 3단계: 브라우저 접속

`http://localhost:5500` 접속 후:

1. **생년월일 6자리** 입력 (예: `930721`)
   - 50 이상 → 1900년대 (예: 93 → 1993)
   - 49 이하 → 2000년대 (예: 05 → 2005)

2. **태어난 시간** 선택 (예: 14:30)

3. **성별** 선택

4. **연애 상태** 선택 (솔로 / 연애 중 / 위기 / 결혼 / 이혼 / 사별)

5. **현재 상태** 선택 (취준 / 현타 / 이직)

6. **「심연 읽기」** 클릭

---

## ✅ 정상 동작 확인

### 브라우저 콘솔 (F12)에서 확인:
```
1. calculateSaju() 호출 → JSON 생성
2. analyzeSaju() 호출 → Render API(/api/analyze) 호출
3. Markdown 렌더링
```

### 서버 로그:
- `[Supabase] Searching Cache: ...` → 캐시 조회
- `[Supabase] Cache HIT!` 또는 `Cache MISS -> Calling OpenAI...`

---

## ⚠️ 문제 해결

### "API 키가 누락되었습니다" 에러
- **로컬**: `.env`에 `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`가 있는지 확인
- **Render**: Environment 탭에 위 세 변수를 등록했는지 확인

### 날짜 파싱 에러
- 6자리 숫자만 입력 (예: 930721)
- YYMMDD 형식 준수

---

## 📋 입력 형식

| 항목 | 형식 | 예시 |
|------|------|------|
| 생년월일 | YYMMDD (6자리) | 930721 |
| 시간 | HH:mm | 14:30 |
| 성별 | 선택 | 남/여/기타 |
| 연애 상태 | 선택 | 솔로/연애중/위기/결혼/이혼/사별 |
| 현재 상태 | 선택 | 취준/현타/이직 |

---

**Made with 👁️ by FATE.AI**
