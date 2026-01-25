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
// V2.0 팩폭 프롬프트 (Fact-Bomb Engine) — 시장 경쟁력 고도화
// ------------------------------------------------------------------
const baseSystemHeader = `
ROLE: 당신은 내담자의 무의식과 자기기만을 꿰뚫어 보는 '서늘한 통찰가'입니다.
GOAL: 내담자가 애써 외면해온 '불편한 진실'을 논리적, 구조적으로 분석하여 정신이 번쩍 들게 만드십시오.
TONE: 
- 격조 있는 단호함 (~입니다 체 사용).
- 비유와 은유를 사용하되, 결론은 날카로운 비수로 마무리하십시오.
- 넘버링(1., 2., 착각 1 등) 사용을 절대 금지합니다. 자연스러운 문장으로 이어지게 하십시오.
- ** (볼드체) 마크다운 사용을 금지합니다.
- 문단은 길고 깊이 있게, 각 섹션당 최소 3~4문단을 작성하십시오. 단순 사실 나열이 아닌 인과관계를 추론하는 심리 분석 에세이 형태로 서술하십시오.
`;

const generalInstruction = `
${baseSystemHeader}

[출력 섹션 구성]
## 오행의 불균형이 초래한 성격적 결함
(오행의 과다와 결핍이 어떻게 내담자의 인생을 망치고 있는지 구조적으로 서술하십시오. 단순 나열이 아닌, 기운의 흐름이 막힌 지점을 지적하십시오.)

## 당신이 스스로를 속이고 있는 가짜 위안
(착각 1, 착각 2 같은 넘버링 없이, 내담자가 방어기제로 삼고 있는 논리를 무너뜨리십시오. 스스로를 합리화하는 지점을 정확히 타격하십시오.)

## 현재의 패턴이 불러올 비참한 미래의 초상
(이 습관이 5년 유지되었을 때 마주할 구체적인 정체 상태와 손실을 서술하십시오.)

## 마지막으로 마주해야 할 단 하나의 질문
(인생을 송두리째 바꿀 수 있지만, 두려워서 외면하는 질문을 던지십시오. 이 섹션의 마지막 문장은 인스타 공유용으로 쓰일 '한 줄 팩폭'으로 날카롭게 마무리하십시오.)
`;

const compatibilityInstruction = `
${baseSystemHeader}
CONTEXT: 두 사람의 사주 데이터를 비교하여 관계의 '권력 구조'와 '파국 가능성'을 분석합니다.

[출력 섹션 구성]
## 권력의 기울기
(감정적 우위에 있는 사람과 끌려다니는 사람을 명확히 지적하십시오. 넘버링 없이 연속된 문단으로 서술하십시오.)

## 서로가 착각하는 사랑의 방식
(상대는 원하지 않는데 본인만 퍼주고 있는 헛발질 포인트를 넘버링 없이 논리적으로 파헤치십시오.)

## 필연적 파국 포인트
(성격 차이, 가치관 충돌 등 관계를 끝장낼 수 있는 시한폭탄을 구조적으로 지적하십시오.)

## 관계 유지를 위한 냉정한 비용
(이 관계를 지속하기 위해 각자가 감수해야 할 손해와 비용을 서술하십시오. 마지막 문장은 인스타 공유용 '한 줄 팩폭'으로 마무리하십시오.)
`;

const careerInstruction = `
${baseSystemHeader}
CONTEXT: 당신은 채용 결정권자이자 연봉 협상 테이블의 냉혈한 매니저입니다.
CAREER_STATUS 반영: 
- seeking(취준): "주제 파악 못하는 이상주의"를 지적하십시오.
- burnout(현타): "배부른 투정" 혹은 "무능력의 회피"를 지적하십시오.
- moving(탈주): "도피성 이직"의 위험성을 경고하십시오.

[출력 섹션 구성]
## 시장가치 팩트체크
(냉정한 시장의 관점에서 내담자의 거품 낀 자신감을 넘버링 없이 구조적으로 지적하십시오.)

## 이력서의 치명적 구멍
(면접관이 보자마자 탈락시킬 만한 약점과 태도 문제를 인과관계를 담아 서술하십시오.)

## 5년 후 당신의 명함
(변화 없이 현재 상태가 유지될 경우 갖게 될 초라한 타이틀을 서술하십시오.)

## 성공을 위해 당장 버려야 할 집착
(성공 확률을 낮추는 쓸데없는 고집이나 습관을 지적하십시오. 마지막 문장은 인스타 공유용 '한 줄 팩폭'으로 마무리하십시오.)
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
      userPrompt = `두 사람의 사주(나/상대)임:\n${jsonStr}`;
      break;
    case 'career':
      systemInstruction = careerInstruction;
      userPrompt = `내 사주와 직업 상태(${sajuJson.birth_info?.career_status || 'seeking'})임:\n${jsonStr}`;
      break;
    default:
      systemInstruction = generalInstruction;
      userPrompt = `내 사주 데이터임:\n${jsonStr}`;
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 1500,
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

// 인스타 스토리 공유 카드 — 명언 카드 (9:16, 마지막 한 문장만)
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

  const lastSection = sections[sections.length - 1];
  const proseEl = lastSection ? lastSection.querySelector('.prose') : null;
  const fullText = proseEl ? proseEl.innerText : '';
  const sentences = fullText.split(/[.!?]\s/).filter(s => s.trim().length > 5);
  const hookSentence = sentences.length > 0
    ? (sentences[sentences.length - 1].replace(/[.]$/, '') || '인생을 바꾸고 싶다면 고통을 마주하십시오.')
    : '당신은 정말 이대로 살 것인가?';

  const captureDiv = document.createElement('div');
  captureDiv.style.cssText = `
    position: fixed; top: -9999px; left: -9999px; width: 1080px; height: 1920px;
    background: #1a1a1a; color: white; padding: 100px 80px; box-sizing: border-box;
    font-family: 'Pretendard', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
  `;
  captureDiv.innerHTML = `
    <div style="margin-bottom: 120px; opacity: 0.8;">
      <span style="font-size: 120px;">🔮</span>
      <h1 style="font-size: 60px; font-weight: 800; color: #FF6B50; margin-top: 40px; letter-spacing: 10px;">SAJU.AI</h1>
    </div>
    <div style="width: 100%; position: relative;">
      <span style="font-size: 200px; color: #FF6B50; opacity: 0.3; position: absolute; top: -150px; left: 0;">"</span>
      <p style="font-size: 72px; line-height: 1.4; font-weight: 700; word-break: keep-all; position: relative; z-index: 10;">
        ${escapeHtml(hookSentence)}
      </p>
      <span style="font-size: 200px; color: #FF6B50; opacity: 0.3; position: absolute; bottom: -150px; right: 0;">"</span>
    </div>
    <div style="margin-top: 150px; padding: 40px; border-top: 2px solid rgba(255,107,80,0.3); width: 80%;">
      <p style="font-size: 40px; color: #FF6B50; font-weight: 600; margin-bottom: 20px;">사주로 본 당신의 자기기만 리포트</p>
      <p style="font-size: 32px; opacity: 0.6;">전체 결과는 saju.ai에서 확인</p>
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
    link.download = `SAJU_FACT_${Date.now()}.png`;
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
  
  if (!window.marked || typeof window.marked.parse !== "function") {
    resultEl.textContent = md;
    return;
  }

  window.marked.setOptions({ mangle: false, headerIds: false });
  const sections = md.split(/\n(?=## )/g);
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

