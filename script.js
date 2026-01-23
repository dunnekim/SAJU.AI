import { Solar } from "lunar-javascript";

// URL 파라미터로 API Key 자동 등록
(function checkUrlKeyParam() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('key');
  
  if (key && key.trim()) {
    // localStorage에 저장
    localStorage.setItem('openai_api_key', key.trim());
    
    // URL에서 파라미터 제거 (보안)
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
    // 페이지 새로고침하여 저장된 키로 초기화
    location.reload();
  }
})();

// LocalStorage에서 API 키 관리
function getApiKey() {
  return localStorage.getItem('openai_api_key') || '';
}

function setApiKey(key) {
  localStorage.setItem('openai_api_key', key.trim());
}

function clearApiKey() {
  localStorage.removeItem('openai_api_key');
}

// 현재 선택된 모드 (global state)
let currentMode = 'general'; // 'general' | 'compatibility' | 'career'

// 종합 분석용 프롬프트 (기본)
const generalInstruction = `
Role: 당신은 당신의 사주(JSON)를 기반으로 인생의 해답을 제시하는 '프리미엄 명리 심리 상담가'입니다.
Goal: 단순한 정보 전달을 넘어, 당신이 "내 마음을 들켰다"고 느낄 정도의 깊은 통찰과 위로를 제공하세요.

[핵심 작성 원칙]
1. **분량:** 각 섹션마다 **최소 3~4개의 긴 문단(Paragraph)**을 작성하세요. 절대 짧게 끝내지 마세요.
2. **문체:** "했습니다"조가 아닌, 부드럽고 다정한 **"~네요", "~군요", "~수 있어요"**체를 사용하세요.
3. **은유:** 사주 용어(편관, 겁재 등)를 절대 쓰지 말고, 대신 "거친 파도", "단단한 바위", "타오르는 촛불" 같은 자연의 언어로 묘사하세요.
4. **구조:** 아래 10개의 섹션을 반드시 순서대로 모두 포함하세요.
5. **금지어:** "따라서", "그러므로", "결론적으로", "귀하", "당신" (대신 00님이나 주어 생략)
6. **가독성:** 한 문단은 2~3문장만. 문단 사이에 빈 줄 필수. 숨 쉬는 레이아웃.

[출력 섹션 구성 (Markdown)]

## 🌿 나의 본질과 타고난 그릇
(일간을 중심으로, 이 사람이 가진 근본적인 에너지와 태어날 때부터 부여받은 고유의 분위기를 200자 이상 서술. 3~4개 문단으로.)

## 🎭 겉모습 vs 실제 성격의 온도차
(남들이 보는 나의 모습과, 내가 혼자 있을 때 느끼는 실제 자아의 차이를 예리하게 포착하여 서술. 3~4개 문단.)

## 🌑 마음 한구석의 그림자
(사주에서 부족하거나 과한 오행으로 인해 생기는 내면의 결핍, 불안, 스트레스 포인트를 공감하며 서술. 3~4개 문단.)

## 💎 숨겨진 재능과 무기
(이 사람이 사회에서 성공하기 위해 본능적으로 사용하는 강점과 잠재력을 구체적으로 묘사. 3~4개 문단.)

## 💼 일과 성취: 나를 증명하는 방식
(단순 직업 추천이 아니라, 일하는 스타일, 리더형인지 참모형인지, 성취감을 느끼는 포인트를 분석. 3~4개 문단.)

## 💰 재물을 다루는 나의 태도
(돈을 버는 능력뿐만 아니라, 돈을 쓸 때의 심리, 재물을 모으는 과정에서의 장단점을 조언. 3~4개 문단.)

## 💗 사랑의 방식과 연애관
(사랑에 빠졌을 때의 모습, 상대에게 바라는 점, 반복되는 연애 패턴 등을 감성적으로 터치. 3~4개 문단.)

## 💍 결혼과 깊은 인연에 대하여
(결혼 생활에서 중요하게 여기는 가치, 배우자와의 관계성, 안정을 찾는 방식을 서술. 3~4개 문단.)

## 🌵 스트레스 관리와 마음 챙김
(이 사람에게 가장 취약한 건강/멘탈 포인트와, 이를 회복하기 위한 구체적인 휴식 방법 제안. 3~4개 문단.)

## 💌 당신을 위한 행운의 처방전
(지금 이 순간 가장 필요한 마인드셋, 행운의 컬러/아이템/장소, 그리고 따뜻한 응원의 메시지로 마무리. 3~4개 문단.)

[CRITICAL: 각 문단 작성 시 지켜야 할 것]
- 첫 문장: 강렬하고 공감 가는 핵심 문장 (예: "사람들은 당신을 보며 강해 보인다고 말하곤 하죠.")
- 두 번째 문장: 그 이유나 배경을 설명
- 세 번째 문장(선택): 구체적인 예시나 느낌 추가

[절대 금지 사항]
- 2줄 이하 문단 (너무 짧음)
- "~합니다/습니다" (딱딱함)
- 사주 용어 노출 (비전문가가 못 알아듣음)
- 섹션 누락 (반드시 10개 모두)
`;

