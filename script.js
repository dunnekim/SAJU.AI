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

// ------------------------------------------------------------------
// [V2.5] 우아한 독설 엔진 (Elegant Brutality) + 잘림 방지 [[ ]] 훅
// ------------------------------------------------------------------
const baseSystemHeader = `
ROLE: 당신은 내담자의 잠재력을 꿰뚫어 보지만, 그 잠재력을 썩히고 있는 현실을 참지 못하는 '완벽주의자 멘토'입니다.
GOAL: 내담자의 자존심을 세워주었다가(Praise), 논리적인 팩폭으로 부숴버려서(Crush), 결국 움직이게 만드십시오.
TONE:
- 격조 높고 정중한 "~입니다" 체를 사용하십시오.
- 저급한 비난이 아닌, 뼈아픈 통찰을 전달하십시오.
- **볼드체** 사용 금지. 넘버링(1. 2.) 금지.
- 섹션당 분량은 충분히 길게(3~4문단) 유지하십시오.

[CRITICAL RULE]:
답변의 맨 마지막 줄에 반드시 인스타그램 공유용 한 줄 요약을 대괄호 이중겹 [[ ]] 안에 작성하십시오.
이 문장은 40자 이내의 짧고 강렬한 '비수'여야 합니다.
예시: [[재능을 믿고 노력을 멈춘 순간, 당신의 추락은 시작되었습니다.]]
`;

const generalInstruction = `
${baseSystemHeader}

[출력 섹션 구성]
## 💎 당신이라는 원석의 가치
(사주의 장점을 찾아 극찬하십시오. 당신이 얼마나 큰 그릇을 가졌는지, 어떤 재능이 숨어있는지 구체적으로 명시하여 기분을 띄워주십시오.)

## 📉 재능을 썩히고 있는 치명적 모순
("그러나..."로 시작하여 분위기를 반전시키십시오. 그 좋은 재능을 가지고도 왜 지금 이 모양인지, 오행의 불균형과 나태함을 근거로 무자비하게 팩폭하십시오. 2배 강도.)

## 👁️ 이대로 5년이 흘렀을 때의 비극
(변화 없이 현재의 안일한 태도를 유지할 경우 맞이할 초라한 미래를 그림 그려지듯 서술하십시오.)

## 🗝️ 껍질을 깨기 위한 마지막 질문
(회피하고 있는 본질적인 질문을 던지십시오. 행동하지 않으면 아무것도 변하지 않음을 경고하십시오.)
`;

const compatibilityInstruction = `
${baseSystemHeader}

[출력 섹션 구성]
## 💎 두 우주가 만난 기적
(두 사람의 인연이 얼마나 특별하고 귀한지, 서로에게 어떤 긍정적 시너지를 줄 수 있는지 아름답게 묘사하십시오.)

## 💔 관계를 망치는 결정적 오만
("하지만..."으로 반전. 서로에 대한 착각, 이기심, 배려 없는 태도가 어떻게 관계를 좀먹고 있는지 적나라하게 지적하십시오.)

## ⚡ 파국의 시나리오
(이 문제를 방치했을 때 두 사람이 겪게 될 이별의 과정이나 쇼윈도 부부 같은 미래를 경고하십시오.)

## 🗝️ 사랑을 지키기 위한 현실적 대가
(관계를 유지하려면 각자 무엇을 포기하고 희생해야 하는지 냉정하게 계산서를 내미십시오.)
`;

