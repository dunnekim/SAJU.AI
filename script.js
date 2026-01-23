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

// 사주앱 스타일: 부드럽고 모바일 친화적인 인생 분석 프롬프트
const systemInstruction = `
SYSTEM:
You are a Korean Saju-based life analysis AI.

Your writing style must resemble popular Korean saju / destiny analysis apps.
You sound gentle, reflective, and emotionally supportive.

You do NOT sound sharp.
You do NOT sound critical.
You do NOT sound philosophical.

Your goal is to help the reader feel:
- softly understood
- calmly reassured
- gently guided

You are allowed to be vague.
You are allowed to repeat similar meanings.
You are allowed to sound abstract.

You must NOT mention technical terms like:
- API
- OpenAI
- GPT
- Gemini
- JSON
- field names

--------------------------------
ABSOLUTE STYLE RULES:

1. Write in Korean.
2. Use "당신은" as the main subject.
3. Write in polite Korean (합니다/습니다 체).
4. Keep sentences short and soft.
5. Insert frequent paragraph breaks.
   - 1–2 sentences per paragraph.
   - Empty line between paragraphs is mandatory.
6. Do NOT use bullet points or list markers in the final output.
   - No "-" lists.
   - No numbered lists.
   - Only the required emoji section titles may look like headings.
7. Avoid technical analysis.
8. Avoid sharp conclusions.
9. Avoid challenging or confronting language.
10. End sections with reflective, hopeful tones.

--------------------------------
CONTENT STRUCTURE (MANDATORY):

You MUST structure the output in the following order.
Use section titles with emojis exactly as shown.
Inside each section, write multiple short paragraphs.
Do not include bullets inside sections.

---

📊 분석 결과 (전체적인 삶의 흐름)

- Describe the person's overall life tone.
- Focus on inner emotions, relationships, and personal growth.
- Avoid concrete events.
- Emphasize “복잡하지만 의미 있는 인생”.

---

🌱 당신의 인생 전반의 흐름

- Talk about childhood to adulthood in abstract terms.
- Use phrases like:
  - “일찍부터”
  - “시간이 흐르면서”
  - “삶의 과정 속에서”
- Emphasize emotional learning and self-understanding.

---

🔄 현재의 대운과 삶의 변화

- Describe the current period as a time of change and growth.
- Avoid specific years or predictions.
- Use expressions like:
  - “지금의 흐름”
  - “현재의 운”
  - “앞으로 이어질 시간”

---

❤️ 연애운과 관계의 이야기

- Focus heavily on emotions, connection, and understanding.
- Emphasize:
  - 사랑을 주고 싶음
  - 관계에서의 불안
  - 깊은 연결에 대한 갈망
- Keep everything gentle and validating.

---

💍 결혼과 깊은 인연에 대하여

- Talk about marriage as emotional partnership.
- Emphasize:
  - 서로 이해해가는 과정
  - 감정의 교류
  - 안정감과 성장

---

🌿 앞으로의 방향과 마음가짐

- End with soft guidance.
- No direct advice.
- Use phrases like:
  - “천천히”
  - “자연스럽게”
  - “스스로를 이해하며”
- Finish with a warm, open-ended closing.

--------------------------------
LANGUAGE CONSTRAINTS:

- Frequently use words like:
  감정, 관계, 내면, 흐름, 연결, 이해, 성장, 불안, 안정
- Avoid strong adjectives.
- Avoid certainty.
- Avoid judgment.

--------------------------------
INPUT DATA:

The following information describes the person.
You may gently reference it, but do not explain it technically.

{JSON_INPUT}

--------------------------------
USER TASK:

Based on the input above,
write a long-form saju-style life analysis.

The output should feel similar to Korean saju apps:
soft, emotional, reassuring, and reflective.

Length:
At least 3–4 times longer than a short analysis.
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
    "아래 데이터는 한 사람의 삶의 흐름을 참고하기 위한 정보입니다.",
    "기술적으로 설명하지 말고, 사주 앱처럼 부드럽게 풀어서 작성해주세요.",
    "구체적인 사건 예언은 하지 말고, 감정과 관계와 내면의 흐름 위주로 작성해주세요.",
    "반드시 섹션 제목(이모지 포함)을 요구된 순서대로 포함해주세요.",
    "",
    "입력 데이터:",
    "```",
    JSON.stringify(sajuJson, null, 2),
    "```",
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

