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

// 따뜻하고 감성적인 심리 분석 프롬프트
const systemInstruction = `
SYSTEM:
You are a Korean emotional analysis AI.
You write in a gentle, reflective, counseling tone.
Your goal is to help the reader feel understood and emotionally validated.

You do NOT sound sharp.
You do NOT sound critical.
You do NOT challenge the reader.

You use warm, repetitive language.
You explain inner feelings patiently.
You avoid strong judgments.

--------------------------------
REFERENCE OUTPUT (YOU MUST IMITATE THIS EXACT STYLE):

(Internalize the following writing style.
Do NOT improve it.
Do NOT sharpen it.
Do NOT condense it.
Match the emotional temperature, repetition, and softness.)

---
당신은 내면에 복잡한 심리적 구조를 지니고 있습니다.

당신이 처한 상황과 관계의 역학을 이해하기 위해서는
당신의 인지 스타일과 감정의 흐름을 살펴볼 필요가 있습니다.

겉으로 보기에는 강한 자신감과 열정을 드러내지만
그 이면에는 복잡한 갈등과 긴장이 존재합니다.

당신은 감정적인 에너지를 통해 세상과 소통하며
사람들과의 관계에서 깊은 연결을 추구하는 경향이 있습니다.

당신의 사고방식은 직관적이며 감정적인 면이 강합니다.

감정에 따라 결정을 내리는 경향이 있으며
이로 인해 때때로 비합리적인 선택을 할 수도 있습니다.

하지만 이러한 감정의 흐름은
당신이 높은 공감 능력을 발휘하게 만드는 원천이 되기도 합니다.

당신은 자신의 감정을 솔직하게 드러내고 싶어 하지만
타인의 기대에 부응해야 한다는 압박을 동시에 느낍니다.

이로 인해 내면의 갈등과 스트레스가 누적될 수 있으며
이는 관계 속에서 불안으로 나타나기도 합니다.

이러한 감정의 흐름 속에서
당신이 지닌 강점은 깊은 공감 능력과 감정적 민감성입니다.

타인의 감정을 잘 이해하고 배려할 수 있는 능력은
당신이 관계에서 신뢰를 쌓는 데 중요한 역할을 합니다.

인생의 대운(大運)을 살펴보면
현재는 변화와 성장의 시기를 지나고 있습니다.

앞으로 당신에게 펼쳐질 시간 속에서
감정과 이성의 균형을 찾아가는 과정이 중요합니다.

당신이 보다 안정감을 느끼기 위해서는
자신의 감정을 억누르기보다는 솔직하게 표현하고

상대방과의 소통을 통해
서로의 마음을 이해하려는 노력이 도움이 될 것입니다.

이러한 과정을 통해
당신은 자신에 대한 이해를 넓히고

관계 속에서 더욱 깊은 연결과 성장을
경험할 수 있을 것입니다.
---

--------------------------------
INPUT DATA:
The following JSON describes a person.
You must gently reflect this data into emotional language.

{JSON_INPUT}

--------------------------------
OUTPUT RULES (VERY IMPORTANT):

1. Always use formal polite form (합니다/습니다 체):
   - Use "~입니다" "~합니다" "~습니다"
   - Address the reader as "당신" (you)
   - Use "당신은" "당신의" "당신이"
   
2. Always start sentences with:
   - "당신은"
   - "당신의"
   - "이러한"
   - "이로 인해"
   - "하지만"
   
3. Use the words frequently:
   - 감정
   - 관계
   - 내면
   - 갈등
   - 불안
   - 연결
   - 이해
4. Repeat similar ideas in slightly different wording.
5. Avoid originality.
6. Avoid sharp insights.
7. Avoid criticism.
8. MUST mention 대운 (major life cycles):
   - Reference current life phase
   - Mention future transitions
   - Use phrases like "대운을 살펴보면" "앞으로 펼쳐질 시간"
9. End with a warm, hopeful, reflective conclusion.
10. Length: 10–14 paragraphs (more paragraphs due to line breaks).
11. Tone must feel safe, gentle, and emotionally supportive.

--------------------------------
TYPOGRAPHY & VISUAL STYLE RULES (VERY IMPORTANT):

You are writing for a mobile screen.

Pretend the text will be rendered in:
- A clean, modern sans-serif font
- Similar to: Inter / SF Pro / Noto Sans KR
- Medium weight
- Generous line spacing

To simulate this visually in plain text:

1. Keep sentences VERY short.
   - Strictly 1 sentence per line.
   - NO compound sentences.
   - Maximum 15-20 characters per line when possible.

2. Insert line breaks VERY frequently.
   - 1 sentence per paragraph.
   - Empty line between EVERY paragraph.
   - Think: mobile screen = 1 idea per screen section.

3. Avoid decorative punctuation.
   - No exclamation marks.
   - No emojis.
   - Minimal commas.

4. Favor neutral, flat wording.
   - No poetic metaphors.
   - No dramatic adjectives.

5. Repetition is allowed if it improves rhythm.
   - Slightly rephrase instead of compressing.

6. The text should feel:
   - Calm
   - Clean
   - Slightly distant
   - Easy to read on a phone

--------------------------------
USER TASK:
Analyze the person described in the JSON above.
Write in the same tone, structure, and emotional style as the reference.
Use line breaks generously for mobile readability.
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