const careerInstruction = `
${baseSystemHeader}
CAREER_STATUS 반영: 
- seeking(취준): 높은 눈높이와 낮은 실행력 비판
- burnout(현타): 배부른 투정과 자기연민 비판
- moving(탈주): 도피성 회피와 끈기 부족 비판

[출력 섹션 구성]
## 💎 시장이 탐내는 당신의 무기
(내담자가 가진 직무적 강점과 잠재력을 시장 가치 관점에서 높게 평가하십시오.)

## 📉 당신의 이력서가 휴지통으로 가는 이유
(그 좋은 무기를 가지고도 왜 성과가 없는지, 태도와 마인드셋의 결함을 면접관 시점으로 독설하십시오.)

## 👁️ 5년 후, 당신의 명함은 없다
(지금의 나태함이나 착각을 고치지 않으면 도태될 수밖에 없는 미래를 보여주십시오.)

## 🗝️ 성공을 위해 당장 버려야 할 것
(거창한 계획 말고, 당장 갖다 버려야 할 쓸데없는 습관이나 자존심을 지적하십시오.)
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
    const career = sajuJson?.birth_info?.career_status || "";
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
      `직업상태:${career || "-"}`,
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
      career_status: window.__sajuCareerStatus || "seeking",
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
  
  const jsonStr = JSON.stringify(sajuJson, null, 2);
  switch (mode) {
    case 'compatibility':
      systemInstruction = compatibilityInstruction;
      userPrompt = `두 사람의 사주 정보입니다:\n${jsonStr}`;
      break;
    case 'career':
      systemInstruction = careerInstruction;
      userPrompt = `내 사주와 직업 상태(${sajuJson.birth_info?.career_status || 'seeking'})입니다:\n${jsonStr}`;
      break;
    default:
      systemInstruction = generalInstruction;
      userPrompt = `내 사주 정보입니다:\n${jsonStr}`;
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 2500,
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
  }, 600);
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

// 인스타 스토리 공유 카드 — [[ ]] 훅 우선 (잘림 방지), 없으면 마지막 문장 폴백
function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

window.downloadInstaCard = async function () {
  const resultEl = document.getElementById('result');
  const sections = resultEl ? resultEl.querySelectorAll('.section-card') : [];
  if (!resultEl || sections.length === 0) {
    alert('분석 결과가 있어야 공유할 수 있습니다.');
    return;
  }

  let hookText = window.__sajuHookText || '';
  if (!hookText.trim()) {
    const lastSection = sections[sections.length - 1];
    const proseEl = lastSection ? lastSection.querySelector('.prose') : null;
    const fullText = proseEl ? proseEl.innerText : '';
    const sentences = fullText.split(/[.!?]\s/).filter(s => s.trim().length > 5);
    hookText = sentences.length > 0
      ? (sentences[sentences.length - 1].replace(/[.]$/, '') || '인생을 바꾸고 싶다면 고통을 마주하십시오.')
      : '당신의 잠재력은 게으름에 묻혔습니다.';
  }

  const captureDiv = document.createElement('div');
  captureDiv.style.cssText = `
    position: fixed; top: -9999px; left: -9999px; width: 1080px; height: 1920px;
    background: linear-gradient(180deg, #111111 0%, #2a2a2a 100%);
    color: white; padding: 120px 80px; box-sizing: border-box;
    font-family: 'Pretendard', sans-serif; display: flex; flex-direction: column; justify-content: space-between; text-align: center;
  `;
  captureDiv.innerHTML = `
    <div>
      <div style="font-size: 100px; margin-bottom: 20px;">🔮</div>
      <h1 style="font-size: 50px; font-weight: 800; color: #FF6B50; letter-spacing: 8px;">SAJU.AI</h1>
    </div>
    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
      <div style="border-left: 10px solid #FF6B50; padding-left: 60px; text-align: left;">
        <p style="font-size: 80px; line-height: 1.3; font-weight: 700; word-break: keep-all; color: #ffffff;">
          ${escapeHtml(hookText)}
        </p>
      </div>
    </div>
    <div style="border-top: 2px solid rgba(255,255,255,0.1); padding-top: 60px;">
      <p style="font-size: 36px; color: #888;">나를 꿰뚫어보는 AI 분석</p>
      <p style="font-size: 40px; font-weight: bold; margin-top: 20px; color: #FF6B50;">saju.ai</p>
    </div>
  `;
  document.body.appendChild(captureDiv);

  try {
    if (typeof html2canvas !== 'function') {
      alert('이미지 생성 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const canvas = await html2canvas(captureDiv, { scale: 1, useCORS: true });
    const link = document.createElement('a');
    link.download = `SAJU_CARD_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error(err);
    alert('이미지 저장 중 오류가 발생했습니다.');
  } finally {
    if (captureDiv.parentNode) captureDiv.parentNode.removeChild(captureDiv);
  }
};

