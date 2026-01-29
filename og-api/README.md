# FATE.AI · Dynamic OG Image API

Next.js App Router + `next/og` 기반 동적 Open Graph 이미지 생성 API.  
공유 시 **MBTI × 사주 요소 × 다크 키워드**가 포함된 미리보기 이미지를 실시간 렌더링합니다.

## 배포 (Vercel)

1. 이 폴더를 Vercel에 배포하거나, 루트 모노레포로 `og-api`를 서브프로젝트로 설정합니다.
2. 배포 후 URL 예: `https://fate-ai-og.vercel.app/api/og`
3. 메인 사이트(`script.js`)의 `OG_IMAGE_BASE`를 위 URL로 설정합니다.

## API

**GET** `/api/og`

| 파라미터 | 설명 | 예시 |
|----------|------|------|
| `mbti` | MBTI 4글자 | INTJ |
| `element` | 사주 오행(영/한/일) | Fire, 火, 불 |
| `keyword` | 다크 한 줄 (최대 30자) | The Arrogant Strategist |
| `lang` | ko / en / jp | en |

**예시:**  
`/api/og?mbti=INTJ&element=Fire&keyword=The%20Arrogant%20Strategist&lang=en`

## 로컬 실행

```bash
cd og-api
npm install
npm run dev
```

이미지 확인: `http://localhost:3000/api/og?mbti=INTJ&element=Fire&keyword=Your%20Dark%20Truth&lang=en`