// 궁합 분석용 프롬프트
const compatibilityInstruction = `
Role: 당신은 두 사람의 영혼의 공명을 읽어주는 '관계 심리 상담가'입니다.
Goal: 좋다/나쁘다의 이분법적 판단이 아니라, 두 사람이 서로에게 미치는 영향과 소통 방식을 에세이처럼 풀어주세요.

[핵심 작성 원칙]
1. **분량:** 각 섹션마다 **최소 3~4개의 긴 문단(Paragraph)**을 작성하세요. 절대 짧게 끝내지 마세요.
2. **문체:** 부드럽고 다정한 **"~네요", "~군요", "~수 있어요"**체를 사용하세요.
3. **은유:** 사주 용어를 절대 쓰지 말고, 자연의 언어로 묘사하세요.
4. **초점:** 두 사람의 상호작용, 케미, 소통 방식에 집중하세요.
5. **금지어:** "따라서", "그러므로", "결론적으로", "귀하" 
6. **가독성:** 한 문단은 2~3문장만. 문단 사이에 빈 줄 필수.

[출력 섹션 구성 (Markdown)]

## 🧩 관계의 첫인상과 케미
(두 기운이 만났을 때의 분위기, 서로에게 처음 느끼는 매력을 서술. 3~4개 문단.)

## 💖 서로가 사랑을 표현하는 방식
(감정의 언어 차이, 애정 표현 방식의 차이를 이해하며 서술. 3~4개 문단.)

## ⚡ 갈등이 생길 수 있는 포인트
(오해의 소지, 서로 다른 가치관이 충돌할 수 있는 부분을 부드럽게 경고. 3~4개 문단.)

## 🗝️ 관계를 더 깊게 만드는 열쇠
(서로를 이해하기 위한 조언, 관계 성장을 위한 힌트. 3~4개 문단.)

## 💌 두 사람을 위한 축복의 메시지
(따뜻한 응원과 희망의 메시지로 마무리. 3~4개 문단.)

[CRITICAL]
- 두 사람의 JSON 데이터를 비교하며 상호작용을 분석하세요
- "당신"과 "그분"으로 구분하여 서술하세요
- 2줄 이하 문단 금지
- 사주 용어 노출 금지
- 섹션 누락 금지 (반드시 5개 모두)
`;

