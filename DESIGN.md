# 🎨 디자인 가이드

## 개요

사주 분석기는 **saju-kid.com**을 레퍼런스로 하여 "현대적이고, 깔끔하고, 따뜻한 느낌의 미니멀리즘" 디자인을 구현했습니다.

---

## 컬러 팔레트

### 메인 컬러
- **배경색 (Body)**: `#F9F8F4` (연한 크림색)
  - Tailwind: `bg-saju-cream`
  
- **텍스트**: `#2D2D2D` (부드러운 차콜)
  - Tailwind: `text-saju-text`
  
- **강조 색상 (Accent)**: `#FF6B50` (따뜻한 테라코타 오렌지)
  - Tailwind: `bg-saju-accent`, `text-saju-accent`
  - 용도: 버튼, 링크, 중요 정보 강조

### 보조 컬러
- **카드 배경**: `#FFFFFF` (순백)
  - Tailwind: `bg-white`
  
- **테두리**: `#E5E7EB` (연한 회색)
  - Tailwind: `border-gray-200`
  
- **보조 텍스트**: `#6B7280` (중간 회색)
  - Tailwind: `text-gray-500`, `text-gray-600`

---

## 타이포그래피

### 폰트 패밀리
```
'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 
system-ui, Roboto, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif
```

### 폰트 크기
- **제목 (H1)**: `text-4xl md:text-5xl` (36px / 48px)
- **부제목**: `text-lg md:text-xl` (18px / 20px)
- **섹션 제목 (H2)**: `text-xl` (20px)
- **본문**: `text-base` (16px)
- **캡션**: `text-sm` (14px), `text-xs` (12px)

---

## 레이아웃

### 컨테이너
- 최대 너비: `max-w-2xl` (672px)
- 중앙 정렬: `mx-auto`
- 패딩: `px-4 py-8 md:py-12`

### 카드
- 배경: `bg-white`
- 모서리: `rounded-2xl` (16px)
- 그림자: `shadow-sm` (은은한 그림자)
- 패딩: `p-6 md:p-8`

### 간격
- 섹션 간: `mb-8`, `mb-12`
- 요소 간: `gap-4`, `gap-6`
- 폼 필드: `space-y-6`

---

## UI 컴포넌트

### 버튼 (Primary)
```html
<button class="w-full bg-saju-accent text-white font-bold py-4 px-6 
               rounded-full hover:bg-[#FF5540] active:scale-[0.98] 
               transition-all shadow-sm hover:shadow-md">
  ✨ 내 사주 분석하기
</button>
```

특징:
- 완전히 둥근 모양 (`rounded-full`)
- 강조 색상 배경
- 호버 시 색상 변화 + 그림자 증가
- 클릭 시 살짝 축소 효과

### 입력 필드
```html
<input class="w-full px-4 py-3 border border-gray-200 rounded-lg 
              focus:outline-none focus:border-saju-accent 
              focus:ring-2 focus:ring-saju-accent/20 transition-all" />
```

특징:
- 기본: 연한 회색 테두리
- 포커스: 강조 색상 테두리 + 링 효과
- 부드러운 전환 애니메이션

### 라디오 버튼 (커스텀)
```html
<label class="flex-1 cursor-pointer">
  <input type="radio" class="peer sr-only" />
  <div class="px-4 py-3 border-2 border-gray-200 rounded-lg 
              peer-checked:border-saju-accent peer-checked:bg-saju-accent/5 
              peer-checked:text-saju-accent hover:border-gray-300">
    남
  </div>
</label>
```

특징:
- 실제 input은 숨김 (`sr-only`)
- 선택 시 강조 색상 테두리 + 배경
- 호버 효과

---

## 애니메이션

### 떠다니는 이모지
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
}
```

적용: 상단 🔮 이모지

### 버튼 상호작용
- 호버: `hover:shadow-md` (그림자 증가)
- 클릭: `active:scale-[0.98]` (살짝 축소)
- 트랜지션: `transition-all`

---

## 반응형 디자인

### 브레이크포인트
- **Mobile**: 기본 (< 768px)
- **Desktop**: `md:` (≥ 768px)

### 적용 예시
```html
<!-- 모바일: 2열, 데스크탑: 4열 -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">

<!-- 모바일: text-4xl, 데스크탑: text-5xl -->
<h1 class="text-4xl md:text-5xl">
```

---

## 상태별 스타일

### 성공 메시지
```css
background: rgba(16, 185, 129, 0.1);
border: rgba(16, 185, 129, 0.5);
color: #059669;
```

### 에러 메시지
```css
background: rgba(239, 68, 68, 0.1);
border: rgba(239, 68, 68, 0.5);
color: #dc2626;
```

### 정보 메시지
```css
background: rgba(59, 130, 246, 0.1);
border: rgba(59, 130, 246, 0.5);
color: #2563eb;
```

---

## 접근성

- **색상 대비**: WCAG AA 기준 준수
- **포커스 표시**: 명확한 아웃라인 및 링 효과
- **의미 있는 HTML**: `<label>`, `<button>` 등 시맨틱 태그 사용
- **ARIA 속성**: `aria-label`, `aria-live` 등 활용

---

## 참고 자료

- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [saju-kid.com](https://saju-kid.com) (디자인 레퍼런스)
- [Pretendard 폰트](https://github.com/orioncactus/pretendard)

---

**Made with 💜 by RALPH Architecture**
