# 👁️ FATE.AI · SHADOW REPORT

**당신의 어둠을 읽다.**  
생년월일·성별 입력 → 만세력은 코드가 결정론적으로 계산하고, 다크 심리 프로파일은 OpenAI가 담당합니다.

---

## 🎯 핵심 특징

- ✅ **정확한 계산**: `lunar-javascript`로 연주/월주/일주/시주 계산
- ✅ **오행 매핑 고정**: 천간/지지 → 오행 변환 하드코딩
- ✅ **다크 프로파일링**: V3.5 Deep Dark 엔진 — 병리학·방어기제·파국 예언
- ✅ **모드**: 심연(general) / 궁합(compatibility) / 커리어(career)
- ✅ **Supabase 캐시**: 동일 입력 재분석 시 API 비용 절감
- ✅ **하이브리드 환경변수**: 로컬 `.env` + 클라우드 `process.env` (Render 호환)

---

## 🚀 실행 방법

### 로컬

1. 프로젝트 루트에 `.env` 생성:
   ```env
   OPENAI_API_KEY=sk-proj-...
   SUPABASE_URL=https://....supabase.co
   SUPABASE_KEY=eyJ...
   ```
2. `npm install` 후 `npm start` (기본 포트 5500)
3. 브라우저에서 `http://localhost:5500` 접속

### 클라우드 (Render)

- **Build**: `npm install`  
- **Start**: `node server.mjs`  
- **Environment**: Render 대시보드 → Environment 탭에 `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` 등록  
- 키는 `process.env`로 주입되며, `.env` 파일은 불필요합니다.

---

## 📁 파일 구조

```
MANSE/
├── index.html      # 메인 UI (다크 테마, Tailwind)
├── style.css       # 보조 스타일
├── script.js       # 만세력 계산 + API 호출 + 로딩/결과 UI
├── server.mjs      # Node HTTP 서버, OpenAI 프록시, Supabase 캐시
├── package.json    # type: module, start → node server.mjs
├── .env            # 로컬용 (OPENAI_API_KEY, SUPABASE_*), 저장소 제외
├── README.md
├── QUICKSTART.md
├── SETUP.md
└── DESIGN.md
```

---

## 🛠️ 기술 스택

- **프론트**: HTML5, Tailwind CSS, Pretendard, marked.js, html2canvas
- **백엔드**: Node.js (plain http), OpenAI gpt-4o-mini
- **캐시/DB**: Supabase (`saju_reports` 테이블)
- **배포**: Render (또는 동일 스펙 호환)

---

## 📖 작동 원리

1. **계산**: `lunar-javascript`로 사주(四柱) 계산 → JSON 생성
2. **오행 변환**: 천간/지지 → 오행 개수·일주(day_master) 하드코딩 매핑
3. **분석 요청**: `POST /api/analyze`에 `{ sajuJson, mode }` 전송
4. **캐시**: 요청 해시로 Supabase 조회 → 있으면 즉시 반환, 없으면 OpenAI 호출 후 저장
5. **출력**: Markdown 렌더링, [[…]] 훅 추출(인스타 카드용)

---

## ⚠️ 주의사항

- 본 서비스는 **성향·심리 프로파일**을 목적으로 하며, 점/운세가 아닙니다.
- API 키는 **서버 환경**에만 두고, 클라이언트에 노출하지 않습니다.
- CORS: `ALLOWED_ORIGINS`에 프론트 출처(localhost, fate.ai.kr, Render URL, GitHub Pages 등)를 등록해야 합니다.

---

## 📚 참고

- [lunar-javascript](https://github.com/6tail/lunar-javascript)
- [OpenAI API](https://platform.openai.com/docs)
- [Supabase](https://supabase.com/docs)

---

**Made with 👁️ by FATE.AI**