// 이직·커리어 분석용 프롬프트
const careerInstruction = `
Role: 당신은 당신의 잠재력과 시기를 읽어주는 '커리어 전략가'입니다.
Goal: 단순한 적성 검사를 넘어, 당신이 일에서 성취감을 느끼는 포인트와 현재의 직업적 고민을 어루만져 주세요.

[핵심 작성 원칙]
1. **분량:** 각 섹션마다 **최소 3~4개의 긴 문단(Paragraph)**을 작성하세요. 절대 짧게 끝내지 마세요.
2. **문체:** 부드럽고 다정한 **"~네요", "~군요", "~수 있어요"**체를 사용하세요.
3. **은유:** 사주 용어를 절대 쓰지 말고, 자연의 언어로 묘사하세요.
4. **초점:** 직업적 잠재력, 조직 적합도, 변화의 타이밍에 집중하세요.
5. **금지어:** "따라서", "그러므로", "결론적으로", "귀하"
6. **가독성:** 한 문단은 2~3문장만. 문단 사이에 빈 줄 필수.

[출력 섹션 구성 (Markdown)]

## 💎 숨겨진 직업적 DNA
(타고난 일머리와 재능, 당신이 빛나는 순간을 서술. 3~4개 문단.)

## 🏹 나에게 맞는 조직 문화
(리더형 vs 참모형 vs 프리랜서, 어떤 환경에서 성장하는지 분석. 3~4개 문단.)

## 🌪️ 이직을 고민하는 이유
(현재 심리 상태, 직업적 갈등, 불만족의 본질을 공감하며 분석. 3~4개 문단.)

## 🌊 변화의 바람과 타이밍
(지금 움직여도 좋을지, 기다려야 할지 조언. 단, 미래 예언은 금지. 3~4개 문단.)

## 🚀 당신의 도약을 위한 한 마디
(용기와 희망을 주는 메시지로 마무리. 3~4개 문단.)

[CRITICAL]
- 2줄 이하 문단 금지
- "~합니다/습니다" 금지
- 사주 용어 노출 금지
- 섹션 누락 금지 (반드시 5개 모두)
`;

function summarizeCounts(counts) {
  const entries = Object.entries(counts || {}).filter(([, v]) => Number.isFinite(v));
  if (!entries.length) return { strongest: null, weakest: null, text: "" };
  entries.sort((a, b) => b[1] - a[1]);
  const strongest = entries[0][0];
  const weakest = entries[entries.length - 1][0];
  const text = entries.map(([k, v]) => `${k}:${v}`).join(", ");
  return { strongest, weakest, text };
}

// 결정론적 요약(출력에는 노출하지 않음): 모델이 빠르게 '결'을 잡게 하는 힌트
function buildDeterministicHint(sajuJson) {
  try {
    const fp = sajuJson?.four_pillars || {};
    const fe = sajuJson?.five_elements_count || {};
    const dm = sajuJson?.day_master || "";
    const rel = sajuJson?.birth_info?.relationship_status || "";
    const { strongest, weakest, text } = summarizeCounts(fe);

    const pillarsLine = [
      fp?.year ? `연주:${fp.year.gan}${fp.year.ji}` : null,
      fp?.month ? `월주:${fp.month.gan}${fp.month.ji}` : null,
      fp?.day ? `일주:${fp.day.gan}${fp.day.ji}` : null,
      fp?.hour ? `시주:${fp.hour.gan}${fp.hour.ji}` : null,
    ]
      .filter(Boolean)
      .join(" / ");

    return [
      `일간:${dm || "-"}`,
      `사주:${pillarsLine || "-"}`,
      `오행:${text || "-"}`,
      `강한기운:${strongest || "-"} / 약한기운:${weakest || "-"}`,
      `관계상태:${rel || "-"}`,
    ].join("\n");
  } catch {
    return "";
  }
}

// env.json 관련 코드 제거됨 (GitHub Pages 배포용)

// Deterministic mappings (do NOT infer)
const GAN_TO_ELEMENT = Object.freeze({
  "甲": "wood",
  "乙": "wood",
  "丙": "fire",
  "丁": "fire",
  "戊": "earth",
  "己": "earth",
  "庚": "metal",
  "辛": "metal",
  "壬": "water",
  "癸": "water",
});

