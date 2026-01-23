# 🚀 SAJU.AI 빠른 시작

## 1단계: `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 만들고:

```env
OPENAI_API_KEY=sk-proj-...본인의실제키...
```

발급: [OpenAI Platform](https://platform.openai.com/api-keys)

---

## 2단계: 서버 실행

```bash
node server.mjs
```

콘솔에 다음이 보이면 성공:
```
SAJU.AI server running: http://localhost:5500
- Reads .env -> /env.json (OPENAI_API_KEY)
```

---

## 3단계: 브라우저 접속

`http://localhost:5500` 접속 후:

1. **생년월일 6자리** 입력 (예: `930721`)
   - 50 이상 → 1900년대 (예: 93 → 1993)
   - 49 이하 → 2000년대 (예: 05 → 2005)

2. **태어난 시간** 선택 (예: 14:30)

3. **성별** 선택

4. **현재 연애 상태** 선택
   - 솔로 / 연애 중 / 권태기 / 결혼 / 이혼 / 사별

5. **"✨ 내 사주 분석하기"** 클릭

---

## ✅ 정상 동작 확인

### 브라우저 콘솔 (F12)에서 확인:
```
1. calculateSaju() 호출 → JSON 생성
2. analyzeSaju() 호출 → OpenAI 해석
3. Markdown 렌더링
```

### 직접 확인:
브라우저에서 `http://localhost:5500/env.json` 접속 시:
```json
{
  "OPENAI_API_KEY": "sk-proj-..."
}
```

위처럼 키가 보이면 `.env` 로드 성공입니다.

---

## ⚠️ 문제 해결

### "OPENAI_API_KEY가 .env에 없습니다" 에러
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. `OPENAI_API_KEY=...` 형식이 정확한지 확인
3. 서버를 **`node server.mjs`**로 실행했는지 확인
4. 브라우저에서 `/env.json` 직접 접속해서 키 확인

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
| 연애 상태 | 선택 | 솔로/연애중/권태기/결혼/이혼/사별 |

---

**Made with 🔮 by SAJU.AI**
