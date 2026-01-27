import { Solar } from "lunar-javascript";

// 현재 선택된 모드 (global state)
let currentMode = "general";

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

// ------------------------------------------------------------------
// [Abyssal Wait-Gate] 12초 강제 심리 압박 (수익화·광고 노출)
// ------------------------------------------------------------------
const MIN_WAIT_MS = 12000;

const LOADING_SCRIPTS = [
  { progress: 10, text: "사회적 가면(Persona) 데이터 강제 분리 중..." },
  { progress: 30, text: "표면적 위선 패턴 감지... 1차 방어기제 해제" },
  { progress: 50, text: "유년기 결핍 데이터 역추적 중..." },
  { progress: 70, text: "억눌린 파괴적 본능(Id) 동기화 완료" },
  { progress: 85, text: "5년 후 사회적 도태 확률 시뮬레이션 중..." },
  { progress: 95, text: "당신의 심연을 텍스트로 변환하는 중..." },
];

export async function analyzeSaju({ sajuJson, mode = "general" }) {
  // [배포용] Render 실제 운영 서버 주소
  const API_URL = "https://fate-ai-rgea.onrender.com/api/analyze";
  console.log(`📡 Sending Request to: ${API_URL}`);

  const apiPromise = fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sajuJson, mode }),
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Server Error");
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("분석 결과가 비어 있습니다.");
    return content;
  });

  const waitPromise = new Promise(resolve => setTimeout(resolve, MIN_WAIT_MS));
  const [content] = await Promise.all([apiPromise, waitPromise]);
  return content;
}

// ---------- UI wiring ----------
const form = document.getElementById("sajuForm");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const progressBar = document.getElementById("progressBar");

// 심연 대기 시퀀스용 인터벌
let loadingInterval = null;

function showLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  const bar = document.getElementById("progressBar");
  const text = document.getElementById("loadingText");

  if (!overlay || !bar || !text) return;

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");

  bar.style.width = "0%";
  text.textContent = "데이터 업로딩...";
  text.style.opacity = "1";

  let currentStep = 0;
  const totalSteps = LOADING_SCRIPTS.length;
  const stepDuration = MIN_WAIT_MS / totalSteps;

  loadingInterval = setInterval(() => {
    if (currentStep < totalSteps) {
      const script = LOADING_SCRIPTS[currentStep];

      text.style.opacity = "0";
      setTimeout(() => {
        text.textContent = script.text;
        text.style.opacity = "1";
      }, 200);

      const randomVar = Math.random() * 5;
      bar.style.width = `${Math.min(99, script.progress + randomVar)}%`;
      currentStep++;
    }
  }, stepDuration);
}

function completeLoadingOverlay() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }

  const overlay = document.getElementById("loadingOverlay");
  const bar = document.getElementById("progressBar");
  const text = document.getElementById("loadingText");

  if (!overlay) return;

  if (bar) bar.style.width = "100%";
  if (text) text.textContent = "분석 완료. 심연을 공개합니다.";

  setTimeout(() => {
    overlay.classList.add("opacity-0", "transition-opacity", "duration-500");
    setTimeout(() => {
      overlay.classList.remove("flex", "opacity-0", "transition-opacity", "duration-500");
      overlay.classList.add("hidden");
      if (bar) bar.style.width = "0%";
    }, 500);
  }, 800);
}

function setStatus(message, kind = "info") {
  if (!statusEl) return;
  statusEl.className = "block px-6 py-4 rounded-lg border border-gray-800 transition-all mb-6";
  if (kind === "error") {
    statusEl.classList.add("bg-red-950/30", "border-red-900/50", "text-red-400");
  } else if (kind === "ok") {
    statusEl.classList.add("bg-emerald-950/30", "border-emerald-800/50", "text-emerald-400");
  } else {
    statusEl.classList.add("bg-gray-800/50", "border-gray-700", "text-gray-300");
  }
  statusEl.textContent = message;
}

function clearStatus() {
  if (!statusEl) return;
  statusEl.className = "hidden mb-6 px-6 py-4 rounded-lg border border-gray-800 transition-all";
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
      ? (sentences[sentences.length - 1].replace(/[.]$/, '') || '당신의 심연을 들여다보십시오.')
      : '당신의 심연을 들여다보십시오.';
  }

  const captureDiv = document.createElement('div');
  captureDiv.style.cssText = `
    position: fixed; top: -9999px; left: -9999px; width: 1080px; height: 1920px;
    background: #111111;
    color: #E5E5E5; padding: 120px 80px; box-sizing: border-box;
    font-family: 'Pretendard', sans-serif; display: flex; flex-direction: column; justify-content: space-between; text-align: center;
    border: 20px solid #1A1A1A;
  `;
  captureDiv.innerHTML = `
    <div>
      <div style="font-size: 80px; margin-bottom: 30px; opacity: 0.8;">👁️</div>
      <h1 style="font-size: 40px; font-weight: 900; color: #FF4500; letter-spacing: 12px; text-transform: uppercase;">SHADOW REPORT</h1>
    </div>
    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; position: relative;">
      <div style="position: absolute; top: 20%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,59,48,0.1) 0%, rgba(0,0,0,0) 70%); border-radius: 50%;"></div>
      <p style="font-size: 72px; line-height: 1.4; font-weight: 700; word-break: keep-all; color: #FFFFFF; position: relative; z-index: 10; text-shadow: 0 0 20px rgba(0,0,0,0.8);">
        ${escapeHtml(hookText)}
      </p>
    </div>
    <div style="border-top: 2px solid #333; padding-top: 60px;">
      <p style="font-size: 32px; color: #666; letter-spacing: 2px;">당신의 어둠을 읽다</p>
      <p style="font-size: 36px; font-weight: bold; margin-top: 20px; color: #FF4500;">fate.ai</p>
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
    link.download = `SHADOW_REPORT_${Date.now()}.png`;
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
    card.className = 'section-card bg-[#1A1A1A] p-6 md:p-8 rounded-2xl shadow-lg border border-gray-800 mb-8 hover:border-red-900/50 transition-colors';

    const titleEl = document.createElement('h2');
    titleEl.className = cardIndex === 0
      ? 'text-xl font-bold text-red-500 mb-6 mt-2'
      : 'text-xl font-bold text-red-500 mt-12 mb-6';
    titleEl.textContent = titleLine;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'prose prose-invert prose-p:text-[#E0E0E0] prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6 max-w-none';
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

if (form) {
  // 탭 전환 로직
  const tabButtons = document.querySelectorAll('.tab-btn');
  const partnerSection = document.getElementById('partnerSection');
  const relationshipSection = document.getElementById('relationshipSection');
  const careerStatusSection = document.getElementById('careerStatusSection');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('bg-saju-accent', 'text-white', 'shadow-[0_0_15px_rgba(255,59,48,0.3)]', 'font-bold');
        b.classList.add('text-gray-500', 'font-medium');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.remove('text-gray-500', 'font-medium');
      btn.classList.add('bg-saju-accent', 'text-white', 'shadow-[0_0_15px_rgba(255,59,48,0.3)]', 'font-bold');
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
      if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
      }
      if (loadingOverlay) {
        loadingOverlay.classList.remove("flex");
        loadingOverlay.classList.add("hidden");
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