const JI_TO_ELEMENT = Object.freeze({
  "子": "water",
  "丑": "earth",
  "寅": "wood",
  "卯": "wood",
  "辰": "earth",
  "巳": "fire",
  "午": "fire",
  "未": "earth",
  "申": "metal",
  "酉": "metal",
  "戌": "earth",
  "亥": "water",
});

function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeInt(v, name) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`${name} 값이 올바르지 않습니다.`);
  }
  return n;
}

function initElementsCount() {
  return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
}

function splitGanzhi(gz, label) {
  const s = String(gz || "");
  if (s.length < 2) {
    throw new Error(`${label} 간지 값을 추출할 수 없습니다.`);
  }
  return { gan: s.charAt(0), ji: s.charAt(1) };
}

function safeCall(obj, methodName) {
  const fn = obj && obj[methodName];
  return typeof fn === "function" ? fn.call(obj) : undefined;
}

function extractPillar(lunar, kind) {
  // Prefer explicit Gan/Zhi getters; fallback to *InGanZhi if needed.
  if (kind === "year") {
    const gan = safeCall(lunar, "getYearGan");
    const ji = safeCall(lunar, "getYearZhi");
    if (gan && ji) return { gan, ji };
    const gz =
      safeCall(lunar, "getYearInGanZhiExact") ??
      safeCall(lunar, "getYearInGanZhi") ??
      "";
    return splitGanzhi(gz, "연주");
  }
  if (kind === "month") {
    const gan = safeCall(lunar, "getMonthGan");
    const ji = safeCall(lunar, "getMonthZhi");
    if (gan && ji) return { gan, ji };
    const gz =
      safeCall(lunar, "getMonthInGanZhiExact") ??
      safeCall(lunar, "getMonthInGanZhi") ??
      "";
    return splitGanzhi(gz, "월주");
  }
  if (kind === "day") {
    const gan = safeCall(lunar, "getDayGan");
    const ji = safeCall(lunar, "getDayZhi");
    if (gan && ji) return { gan, ji };
    const gz =
      safeCall(lunar, "getDayInGanZhiExact") ??
      safeCall(lunar, "getDayInGanZhi") ??
      "";
    return splitGanzhi(gz, "일주");
  }
  if (kind === "hour") {
    const gan = safeCall(lunar, "getTimeGan");
    const ji = safeCall(lunar, "getTimeZhi");
    if (gan && ji) return { gan, ji };
    const gz =
      safeCall(lunar, "getTimeInGanZhiExact") ??
      safeCall(lunar, "getTimeInGanZhi") ??
      "";
    return splitGanzhi(gz, "시주");
  }
  throw new Error("알 수 없는 주(kind)입니다.");
}

function addElementCount(counts, elementKey) {
  if (!elementKey) return;
  if (Object.prototype.hasOwnProperty.call(counts, elementKey)) {
    counts[elementKey] += 1;
  }
}

function countFiveElementsFromPillars(fourPillars) {
  const counts = initElementsCount();
  const keys = ["year", "month", "day", "hour"];
  for (const k of keys) {
    const p = fourPillars[k];
    if (!p) continue;
    addElementCount(counts, GAN_TO_ELEMENT[p.gan]);
    addElementCount(counts, JI_TO_ELEMENT[p.ji]);
  }
  return counts;
}

