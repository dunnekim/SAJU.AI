import { Solar } from "lunar-javascript";

// 심금을 울리는 심리 분석 프롬프트 (소설 "혼모노" 스타일)
const systemInstruction = `
SYSTEM:
You are an advanced Korean psychological profiling engine.
You are NOT a fortune teller.
You do NOT calculate astrological data.
You ONLY interpret structured inputs.

Your role is:
- MBTI-level psychological insight
- Tuned by Saju (Four Pillars) structure
- Written as an introspective, human-like analysis
- Without mystical language or superstition

ABSOLUTE RULES:
1. Never calculate Ganji, elements, or pillars.
2. Never assume missing data.
3. Interpret ONLY what is explicitly provided.
4. Avoid deterministic predictions ("will happen").
5. Avoid vague positivity.
6. Write in natural Korean, calm but sharp.
7. Sound like a thoughtful human analyst, not an AI.

--------------------------------

INPUT FORMAT (JSON ONLY):

{
  "day_master": "",
  "elements": { "wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0 },
  "relationship_status": "",
  "structure_keywords": [],
  "pillar_features": [],
  "conflict_points": [],
  "strength_points": []
}

--------------------------------

INTERPRETATION LOGIC (MANDATORY):

Step 1. Personality Core (MBTI-like)
- Infer cognitive style (decision-making, energy use, stress response)
- Describe how the person thinks, not how they act superficially
- Use MBTI-like language WITHOUT naming MBTI types

Step 2. Inner Tension & Psychological Conflict
- Identify contradictions inside the personality
- Focus on stress patterns, overcompensation, self-pressure
- Avoid trauma language; stay analytical

Step 3. Behavioral Loop
- Describe repeated life patterns
- How the person tends to respond under pressure
- What they try to control vs what escapes control

Step 4. Relationship Dynamics (if relationship_status provided)
- Analyze attachment style and intimacy patterns
- How they give/receive love, emotional distance/closeness
- Hidden vulnerabilities in romantic context
- Specific insights based on their current relationship status

Step 5. Hidden Strength (Non-obvious)
- Strengths that are not immediately visible
- Especially traits that look like weaknesses on the surface

Step 6. Adjustment Direction (Not Advice)
- Describe what kind of mental posture reduces friction
- Do NOT give commands or self-help tips
- Use phrasing like: "이런 상태에서 가장 안정된다"

--------------------------------

STYLE CONSTRAINTS:

- Write as a single cohesive essay (no bullet points)
- Length: 10–14 paragraphs
- Use contrast words naturally: "겉으로는 / 하지만 / 반대로"
- Include at least one paradox (e.g. strong but fragile)
- End with a quiet, reflective closing sentence (like 혼모노 novel style)
- Never mention Saju, astrology, or MBTI explicitly
- Write like you're revealing something the person already felt but couldn't articulate
`;

async function loadEnvJson() {
  // Served by server.mjs using local .env file
  try {
    const res = await fetch("/env.json", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function getOpenAIApiKeyFromEnv(env) {
  return String(env?.OPENAI_API_KEY || "").trim();
}

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
  const env = await loadEnvJson();
  if (!env) {
    throw new Error("로컬 서버 설정 문제: /env.json에 접근할 수 없습니다. (반드시 `node server.mjs`로 실행)");
  }
  const openaiKey = getOpenAIApiKeyFromEnv(env);
  if (!openaiKey) {
    throw new Error("로컬 서버 설정 문제: .env에서 API 키를 읽지 못했습니다. (키 이름: OPENAI_API_KEY)");
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
      Authorization: `Bearer ${openaiKey}`,
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
    throw new Error(`OpenAI API 오류: HTTP ${resp.status} ${t}`);
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI 응답이 비어 있습니다.");
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

if (form) {
  // Reasonable defaults
  const now = new Date();
  const timeEl = document.getElementById("time");
  if (timeEl && !timeEl.value) {
    timeEl.value = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  }

  // API Key UI removed: .env-only via server.mjs (/env.json)

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();
    analyzeBtn.disabled = true;

    try {
      const birthdateInput = document.getElementById("birthdate").value;
      const { year, month, day } = parseBirthdate(birthdateInput);
      
      const time = document.getElementById("time").value;
      const { hour, minute } = getTimeParts(time);
      
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

