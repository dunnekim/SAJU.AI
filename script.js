import { Solar } from "lunar-javascript";

// 현재 선택된 모드 (global state)
let currentMode = "general";

// ---------- i18n: 브라우저 언어 감지 및 UI 번역 ----------
/** @returns {'ko'|'en'|'ja'} ko/ja 외에는 en 기본 */
function detectLanguage() {
  const nav = (typeof navigator !== "undefined" && (navigator.language || navigator.userLanguage || "")) || "";
  if (nav.startsWith("ko")) return "ko";
  if (nav.startsWith("ja")) return "ja";
  return "en";
}
let currentLang = detectLanguage();

const translations = {
  ko: {
    titleMain: "Shadow",
    titleAccent: ".Report",
    subtitle: "Dark Psychology Profiler",
    tabGeneral: "◼ 심연",
    tabCompatibility: "💔 파멸",
    tabCareer: "💼 생존",
    labelBirthDate: "Birth Date",
    labelBirthTime: "Birth Time",
    labelGender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "기타",
    labelRelationship: "Relationship Status",
    relSingle: "솔로",
    relDating: "연애 중",
    relPlateau: "위기",
    relMarried: "결혼",
    relDivorced: "이혼",
    relWidowed: "사별",
    labelCareer: "Current Status",
    careerSeeking: "취준",
    careerBurnout: "현타",
    careerMoving: "이직",
    targetSubject: "--- Target Subject ---",
    labelPartnerGender: "Partner Gender",
    partnerMale: "남",
    partnerFemale: "여",
    partnerOther: "기타",
    btnDecode: "DECODE DESTINY",
    resultTitle: "결과",
    resultPlaceholder: "생년월일을 입력하고 DECODE DESTINY를 실행하세요",
    saveReport: "Save Report",
    footerBefore: "당신의 어둠을 읽다 · ",
    footerBrand: "FATE.AI · SHADOW REPORT",
    loadingInitial: "데이터 업로딩...",
    timeSelect: "시간 선택",
    time23_01: "자시 (23:00~01:00)",
    time01_03: "축시 (01:00~03:00)",
    time03_05: "인시 (03:00~05:00)",
    time05_07: "묘시 (05:00~07:00)",
    time07_09: "진시 (07:00~09:00)",
    time09_11: "사시 (09:00~11:00)",
    time11_13: "오시 (11:00~13:00)",
    time13_15: "미시 (13:00~15:00)",
    time15_17: "신시 (15:00~17:00)",
    time17_19: "유시 (17:00~19:00)",
    time19_21: "술시 (19:00~21:00)",
    time21_23: "해시 (21:00~23:00)",
    metaTitle: "FATE.AI · 당신의 파멸을 경고합니다",
    metaDescription: "나르시시스트, 가스라이팅, 도태 시나리오... AI가 분석하는 당신의 추악한 심연. 멘탈 약한 분 클릭 금지.",
    metaKeywords: "사주팩폭, 가스라이팅테스트, 나르시시스트특징, 소시오패스사주, 이별운, 도태남, 도태녀, 흑화테스트, AI점술"
  },
  en: {
    titleMain: "SHADOW",
    titleAccent: " DESTINY",
    subtitle: "Narcissism & Dark Psychology Decoder",
    tabGeneral: "◼ ABYSS",
    tabCompatibility: "💔 RUIN",
    tabCareer: "💼 SURVIVAL",
    labelBirthDate: "Birth Date",
    labelBirthTime: "Birth Time",
    labelGender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    labelRelationship: "Relationship Status",
    relSingle: "Single",
    relDating: "Dating",
    relPlateau: "Plateau",
    relMarried: "Married",
    relDivorced: "Divorced",
    relWidowed: "Widowed",
    labelCareer: "Current Status",
    careerSeeking: "Seeking",
    careerBurnout: "Burnout",
    careerMoving: "Moving",
    targetSubject: "--- Target Subject ---",
    labelPartnerGender: "Partner Gender",
    partnerMale: "M",
    partnerFemale: "F",
    partnerOther: "Other",
    btnDecode: "DECODE MY FATE",
    resultTitle: "Result",
    resultPlaceholder: "Enter birth date and tap DECODE MY FATE",
    saveReport: "Save Report",
    footerBefore: "Decode your shadow · ",
    footerBrand: "FATE.AI · SHADOW REPORT",
    loadingInitial: "Loading data...",
    timeSelect: "Select time",
    time23_01: "23:00–01:00 (Rat)",
    time01_03: "01:00–03:00 (Ox)",
    time03_05: "03:00–05:00 (Tiger)",
    time05_07: "05:00–07:00 (Rabbit)",
    time07_09: "07:00–09:00 (Dragon)",
    time09_11: "09:00–11:00 (Snake)",
    time11_13: "11:00–13:00 (Horse)",
    time13_15: "13:00–15:00 (Goat)",
    time15_17: "15:00–17:00 (Monkey)",
    time17_19: "17:00–19:00 (Rooster)",
    time19_21: "19:00–21:00 (Dog)",
    time21_23: "21:00–23:00 (Pig)",
    metaTitle: "Why You're Failing: Dark Destiny Analysis",
    metaDescription: "Stop blaming your zodiac. See your real flaws via AI.",
    metaKeywords: "Bazi, Four Pillars, Dark Psychology, Brutal Truth, savage roast, AI destiny"
  },
  ja: {
    titleMain: "深淵の",
    titleAccent: "運命",
    subtitle: "四柱推命・心理分析",
    tabGeneral: "◼ 深淵",
    tabCompatibility: "💔 破滅",
    tabCareer: "💼 生存",
    labelBirthDate: "生年月日",
    labelBirthTime: "出生時刻",
    labelGender: "性別",
    genderMale: "男性",
    genderFemale: "女性",
    genderOther: "その他",
    labelRelationship: "恋愛状況",
    relSingle: "独身",
    relDating: "交際中",
    relPlateau: "倦怠期",
    relMarried: "既婚",
    relDivorced: "離婚",
    relWidowed: "死別",
    labelCareer: "現在の状況",
    careerSeeking: "就活中",
    careerBurnout: "燃え尽き",
    careerMoving: "転職",
    targetSubject: "--- 対象者 ---",
    labelPartnerGender: "相手の性別",
    partnerMale: "男",
    partnerFemale: "女",
    partnerOther: "その他",
    btnDecode: "運命を解読する",
    resultTitle: "結果",
    resultPlaceholder: "生年月日を入力して「運命を解読する」を実行してください",
    saveReport: "レポート保存",
    footerBefore: "あなたの闇を読む · ",
    footerBrand: "FATE.AI · SHADOW REPORT",
    loadingInitial: "データ読込中...",
    timeSelect: "時刻を選択",
    time23_01: "子時 (23:00～01:00)",
    time01_03: "丑時 (01:00～03:00)",
    time03_05: "寅時 (03:00～05:00)",
    time05_07: "卯時 (05:00～07:00)",
    time07_09: "辰時 (07:00～09:00)",
    time09_11: "巳時 (09:00～11:00)",
    time11_13: "午時 (11:00～13:00)",
    time13_15: "未時 (13:00～15:00)",
    time15_17: "申時 (15:00～17:00)",
    time17_19: "酉時 (17:00～19:00)",
    time19_21: "戌時 (19:00～21:00)",
    time21_23: "亥時 (21:00～23:00)",
    metaTitle: "【閲覧注意】あなたの運命の残酷な真実",
    metaDescription: "四柱推命で暴く、あなたの「裏」性格と未来。覚悟がある人だけクリックしてください。",
    metaKeywords: "四柱推命, 辛口占い, 毒舌占い, AI運命"
  }
};