// Step 2. RALPH 엔진 (결정론적 계산)
// 함수명: calculateSaju(year, month, day, hour, minute)
export function calculateSaju(year, month, day, hour, minute) {
  const y = normalizeInt(year, "연(YYYY)");
  const m = normalizeInt(month, "월(MM)");
  const d = normalizeInt(day, "일(DD)");
  const hh = normalizeInt(hour, "시(HH)");
  const mm = normalizeInt(minute, "분(mm)");

  if (m < 1 || m > 12) throw new Error("월(MM)은 1~12 범위여야 합니다.");
  if (d < 1 || d > 31) throw new Error("일(DD)은 1~31 범위여야 합니다.");
  if (hh < 0 || hh > 23) throw new Error("시(HH)은 0~23 범위여야 합니다.");
  if (mm < 0 || mm > 59) throw new Error("분(mm)은 0~59 범위여야 합니다.");

  // solar -> lunar (Eight Characters)
  const solar = Solar.fromYmdHms(y, m, d, hh, mm, 0);
  const lunar = solar.getLunar();

  const four_pillars = {
    year: extractPillar(lunar, "year"),
    month: extractPillar(lunar, "month"),
    day: extractPillar(lunar, "day"),
    hour: extractPillar(lunar, "hour"),
  };

  const five_elements_count = countFiveElementsFromPillars(four_pillars);

  return {
    birth_info: {
      solar: `${y}-${pad2(m)}-${pad2(d)} ${pad2(hh)}:${pad2(mm)}`,
      gender: window.__sajuGender || "",
      relationship_status: window.__sajuRelationship || "single",
    },
    four_pillars,
    five_elements_count,
    day_master: four_pillars.day.gan,
  };
}

// Step 3. 해석 레이어
export async function analyzeSaju({ sajuJson, mode = 'general' }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("인증 키가 설정되지 않았습니다. 페이지를 새로고침하여 키를 입력하세요.");
  }

  // 모드별 프롬프트 선택
  let systemInstruction;
  let userPrompt;
  
  switch (mode) {
    case 'compatibility':
      systemInstruction = compatibilityInstruction;
      userPrompt = [
        "아래는 두 사람의 사주 데이터입니다.",
        "",
        "**당신의 정보:**",
        "```json",
        JSON.stringify(sajuJson.me, null, 2),
        "```",
        "",
        "**상대방의 정보:**",
        "```json",
        JSON.stringify(sajuJson.partner, null, 2),
        "```",
        "",
        "위 데이터를 기반으로 두 사람의 관계 분석을 작성해주세요.",
        "",
        "**필수 요구사항:**",
        "1. 5개 섹션을 모두 작성하세요 (섹션 제목은 이모지 포함 Markdown H2로)",
        "2. 각 섹션마다 최소 3~4개의 문단을 작성하세요",
        "3. 한 문단은 2~3문장으로 구성하고, 문단 사이에 빈 줄을 넣으세요",
        "4. '~네요', '~군요', '~수 있어요' 같은 부드러운 상담 톤을 사용하세요",
        "5. 두 사람의 상호작용과 케미를 중심으로 서술하세요",
        "",
        "데이터는 절대 재계산하지 말고, 주어진 정보만 해석해주세요.",
      ].join("\n");
      break;
      
    case 'career':
      systemInstruction = careerInstruction;
      userPrompt = [
        "아래는 당신의 사주 데이터입니다.",
        "",
        "```json",
        JSON.stringify(sajuJson, null, 2),
        "```",
        "",
        "위 데이터를 기반으로 커리어 전략 분석을 작성해주세요.",
        "",
        "**필수 요구사항:**",
        "1. 5개 섹션을 모두 작성하세요 (섹션 제목은 이모지 포함 Markdown H2로)",
        "2. 각 섹션마다 최소 3~4개의 문단을 작성하세요",
        "3. 한 문단은 2~3문장으로 구성하고, 문단 사이에 빈 줄을 넣으세요",
        "4. '~네요', '~군요', '~수 있어요' 같은 부드러운 상담 톤을 사용하세요",
        "5. 직업적 잠재력과 커리어 방향성에 집중하세요",
        "",
        "데이터는 절대 재계산하지 말고, 주어진 정보만 해석해주세요.",
      ].join("\n");
      break;
      
    default: // 'general'
      systemInstruction = generalInstruction;
      userPrompt = [
        "아래는 당신의 사주 데이터입니다.",
        "",
        "```json",
        JSON.stringify(sajuJson, null, 2),
        "```",
        "",
        "위 데이터를 기반으로 깊이 있는 인생 상담을 작성해주세요.",
        "",
        "**필수 요구사항:**",
        "1. 10개 섹션을 모두 작성하세요 (섹션 제목은 이모지 포함 Markdown H2로, 숫자 넘버링 없이)",
        "2. 각 섹션마다 최소 3~4개의 문단을 작성하세요",
        "3. 한 문단은 2~3문장으로 구성하고, 문단 사이에 빈 줄을 넣으세요",
        "4. '~네요', '~군요', '~수 있어요' 같은 부드러운 상담 톤을 사용하세요",
        "5. 총 분량은 일반 사주풀이의 최소 2배 이상으로 길게 작성하세요",
        "",
        "데이터는 절대 재계산하지 말고, 주어진 정보만 해석해주세요.",
      ].join("\n");
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`분석 서버 오류: HTTP ${resp.status}. 인증 키를 확인해주세요.`);
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("분석 결과가 비어 있습니다.");
  return text;
}

