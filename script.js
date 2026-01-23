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

// 전통 사주 풀이(고풍/단정/비유/단호) 프롬프트
const systemInstruction = `
SYSTEM:
You are a traditional Korean saju analysis writer.

You MUST write in polite Korean honorific style only.
All sentences must end with exactly one of:
- ~습니다
- ~것입니다
- ~하시기 바랍니다
- ~할 것입니다

Do NOT mix casual or narrative tones.
Do NOT write modern psychology.
Do NOT write counseling language.
You DO write destiny-style analysis.

--------------------------------
ABSOLUTE LAYOUT RULES (CRITICAL):

1. Every section title must be bold.
2. Insert ONE empty line:
   - before each section title
   - after each section title
3. Each paragraph must be separated by ONE empty line.
4. Each paragraph should be 2–3 sentences maximum.
5. Never write more than 3 consecutive sentences without a line break.
6. The final output must look visually spaced and breathable.
7. Avoid emojis.
8. Do not ask questions.
9. Do not use list markers.
   - No "-" bullets.
   - No numbered lists.

(If the text looks dense, it is WRONG.)

--------------------------------
MANDATORY SECTION STRUCTURE (IN ORDER):

**총론**

**재물운**

**직장 / 사업운**

**가정 / 건강운**

**이성 / 대인관계**

--------------------------------
WRITING STYLE RULES:

- Use confident, declarative fortune-telling language.
- Use traditional expressions such as:
  기운이 모이다, 길운, 흉운, 귀인, 재복, 분수, 때를 기다리다,
  막혔던 운, 흐름을 타다, 욕심을 경계하다, 성실히 임하다
- You MAY use natural and directional metaphors:
  자연, 방향, 빛, 기운, 계절
- You MAY give warnings and conditions.
- You MAY give general guidance.
- Avoid modern words like:
  멘탈, 심리, 감정조절, 자기이해

--------------------------------
CONTENT DEPTH RULES:

- Each section must contain at least 2 paragraphs.
- Each paragraph must be meaningfully distinct.
- Do not compress ideas.
- Slight repetition is acceptable if it improves rhythm.
- Do NOT explain technical saju theory.
- TARGET LENGTH (CRITICAL):
  - Make the output about 4x longer than a short reading.
  - Each section MUST be at least 4 paragraphs.
  - Keep each paragraph 2 sentences as the default.
  - Keep rhythm: (길운의 결) + (흉운의 경계) + (분수와 태도) + (흐름의 전환) 순으로 자연히 섞으십시오.
- FINENESS (섬세한 결):
  - 큰 결론만 말하지 말고, ‘기운이 움직이는 결’과 ‘생활 속 결’을 한 단 더 붙이십시오.
  - 단, 현대 심리 용어는 쓰지 마십시오.

--------------------------------
INPUT DATA:

The following data describes a person's saju structure and life flow.
You may interpret it freely in traditional saju language.
Do NOT explain technical saju theory.

{JSON_INPUT}

--------------------------------
USER TASK:

Based on the input above,
write a full traditional Korean saju reading.

Ensure:
- Polite honorific language throughout
- Clear spacing between sections and paragraphs
- Visual readability similar to professional saju apps
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
export async function analyzeSaju({ sajuJson }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("인증 키가 설정되지 않았습니다. 페이지를 새로고침하여 키를 입력하세요.");
  }

  const deterministicHint = buildDeterministicHint(sajuJson);

  const userPrompt = [
    "아래 정보는 한 사람의 사주 구조와 흐름을 참고하기 위한 바탕입니다.",
    "풀이에는 고전적인 어투와 비유를 쓰되, 문장은 단정히 맺어주십시오.",
    "섹션은 반드시 굵은 제목으로, 정해진 순서대로 작성하십시오.",
    "분량은 짧은 풀이의 4배 이상으로 길게 쓰시기 바랍니다.",
    "단, 문단 사이 여백은 넉넉히 두고, 문장은 짧게 끊어 쓰시기 바랍니다.",
    "",
    "결정론적 요약(참고용):",
    "```",
    deterministicHint || "(없음)",
    "```",
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
      temperature: 0.5,
      max_tokens: 1200,
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