function updateLanguage() {
  if (typeof document === "undefined" || !document.querySelectorAll) return;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && translations[currentLang] && translations[currentLang][key] !== undefined) {
      el.textContent = translations[currentLang][key];
    }
  });
  updateLangButtons();
  // Phase 6-1: MBTI 섹션은 한국어(ko)일 때만 표시
  const mbtiSection = document.getElementById("mbtiSection");
  if (mbtiSection) {
    if (currentLang === "ko") {
      mbtiSection.classList.remove("hidden");
      mbtiSection.classList.add("space-y-2");
    } else {
      mbtiSection.classList.add("hidden");
      mbtiSection.classList.remove("space-y-2");
    }
  }
  // Phase 1: 언어별 SEO/바이럴 메타 (title, description, keywords, og, twitter)
  const t = translations[currentLang];
  if (t && t.metaTitle) document.title = t.metaTitle;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && t && t.metaDescription) desc.setAttribute("content", t.metaDescription);
  const kw = document.querySelector('meta[name="keywords"]');
  if (kw && t && t.metaKeywords) kw.setAttribute("content", t.metaKeywords);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && t && t.metaTitle) ogTitle.setAttribute("content", t.metaTitle);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && t && t.metaDescription) ogDesc.setAttribute("content", t.metaDescription);
  const twTitle = document.querySelector('meta[property="twitter:title"]');
  if (twTitle && t && t.metaTitle) twTitle.setAttribute("content", t.metaTitle);
  const twDesc = document.querySelector('meta[property="twitter:description"]');
  if (twDesc && t && t.metaDescription) twDesc.setAttribute("content", t.metaDescription);
}