// ---------- UI wiring ----------
const form = document.getElementById("sajuForm");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

// 로딩 프로그레스 관리
let progressInterval = null;
let currentProgress = 0;

function showLoadingOverlay() {
  if (!loadingOverlay) return;
  currentProgress = 0;
  updateProgress(0);
  loadingOverlay.classList.remove('hidden');
  loadingOverlay.classList.add('flex');
  
  // Fake progress: 0% -> 90%까지 불규칙하게 증가 (3배 느린 속도)
  progressInterval = setInterval(() => {
    if (currentProgress < 90) {
      // 불규칙한 증가 (1~5% 랜덤)
      const increment = Math.random() * 4 + 1;
      currentProgress = Math.min(90, currentProgress + increment);
      updateProgress(Math.floor(currentProgress));
    }
  }, 450);
}

function completeLoadingOverlay() {
  if (!loadingOverlay) return;
  
  // interval 정리
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  
  // 즉시 100%로
  updateProgress(100);
  
  // 0.5초 후 페이드아웃
  setTimeout(() => {
    loadingOverlay.classList.add('animate-fade-out');
    setTimeout(() => {
      loadingOverlay.classList.remove('flex', 'animate-fade-out');
      loadingOverlay.classList.add('hidden');
    }, 500);
  }, 500);
}

function updateProgress(percent) {
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
  if (progressText) {
    progressText.textContent = `${percent}%`;
  }
}

function setStatus(message, kind = "info") {
  if (!statusEl) return;
  statusEl.className = "block px-6 py-4 rounded-xl border-2 transition-all mb-6";
  
  if (kind === "error") {
    statusEl.classList.add("error", "bg-red-50", "border-red-200", "text-red-600");
  } else if (kind === "ok") {
    statusEl.classList.add("ok", "bg-emerald-50", "border-emerald-200", "text-emerald-600");
  } else {
    statusEl.classList.add("bg-blue-50", "border-blue-200", "text-blue-600");
  }
  
  statusEl.textContent = message;
}

function clearStatus() {
  if (!statusEl) return;
  statusEl.className = "hidden mb-6 px-6 py-4 rounded-xl border-2 transition-all";
  statusEl.textContent = "";
}

