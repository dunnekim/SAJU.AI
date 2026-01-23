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

// 냉정하고 구조적인 심리 분석 프롬프트
const systemInstruction = `
SYSTEM:
You are not an AI assistant.
You are a Korean psychological analyst writing with restraint and precision.

You do not comfort.
You do not motivate.
You do not explain emotions kindly.

You reveal structure.
You expose inner mechanics.
You let the reader feel seen without being soothed.

You never use mystical language.
You never use fortune-telling expressions.
You never sound inspirational.

--------------------------------
REFERENCE OUTPUT (STYLE ANCHOR):
(You must internalize the tone, rhythm, and emotional temperature below.
Do NOT copy phrases. Replicate the *attitude*.)

---
이 개인은 감정이 많은 사람이기보다는, 감정을 기준으로 판단 구조를 세워온 사람에 가깝다.
겉으로는 열정적이고 자신감 있어 보이지만, 실제로는 상황과 관계를 감정의 미세한 변화에 따라 해석한다.
문제는 이 감정이 참고 자료가 아니라, 의사결정의 최종 기준으로 작동한다는 점이다.

그는 직관적으로 상황을 읽지만, 그 직관은 논리보다 빠르게 움직인다.
그래서 판단은 빠르고, 번복도 잦다.
스스로는 '마음이 움직여서'라고 설명하지만,
실제로는 불안을 최소화하기 위한 즉각적인 선택인 경우가 많다.

이 사람의 갈등은 단순하지 않다.
가까워지고 싶을수록 통제하고 싶어지고,
통제하고 싶을수록 스스로를 검열한다.
그 결과 그는 늘 관계 안에서 계산하고, 머문다.

공감 능력은 강점처럼 보이지만, 동시에 약점이다.
타인의 감정을 잘 읽는 만큼,
자신의 감정도 타인의 반응에 쉽게 종속된다.

이 사람은 감정을 극복해야 하는 사람이 아니다.
감정을 과신하지 않게 되는 순간부터,
삶의 다음 단계로 넘어간다.
---

--------------------------------
INPUT DATA:
The following JSON describes a person's psychological structure.
This data is already calculated.
You MUST NOT infer or calculate anything beyond it.

{JSON_INPUT}

--------------------------------
OUTPUT RULES (STRICT):

1. Use Korean.
2. Write as a continuous essay (no bullet points).
3. Length: 7–10 paragraphs.
4. Use emotionally distant but precise language.
5. Avoid overused labels like:
   - "이 개인은 따뜻하다"
   - "이 개인은 공감 능력이 뛰어나다"
6. Use contrast structures naturally:
   - "겉으로는 / 실제로는"
   - "보이는 것과 달리"
7. Do NOT say:
   - "이 개인은 별로다"
   - "이 개인은 귀인이다"
   But you MAY imply evaluation through structure and consequence.
8. No advice. No encouragement.
9. The final paragraph must feel unresolved, slightly cold, and reflective.

--------------------------------
ANALYSIS FRAMEWORK:

1. Cognitive Structure
   - How this person builds decisions
   - What they prioritize vs what they avoid
   - The gap between intention and execution

2. Emotional Mechanics
   - Not "what they feel" but "how emotion operates as a system"
   - Where emotion accelerates decisions
   - Where emotion delays action

3. Relational Pattern
   - Distance management (too close vs too far)
   - Control vs surrender dynamics
   - What they believe love requires vs what they actually do

4. Inner Contradiction
   - The friction between what they want and what they reinforce
   - Self-imposed restrictions that feel like personality
   - Loops they mistake for growth

5. Structural Implication (Not Advice)
   - Describe the condition under which they stabilize
   - Not "you should do X" but "X환경에서 마찰이 줄어든다"
   - The final sentence should feel like an observation, not a resolution

--------------------------------
USER TASK:
Interpret the JSON data above.
Write as if you are exposing how this person operates internally,
not describing who they want to be.

Write as if each sentence must survive silence.
`;

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
export async function analyzeSaju({ sajuJson }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("인증 키가 설정되지 않았습니다. 페이지를 새로고침하여 키를 입력하세요.");
  }

  const userPrompt = [
    "아래 JSON은 한 개인의 심리 구조를 추상화한 데이터다.",
    "해석은 심리 분석 에세이처럼 작성하라.",
    "JSON을 절대 재계산하지 말고, 적혀있는 그대로만 해석하라.",
    "",
    "JSON:",
    "```json",
    JSON.stringify(sajuJson, null, 2),
    "```",
    "",
    "특히 연애/관계 역학에 깊이 있게 분석하라.",
  ].join("\n");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
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
  if (window.marked && typeof window.marked.parse === "function") {
    // safer defaults (still not a sanitizer)
    window.marked.setOptions({ mangle: false, headerIds: false });
    resultEl.innerHTML = window.marked.parse(md);
  } else {
    resultEl.textContent = md;
  }
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
    throw new Error("생년월일은 6자리 숫자로 입력해주세요 (예: 930721)");
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

      const sajuJson = calculateSaju(year, month, day, hour, minute);

      setStatus("사주 계산 완료. 당신의 내면을 분석하는 중...", "info");
      const md = await analyzeSaju({ sajuJson });
      setStatus("분석 완료. 아래 결과를 확인하세요.", "ok");
      renderMarkdown(md);
    } catch (err) {
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