/** 언어 전환 버튼 활성 스타일 갱신 */
function updateLangButtons() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const lang = btn.getAttribute("data-lang");
    if (lang === currentLang) {
      btn.classList.add("border-saju-accent", "text-white", "bg-saju-accent", "shadow-[0_0_10px_rgba(255,59,48,0.3)]");
      btn.classList.remove("text-saju-muted");
    } else {
      btn.classList.remove("border-saju-accent", "text-white", "bg-saju-accent", "shadow-[0_0_10px_rgba(255,59,48,0.3)]");
      btn.classList.add("text-saju-muted");
    }
  });
}

/** 언어 수동 전환 (KO/EN/JA 버튼용) */
function setLanguage(lang) {
  if (lang !== "ko" && lang !== "en" && lang !== "ja") return;
  currentLang = lang;
  updateLanguage();
}

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

/** 사주 객체에서 가장 강한 오행 키 반환 (wood/fire/earth/metal/water) */
function getStrongestElementKey(saju) {
  if (!saju) return null;
  const counts = saju.me ? saju.me.five_elements_count : saju.five_elements_count;
  if (!counts || typeof counts !== "object") return null;
  const entries = Object.entries(counts).filter(([, v]) => Number.isFinite(v));
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/** 오행 키 → 언어별 표기 (동적 OG 이미지용) */
const ELEMENT_LABEL = {
  ko: { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" },
  en: { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" },
  ja: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" },
};

// 십신(十神): 일간 기준 타 천간과의 관계 (비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인·일주)
const GAN_ORDER = "甲乙丙丁戊己庚辛壬癸";
function getGanIndex(gan) {
  const i = GAN_ORDER.indexOf(gan);
  return i >= 0 ? i : -1;
}
function getTenGod(dayMaster, gan) {
  if (!dayMaster || !gan) return "";
  if (gan === dayMaster) return "일주";
  const iDay = getGanIndex(dayMaster);
  const iOther = getGanIndex(gan);
  if (iDay < 0 || iOther < 0) return "";
  const elemDay = Math.floor(iDay / 2);   // 0 wood, 1 fire, 2 earth, 3 metal, 4 water
  const elemOther = Math.floor(iOther / 2);
  const yangDay = iDay % 2 === 0;
  const yangOther = iOther % 2 === 0;
  const sameYinYang = yangDay === yangOther;

  if (elemDay === elemOther) return sameYinYang ? "비견" : "겁재";
  const produces = (d, o) => (d + 1) % 5 === o;  // wood->fire, fire->earth, ...
  const controls = (d, o) => (d + 2) % 5 === o; // wood->earth, fire->metal, ...
  if (produces(elemDay, elemOther)) return sameYinYang ? "식신" : "상관";
  if (produces(elemOther, elemDay)) return sameYinYang ? "편인" : "정인";
  if (controls(elemDay, elemOther)) return sameYinYang ? "편재" : "정재";
  if (controls(elemOther, elemDay)) return sameYinYang ? "편관" : "정관";
  return "";
}

/** RALPH: GPT 해석용 확정 데이터만 추출 (사주 계산 결과 중) */
function buildRalphData(saju) {
  if (!saju || !saju.four_pillars) return null;
  const fp = saju.four_pillars;
  const dayMaster = saju.day_master || fp.day?.gan || "";
  const pillars = {
    year: fp.year ? `${fp.year.gan}${fp.year.ji}` : "",
    month: fp.month ? `${fp.month.gan}${fp.month.ji}` : "",
    day: fp.day ? `${fp.day.gan}${fp.day.ji}` : "",
    hour: fp.hour ? `${fp.hour.gan}${fp.hour.ji}` : "",
  };
  const elements = { ...(saju.five_elements_count || initElementsCount()) };
  const tenGods = {
    year: fp.year?.gan ? getTenGod(dayMaster, fp.year.gan) : "",
    month: fp.month?.gan ? getTenGod(dayMaster, fp.month.gan) : "",
    day: "일주",
    hour: fp.hour?.gan ? getTenGod(dayMaster, fp.hour.gan) : "",
  };
  return { dayMaster, pillars, elements, tenGods };
}

// Step 2. RALPH 엔진 (결정론적 계산)
// 함수명: calculateSaju(year, month, day, hour, minute)
export function calculateSaju(year, month, day, hour, minute) {
  const y = normalizeInt(year, "연(YYYY)");
  const m = normalizeInt(month, "월(MM)");
  const d = normalizeInt(day, "일(DD)");
  const hh = normalizeInt(hour, "시(HH)");
  const mm = normalizeInt(minute, "분(mm)");

  if (y < 1950 || y > 2030) throw new Error("연도는 1950~2030 범위여야 합니다.");
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
// [The Moneymaker UI] Ad-Optimized Loading Screen
// - 지연 시간: MIN_TOTAL_LOADING_MS(4초) = 광고 노출 보장 시간
// - 광고 위치: #ad-slot-loading 300x250 화면 중앙
// - 이탈 방지: 로딩 멘트 6개를 LOADING_MSG_INTERVAL_MS마다 순환 (60~80초 로딩 가정)
// ------------------------------------------------------------------
const WAIT_CACHE_MS = 5000;
const WAIT_MISS_BASE_MS = 12000;
const WAIT_MISS_EXTRA_MS = 6000;
const WAIT_MISS_MAX_MS = 18000;
const INITIAL_WAIT_MS = 18000;
const MIN_TOTAL_LOADING_MS = 4000;   // 광고 노출용 최소 로딩 시간 (setTimeout 4초 보장)
const LOADING_MSG_INTERVAL_MS = 10000; // 로딩 문구 순환 간격: 6문구 × 10초 ≈ 60초 (60~80초 로딩에 맞춤)

const LOADING_SCRIPTS_BY_LANG = {
  ko: [
    { progress: 10, text: "당신의 운명에서 불행을 추출하는 중..." },
    { progress: 25, text: "숨기고 싶은 과거를 스캔 중..." },
    { progress: 45, text: "업보(karma) 계산 중..." },
    { progress: 60, text: "방어기제 해체 및 본능 동기화..." },
    { progress: 80, text: "5년 후 파국 시뮬레이션 중..." },
    { progress: 95, text: "당신의 심연을 텍스트로 변환하는 중..." },
  ],
  en: [
    { progress: 10, text: "Extracting misery from your destiny..." },
    { progress: 25, text: "Scanning the past you hid..." },
    { progress: 45, text: "Judging your choices..." },
    { progress: 60, text: "Summoning demons. Syncing Id..." },
    { progress: 80, text: "Simulating your ruin in 5 years..." },
    { progress: 95, text: "Generating your verdict..." },
  ],
  ja: [
    { progress: 10, text: "あなたの運命から不幸を抽出中..." },
    { progress: 25, text: "隠した過去をスキャン中..." },
    { progress: 45, text: "業を計算中..." },
    { progress: 60, text: "防衛機制を解除し、本能を同期中..." },
    { progress: 80, text: "5年後の破滅をシミュレート中..." },
    { progress: 95, text: "深淵をテキストに変換中..." },
  ],
};

// Cynical Index (비판 수위): 모드별 0.0~1.0
const CYNICAL_INDEX = { general: 0.7, compatibility: 1.0, career: 0.8 };

export async function analyzeSaju({ sajuJson, mode = "general", ralphData: ralphDataIn, cynicalIndex: cynicalIndexIn, mbti: mbtiIn }) {
  // GA4: 분석 시작 이벤트
  if (typeof gtag === "function") {
    gtag("event", "begin_analysis", {
      event_category: "Engagement",
      event_label: mode
    });
  }

  const cynicalIndex = cynicalIndexIn ?? CYNICAL_INDEX[mode] ?? 0.7;
  const ralphData = ralphDataIn ?? (sajuJson.me != null
    ? { me: buildRalphData(sajuJson.me), partner: buildRalphData(sajuJson.partner) }
    : buildRalphData(sajuJson));
  const mbti = (typeof mbtiIn === "string" && mbtiIn.trim()) ? mbtiIn.trim() : null;

  const startTime = Date.now();
  const API_URL = "https://fate-ai-rgea.onrender.com/api/analyze";
  console.log(`📡 Sending Request to: ${API_URL}`);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sajuJson, mode, lang: currentLang, ralphData, cynicalIndex, mbti: mbti || null }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Server Error");

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("분석 결과가 비어 있습니다.");

  // 가변 대기 + 광고 노출용 최소 4초 보장 (The Suspense Gap)
  const requiredWait = data.isCached === true
    ? WAIT_CACHE_MS
    : Math.min(WAIT_MISS_MAX_MS, WAIT_MISS_BASE_MS + (cynicalIndex * WAIT_MISS_EXTRA_MS));
  const elapsed = Date.now() - startTime;
  const minTotal = Math.max(requiredWait, MIN_TOTAL_LOADING_MS);
  const remainingWait = Math.max(0, minTotal - elapsed);

  // 프로그레스 바를 남은 시간에 맞춰 100%까지 선형 보간
  updateLoadingRemaining(remainingWait);
  await new Promise(resolve => setTimeout(resolve, remainingWait));

  return content;
}

// [Dynamic OG Image] 배포 시 og-api URL로 설정 (예: https://fate-ai-og.vercel.app/api/og)
const OG_IMAGE_BASE = typeof window !== "undefined" && window.OG_IMAGE_BASE ? window.OG_IMAGE_BASE : "";

/** 결과 공유용 동적 OG 이미지 URL로 meta 갱신 (og-api 배포 시에만 동작) */
function updateDynamicOgImage() {
  if (!OG_IMAGE_BASE || typeof document === "undefined") return;
  const mbti = (window.__sajuMbti || "").toUpperCase().slice(0, 4) || "????";
  const element = (window.__sajuStrongestElement || "Soul").slice(0, 20);
  const keyword = (window.__sajuHookText || "Your Dark Truth").slice(0, 30);
  const lang = currentLang === "ja" ? "jp" : currentLang;
  const url = `${OG_IMAGE_BASE}?mbti=${encodeURIComponent(mbti)}&element=${encodeURIComponent(element)}&keyword=${encodeURIComponent(keyword)}&lang=${lang}`;
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute("content", url);
  const twImage = document.querySelector('meta[property="twitter:image"]');
  if (twImage) twImage.setAttribute("content", url);
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
  const scripts = LOADING_SCRIPTS_BY_LANG[currentLang] || LOADING_SCRIPTS_BY_LANG.en;
  const firstText = scripts[0]?.text || "Loading...";
  text.textContent = firstText;
  text.style.opacity = "1";

  let msgIndex = 0;
  const totalSteps = scripts.length;
  const FADE_MS = 280;

  function tickLoadingMessage() {
    msgIndex = (msgIndex + 1) % totalSteps;
    const script = scripts[msgIndex];

    text.style.opacity = "0";
    setTimeout(() => {
      text.textContent = script.text;
      requestAnimationFrame(() => {
        text.style.opacity = "1";
      });
    }, FADE_MS);

    const randomVar = Math.random() * 5;
    bar.style.width = `${Math.min(99, script.progress + randomVar)}%`;
  }

  loadingInterval = setInterval(tickLoadingMessage, LOADING_MSG_INTERVAL_MS);
}

/**
 * 서버 응답 수신 후 남은 대기 시간에 맞춰 프로그레스 바를 100%까지 선형 보간
 * @param {number} remainingWait - 남은 대기 시간(ms)
 */
function updateLoadingRemaining(remainingWait) {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }

  const bar = document.getElementById("progressBar");
  if (!bar || remainingWait <= 0) return;

  const startWidth = parseFloat(bar.style.width) || 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / remainingWait);
    const width = startWidth + (100 - startWidth) * progress;
    bar.style.width = `${width}%`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
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

// 인스타 스토리 공유 카드 — AI가 쓴 [[독설 한마디]]를 단일 소스로 사용. 없을 때만 마지막 문장 폴백
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

  // [[ ]] 훅이 있으면 반드시 그걸로; 공유 시 사용자 심장을 찌르는 '결정적 한 방'
  let hookText = (window.__sajuHookText || '').trim();
  if (!hookText) {
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
    card.className = 'section-card bg-[#1A1A1A] p-3 md:p-4 rounded-2xl shadow-lg border border-gray-800 mb-2 hover:border-red-900/50 transition-colors';

    const titleEl = document.createElement('h2');
    titleEl.className = cardIndex === 0
      ? 'text-lg font-bold text-red-500 mb-2 mt-1'
      : 'text-lg font-bold text-red-500 mt-2 mb-2';
    titleEl.textContent = titleLine;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'prose prose-invert prose-p:text-[#E0E0E0] prose-p:leading-tight prose-p:text-base prose-p:mb-1 max-w-none';
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
      const mbtiEl = document.getElementById("mbtiSelect");
      const mbtiVal = mbtiEl && mbtiEl.value ? String(mbtiEl.value).trim() : null;
      // API 호출 (모드 + MBTI 전달, 한국어일 때만 MBTI 입력 가능하나 값은 항상 전송)
      const md = await analyzeSaju({ sajuJson: sajuData, mode: currentMode, mbti: mbtiVal || undefined });
      
      // 로딩 완료
      completeLoadingOverlay();
      
      // 결과 공유용 데이터 저장 (동적 OG 이미지·인스타 카드)
      const strongestKey = getStrongestElementKey(sajuData);
      window.__sajuStrongestElement = strongestKey ? (ELEMENT_LABEL[currentLang]?.[strongestKey] || ELEMENT_LABEL.en[strongestKey] || strongestKey) : "Soul";
      window.__sajuMbti = mbtiVal || "";

      // 결과 렌더링
      setStatus("분석 완료. 아래 결과를 확인하세요.", "ok");
      renderMarkdown(md);
      updateDynamicOgImage();

      // GA4: 결과 조회 완료 이벤트 (로딩 바 사라진 시점)
      if (typeof gtag === "function") {
        gtag("event", "view_result", {
          event_category: "Engagement",
          event_label: currentMode
        });
      }
      
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

// 페이지 로드 시 UI 언어 적용 + 언어 전환 버튼 바인딩
function initI18n() {
  updateLanguage();
  updateLangButtons();
}

// 이벤트 위임: 언어 버튼 클릭이 모듈 로드/타이밍과 무관하게 항상 동작하도록
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest(".lang-btn") : null;
    if (!btn) return;
    const lang = btn.getAttribute("data-lang");
    if (lang === "ko" || lang === "en" || lang === "ja") setLanguage(lang);
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
}