function renderMarkdown(md) {
  if (!resultEl) return;
  
  if (!window.marked || typeof window.marked.parse !== "function") {
    resultEl.textContent = md;
    return;
  }

  // 문자열 파싱 방식으로 섹션 분할
  window.marked.setOptions({ mangle: false, headerIds: false });
  
  // ## 기준으로 split (줄바꿈 포함)
  const sections = md.split(/\n(?=## )/g);
  
  // 결과 영역 초기화
  resultEl.innerHTML = '';
  
  let cardIndex = 0; // 실제 렌더링된 카드 수 추적
  
  sections.forEach((section, index) => {
    const trimmed = section.trim();
    if (!trimmed || !trimmed.startsWith('##')) {
      // 서론이거나 빈 섹션은 스킵
      return;
    }
    
    // 제목과 본문 분리
    const lines = trimmed.split('\n');
    const titleLine = lines[0].replace(/^##\s*/, ''); // ## 제거
    const bodyLines = lines.slice(1).join('\n').trim();
    
    // 카드 생성
    const card = document.createElement('div');
    card.className = 'section-card';
    
    // 제목 생성 (Tailwind 클래스 직접 적용) - 첫 카드는 mt-0, 나머지는 mt-12
    const titleEl = document.createElement('h2');
    titleEl.className = cardIndex === 0 
      ? 'text-2xl font-bold text-gray-900 mb-4'
      : 'text-2xl font-bold text-gray-900 mt-12 mb-4';
    titleEl.textContent = titleLine;
    
    cardIndex++;
    
    // 본문 생성 (Markdown 파싱)
    const bodyEl = document.createElement('div');
    bodyEl.className = 'prose prose-stone leading-relaxed text-gray-700';
    bodyEl.innerHTML = window.marked.parse(bodyLines);
    
    card.appendChild(titleEl);
    card.appendChild(bodyEl);
    resultEl.appendChild(card);
  });
}

function getGenderValue() {
  const el = document.querySelector('input[name="gender"]:checked');
  return el ? el.value : "";
}

function getRelationshipValue() {
  const el = document.querySelector('input[name="relationship"]:checked');
  return el ? el.value : "single";
}

function getTimeParts(timeStr) {
  // "HH:mm"
  const [hh, mm] = String(timeStr || "").split(":");
  return { hour: Number(hh), minute: Number(mm) };
}

function parseTimeRange(rangeStr) {
  // "07-09" 같은 시간대 문자열을 파싱
  if (!rangeStr) return { hour: 12, minute: 0 }; // 기본값
  const [start] = rangeStr.split("-");
  return { hour: parseInt(start, 10), minute: 0 };
}

function parseBirthdate(yymmdd) {
  // YYMMDD 6자리 파싱
  const s = String(yymmdd || "").trim();
  if (s.length !== 6 || !/^\d{6}$/.test(s)) {
    throw new Error("생년월일은 6자리 숫자로 입력해주세요 (예: 930320)");
  }
  
  const yy = parseInt(s.substring(0, 2), 10);
  const mm = parseInt(s.substring(2, 4), 10);
  const dd = parseInt(s.substring(4, 6), 10);
  
  // 연도 추론: 50 이상이면 19xx, 49 이하이면 20xx
  const yyyy = yy >= 50 ? 1900 + yy : 2000 + yy;
  
  return { year: yyyy, month: mm, day: dd };
}

// API Key 모달 관리
function initApiKeyModal() {
  const modal = document.getElementById('apiKeyModal');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const changeKeyBtn = document.getElementById('changeKeyBtn');

  // 페이지 로드 시 키 확인
  const existingKey = getApiKey();
  if (!existingKey) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (changeKeyBtn) {
      changeKeyBtn.classList.remove('hidden');
    }
  }

  // 키 저장
  if (saveKeyBtn) {
    saveKeyBtn.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        alert('인증 키를 입력해주세요.');
        return;
      }
      if (!key.startsWith('sk-')) {
        alert('올바른 키 형식이 아닙니다. (sk-로 시작해야 합니다)');
        return;
      }
      setApiKey(key);
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (changeKeyBtn) {
        changeKeyBtn.classList.remove('hidden');
      }
      apiKeyInput.value = '';
      location.reload(); // 페이지 새로고침
    });
  }

  // Enter 키로도 저장 가능
  if (apiKeyInput) {
    apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveKeyBtn.click();
      }
    });
  }

  // 키 변경 버튼
  if (changeKeyBtn) {
    changeKeyBtn.addEventListener('click', () => {
      clearApiKey();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      changeKeyBtn.classList.add('hidden');
    });
  }
}