function renderMarkdown(md) {
  if (!resultEl) return;

  const hookMatch = md.match(/\[\[([\s\S]*?)\]\]/);
  window.__sajuHookText = hookMatch ? hookMatch[1].trim() : null;
  const cleanMd = md.replace(/\[\[[\s\S]*?\]\]/g, '').trim();

  if (!window.marked || typeof window.marked.parse !== "function") {
    resultEl.textContent = cleanMd;
    return;
  }

  window.marked.setOptions({ mangle: false, headerIds: false });
  const sections = cleanMd.split(/\n(?=## )/g);
  resultEl.innerHTML = '';

  const factBombEmojis = ['☠️', '🤡', '📉', '💣', '🩸'];
  let cardIndex = 0;

  sections.forEach((section, index) => {
    const trimmed = section.trim();
    if (!trimmed || !trimmed.startsWith('##')) return;

    const lines = trimmed.split('\n');
    let titleLine = lines[0].replace(/^##\s*/, '').trim();
    // 제목 앞 숫자·넘버링 제거 (예: "1. 오행..." → "오행...")
    titleLine = titleLine.replace(/^\d+[.)]\s*/, '');
    const bodyLines = lines.slice(1).join('\n').trim();

    const card = document.createElement('div');
    card.className = 'section-card';

    const titleEl = document.createElement('h2');
    titleEl.className = cardIndex === 0
      ? 'text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2'
      : 'text-2xl font-bold text-gray-900 mt-12 mb-8 flex items-center gap-2';
    const emoji = factBombEmojis[index % factBombEmojis.length];
    titleEl.innerHTML = `<span class="text-2xl">${emoji}</span><span>${escapeHtml(titleLine)}</span>`;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'prose prose-stone leading-relaxed text-gray-700 mt-2';
    bodyEl.innerHTML = window.marked.parse(bodyLines);

    card.appendChild(titleEl);
    card.appendChild(bodyEl);
    resultEl.appendChild(card);
    cardIndex++;
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

function getCareerStatusValue() {
  const el = document.querySelector('input[name="careerStatus"]:checked');
  return el ? el.value : "seeking";
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

  // 페이지 로드 시 키 확인
  const existingKey = getApiKey();
  if (!existingKey) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
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
}

if (form) {
  // API Key 모달 초기화
  initApiKeyModal();

  // 탭 전환 로직
  const tabButtons = document.querySelectorAll('.tab-btn');
  const partnerSection = document.getElementById('partnerSection');
  const relationshipSection = document.getElementById('relationshipSection');
  const careerStatusSection = document.getElementById('careerStatusSection');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 모든 탭 비활성화 스타일 적용
      tabButtons.forEach(b => {
        // Inactive 스타일
        b.classList.remove('border-2', 'border-saju-accent', 'bg-orange-50', 'text-saju-accent', 'font-bold', 'shadow-sm');
        b.classList.add('border', 'border-gray-200', 'bg-white', 'text-gray-500', 'font-semibold');
        b.setAttribute('aria-selected', 'false');
      });
      
      // 선택된 탭 활성화 스타일 적용
      btn.classList.remove('border', 'border-gray-200', 'bg-white', 'text-gray-500', 'font-semibold');
      btn.classList.add('border-2', 'border-saju-accent', 'bg-orange-50', 'text-saju-accent', 'font-bold', 'shadow-sm');
      btn.setAttribute('aria-selected', 'true');
      
      // 현재 모드 업데이트
      currentMode = btn.dataset.mode;
      
      // 모드별 섹션 표시/숨김
      if (currentMode === 'compatibility') {
        // 궁합 분석: 연애 상태 + 상대방 정보 표시
        partnerSection.classList.remove('hidden');
        partnerSection.classList.add('space-y-6');
        relationshipSection.classList.remove('hidden');
        careerStatusSection.classList.add('hidden');
        // 상대방 입력 필드 required 설정
        document.getElementById('partnerBirthdate').required = true;
        document.getElementById('partnerBirthHour').required = true;
      } else if (currentMode === 'career') {
        // 커리어 분석: 직업 상태 표시
        partnerSection.classList.add('hidden');
        partnerSection.classList.remove('space-y-6');
        relationshipSection.classList.add('hidden');
        careerStatusSection.classList.remove('hidden');
        // 상대방 입력 필드 required 해제
        document.getElementById('partnerBirthdate').required = false;
        document.getElementById('partnerBirthHour').required = false;
      } else {
        // 종합 분석: 기본 입력만
        partnerSection.classList.add('hidden');
        partnerSection.classList.remove('space-y-6');
        relationshipSection.classList.add('hidden');
        careerStatusSection.classList.add('hidden');
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
      window.__sajuCareerStatus = getCareerStatusValue();

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
      
      // 결과 영역으로 부드럽게 스크롤 (로딩 오버레이 fade-out 후)
      setTimeout(() => {
        if (resultEl) {
          resultEl.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 600);
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

