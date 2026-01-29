# 🎨 FATE.AI · SHADOW REPORT 디자인 가이드

## 개요

**FATE.AI · SHADOW REPORT**는 “당신의 어둠을 읽다” 콘셉트의 **다크 모던** UI입니다.  
배경·카드·입력 필드는 어두운 톤, 강조는 빨간 악센트(#FF3B30)로 통일합니다.  
레퍼런스: [saju-kid.com](https://saju-kid.com) (초기 레이아웃/폼 구조), 현재는 다크 테마로 전환된 상태입니다.

---

## 컬러 팔레트 (현재 적용값)

### 메인 컬러 (Tailwind `theme.extend.colors`)
- **배경 (Body)**: `#0a0a0a` — `saju-bg`
- **카드 배경**: `#141414` — `saju-card`
- **입력 필드**: `#1e1e1e` — `saju-input`
- **테두리**: `#333333` — `saju-border`
- **강조 (Accent)**: `#FF3B30` — `saju-accent` (버튼, 탭, 포커스)
- **본문 텍스트**: `#E0E0E0` — `saju-text`
- **보조 텍스트**: `#888888` — `saju-muted`

### 용도
- 버튼·탭·강조: `bg-saju-accent`, `text-saju-accent`
- 폼·카드: `bg-saju-input`, `bg-saju-card`, `border-saju-border`
- 본문/캡션: `text-saju-text`, `text-saju-muted`

---

## 타이포그래피

### 폰트 패밀리
```
'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont,
'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif
```

### 폰트 크기
- **제목 (H1)**: `text-4xl md:text-5xl`
- **부제목**: `text-xs md:text-sm`, `tracking-[0.1em]` uppercase
- **섹션 제목 (H2)**: 마크다운 `##` 렌더 결과
- **본문**: `text-saju-text`, `leading-relaxed`
- **캡션**: `text-saju-muted`, `text-xs`

---

## 레이아웃

### 컨테이너
- 최대 너비: `max-w-2xl`, 중앙 정렬 `mx-auto`
- 패딩: `px-4 py-8 md:py-12`

### 카드
- 배경: `bg-saju-card`, 테두리 `border border-gray-800`
- 모서리: `rounded-2xl`, 그림자 `shadow-2xl`
- 패딩: `p-6 md:p-8`
- 상단 강조 라인: `bg-gradient-to-r from-transparent via-saju-accent to-transparent`

### 간격
- 섹션 간: `mb-12`
- 폼 필드: `space-y-6`

---

## UI 컴포넌트

### 버튼 (Primary)
```html
<button class="w-full bg-saju-accent text-white font-black py-5 rounded-xl
               shadow-[0_0_25px_rgba(255,59,48,0.2)]
               hover:shadow-[0_0_40px_rgba(255,59,48,0.4)]
               transition-all uppercase tracking-widest">
  심연 읽기
</button>
```

### 입력 필드
```html
<input class="w-full px-4 py-3.5 bg-saju-input border border-saju-border
              rounded-xl text-saju-text placeholder-gray-700
              focus:outline-none focus:border-saju-accent focus:ring-1
              focus:ring-saju-accent transition-all shadow-inner" />
```

### 라디오 (커스텀)
- `peer-checked:border-saju-accent peer-checked:text-white peer-checked:bg-saju-accent`
- `shadow-[0_0_10px_rgba(255,59,48,0.3)]` (선택 시)

---

## 로딩 & 결과

- **로딩 오버레이**: 최소 12초(Abyssal Wait-Gate), 단계별 메시지, 프로그레스 바
- **결과**: Markdown 렌더, `[[…]]` 훅 추출 → 인스타 카드용 “심연의 한 마디”
- **인스타 카드 하단 브랜딩**: “당신의 어둠을 읽다” + **fate.ai**

---

## 반응형

- **Mobile**: 기본 (< 768px)
- **Desktop**: `md:` (≥ 768px)

---

## 참고 자료

- [Tailwind CSS](https://tailwindcss.com/docs)
- [saju-kid.com](https://saju-kid.com) (초기 레퍼런스)
- [Pretendard](https://github.com/orioncactus/pretendard)

---

**Made with 👁️ by FATE.AI**