if (form) {
  // API Key 모달 초기화
  initApiKeyModal();

  // 탭 전환 로직
  const tabButtons = document.querySelectorAll('.tab-btn');
  const partnerSection = document.getElementById('partnerSection');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 모든 탭 비활성화
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      
      // 선택된 탭 활성화
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      
      // 현재 모드 업데이트
      currentMode = btn.dataset.mode;
      
      // 궁합 분석 모드일 때만 상대방 섹션 표시
      if (currentMode === 'compatibility') {
        partnerSection.classList.remove('hidden');
        partnerSection.classList.add('space-y-6');
        // 상대방 입력 필드 required 설정
        document.getElementById('partnerBirthdate').required = true;
        document.getElementById('partnerBirthHour').required = true;
      } else {
        partnerSection.classList.add('hidden');
        partnerSection.classList.remove('space-y-6');
        // 상대방 입력 필드 required 해제
        document.getElementById('partnerBirthdate').required = false;
        document.getElementById('partnerBirthHour').required = false;
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();
    analyzeBtn.disabled = true;

    try {
      const birthdateInput = document.getElementById("birthdate").value;
      const { year, month, day } = parseBirthdate(birthdateInput);
      
      const birthHourRange = document.getElementById("birthHour").value;
      const { hour, minute } = parseTimeRange(birthHourRange);
      
      window.__sajuGender = getGenderValue();
      window.__sajuRelationship = getRelationshipValue();

      let sajuData;
      
      // 궁합 모드일 때는 두 개의 사주 계산
      if (currentMode === 'compatibility') {
        const partnerBirthdateInput = document.getElementById("partnerBirthdate").value;
        const partnerBirthdate = parseBirthdate(partnerBirthdateInput);
        
        const partnerBirthHourRange = document.getElementById("partnerBirthHour").value;
        const partnerTime = parseTimeRange(partnerBirthHourRange);
        
        // 상대방 성별 가져오기
        const partnerGenderEl = document.querySelector('input[name="partnerGender"]:checked');
        const partnerGender = partnerGenderEl ? partnerGenderEl.value : "male";
        
        // 나의 사주
        const mySaju = calculateSaju(year, month, day, hour, minute);
        
        // 상대방 사주
        window.__sajuGender = partnerGender;
        const partnerSaju = calculateSaju(
          partnerBirthdate.year, 
          partnerBirthdate.month, 
          partnerBirthdate.day, 
          partnerTime.hour, 
          partnerTime.minute
        );
        
        sajuData = {
          me: mySaju,
          partner: partnerSaju
        };
      } else {
        // 종합 분석 or 커리어 분석
        sajuData = calculateSaju(year, month, day, hour, minute);
      }

      // 로딩 오버레이 표시
      showLoadingOverlay();
      
      // API 호출 (모드 전달)
      const md = await analyzeSaju({ sajuJson: sajuData, mode: currentMode });
      
      // 로딩 완료
      completeLoadingOverlay();
      
      // 결과 렌더링
      setStatus("분석 완료. 아래 결과를 확인하세요.", "ok");
      renderMarkdown(md);
    } catch (err) {
      // 에러 시 로딩 즉시 종료
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (loadingOverlay) {
        loadingOverlay.classList.remove('flex');
        loadingOverlay.classList.add('hidden');
      }
      
      setStatus(err?.message || "오류가 발생했습니다.", "error");
      renderMarkdown(
        [
          "## 오류",
          "",
          "입력값을 확인해 주세요.",
          "",
          "```",
          String(err?.stack || err?.message || err),
          "```",
        ].join("\n")
      );
    } finally {
      analyzeBtn.disabled = false;
    }
  });
}

