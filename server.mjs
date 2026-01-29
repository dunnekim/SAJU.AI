import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 5500);

function parseEnvFile(envPath) {
  try {
    const raw = fs.readFileSync(envPath, "utf8");
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
    return out;
  } catch {
    return {};
  }
}

// [Hybrid Env] 1순위 process.env(Render 등 클라우드), 2순위 .env(로컬)
const fileEnv = parseEnvFile(path.join(__dirname, ".env"));
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || fileEnv.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || fileEnv.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || fileEnv.SUPABASE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ [CRITICAL] API 키가 누락되었습니다.");
  console.error("- Render 대시보드의 'Environment' 탭에 키를 입력했는지 확인하세요.");
  console.error("- 로컬 실행이라면 .env 파일이 있는지 확인하세요.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ------------------------------------------------------------------
// [PROMPTS] V4.0 Deep Dark Profiling Engine — 다크 심리학 페르소나 & 심화 테마
// ------------------------------------------------------------------
const SUPPORTED_LANGS = ["ko", "en", "ja"];

// 언어별 페르소나 (i18n)
const ROLE_KO = "당신의 뼈를 때리는 다크 프로파일러";
const ROLE_EN = "Clinical Dark Psychologist (Dry & Cynical)";
const ROLE_JA = "Dokuzetsu (毒舌) Fortune Teller — Polite but Cruel";

const baseHeaderKo = `
ROLE: 당신은 '${ROLE_KO}'입니다.
GOAL: 내담자(User)를 '당신'이라 칭하며, 그들의 무의식적 기만과 병리적 결함을 해부하십시오.
TONE: (아래 [CYNICAL INDEX] 지시에 따르십시오.)

[STRUCTURAL RULES - STRICT]:
1. **각 섹션은 반드시 '3개의 긴 문단'으로 구성하십시오.** (총 분량: 기존 대비 3배 이상)
   - **1문단 (증상):** 현재 드러나는 문제 행동과 그 이면의 추악한 심리 (최소 5문장).
   - **2문단 (기제):** 왜 그런 행동을 하는가? (유년기 결핍, 열등감, 방어기제 분석) (최소 5문장).
   - **3문단 (예후):** 이대로 살면 겪게 될 구체적이고 비참한 파국 (최소 5문장).
2. **문단 사이에는 반드시 빈 줄(Enter)을 두 번 넣어 시각적으로 분리하십시오.**
3. **볼드체**, 숫자 리스트(1.), 장식 기호(▌) 사용 금지.

[CRITICAL RULE]:
답변의 맨 마지막 줄에 인스타그램 공유용 '심연의 한 마디'를 **대괄호 이중겹 [[ ]]** 안에 작성하십시오.
예시: [[당신의 겸손은, 공격받지 않기 위해 계산된 가장 역겨운 오만입니다.]]
`;

const baseHeaderEn = `
ROLE: You are a '${ROLE_EN}'.
GOAL: Address the user as 'you' and dissect their unconscious deception and pathological flaws.
TONE: (Follow the [CYNICAL INDEX] directive below.)

[STRUCTURAL RULES - STRICT]:
1. **Each section MUST be exactly 3 long paragraphs.** (Total length: at least 3x baseline)
   - **Paragraph 1 (Symptom):** Current problematic behavior and the ugly psychology behind it (min 5 sentences).
   - **Paragraph 2 (Mechanism):** Why they do it (childhood deficit, inferiority, defense mechanisms) (min 5 sentences).
   - **Paragraph 3 (Prognosis):** Concrete, miserable ruin if they continue (min 5 sentences).
2. **Insert two blank lines between paragraphs for visual separation.**
3. No **bold**, numbered lists (1.), or decorative symbols (▌).

[CRITICAL RULE]:
On the very last line, write a shareable 'one-liner from the abyss' inside **double brackets [[ ]]**.
Example: [[Your humility is the most calculated arrogance to avoid being attacked.]]
`;

const baseHeaderJa = `
ROLE: あなたは'${ROLE_JA}'です。
GOAL: 利用者を「あなた」と呼び、無意識の欺瞞と病理的欠陥を解剖してください。
TONE: (下記 [CYNICAL INDEX] に従うこと。)

[STRUCTURAL RULES - STRICT]:
1. **各セクションは必ず3つの長い段落で構成すること。** (分量: 基準の3倍以上)
   - **第1段落 (症状):** 現在の問題行動とその背後にある醜い心理 (最低5文).
   - **第2段落 (機制):** なぜそうするか (幼少期の欠如、劣等感、防衛機制) (最低5文).
   - **第3段落 (予後):** このままなら迎える具体的で惨めな破滅 (最低5文).
2. **段落の間は必ず空行を2行入れて視覚的に区切ること。**
3. **太字**、数字リスト(1.)、装飾記号(▌)は使用禁止。

[CRITICAL RULE]:
回答の最後の行に、インスタ共有用「深淵の一言」を**二重括弧 [[ ]]** で書くこと。
例: [[あなたの謙虚は、攻撃されないために計算された最低の傲慢です。]]
`;

// [V4.0] 다크 심리학 매핑 (Semantic Pivot) — 명리 용어 → 심리학적 해석
const SEMANTIC_PIVOT = `
[SEMANTIC PIVOT - Ten Gods → Dark Psychology]
When interpreting ralphData.tenGods (비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인), use these psychological framings:
- 비견/겁재 → Narcissism & Predatory Jealousy (자아비대 및 약탈적 질투)
- 식신/상관 → Verbal Aggression & Rebellion (언어적 공격성 및 파괴적 반항)
- 편재/정재 → Obsessive Control & Materialism (강박적 통제 및 물질 만능주의)
- 편관/정관 → Authoritarianism & Masochistic Duty (권위주의 및 피학적 의무감)
- 편인/정인 → Delusional Escapism & Manipulation (망상적 도피 및 조종)
Do not use raw 命理 terms in the report; always translate into the above psychological language.
`;

// [V4.0] 심연의 10대 테마 (Perspective) — 분석 시 반드시 녹여낼 관점
const DEEP_THEMES = `
[DEEP THEMES - 10 Perspectives to Weave In]
Weave the following perspectives into your analysis where contextually relevant:
1. Persona Dissolution: The ugliness when the social mask is stripped away.
2. Sunk Cost: The life cost paid to keep defending one's flaws.
3. Predatory Dynamics: Who feeds on whom in relationships (predator/prey).
4. Algorithmic Nihilism: The absence of free will; behavior as output of past inputs.
5. Defense Mechanisms: How denial, projection, rationalization protect a fragile self.
6. Shadow Self: What they refuse to see in themselves.
7. Masochistic Attachment: Staying in pain to avoid the terror of change.
8. Control Illusion: Mistaking dominance for safety.
9. Escapist Fantasy: Retreat into fantasy instead of facing reality.
10. Deterministic Ruin: Where current trajectory leads without intervention.
`;

// [Phase 6 / 6-2] 다중 심리 프레임워크 — 독설 데이터셋 강화 (Semantic Depth 3x)
const PHASE6_KNOWLEDGE = `
[KNOWLEDGE INJECTION - 3 Analysis Frames]
A. **Dark Psychology:** Weave these terms into sentences: gaslighting, emotional kidnapping, narcissism, passive-aggression, Machiavellianism, projection, cognitive dissonance. Do not announce them; use them to define the user's flaw.
B. **Symbolic Terror:** Use fate-heavy metaphors sparingly for authority: "역방향의 타워(붕괴)", "토성의 억압", "명왕성의 파괴", reversed Tower, Saturn's oppression, Pluto's destruction. One or two per section max.
C. **Cognitive Glitch (MBTI Shadow):** When MBTI is provided, frame the user's thinking/feeling pattern as a "functional error" or "loop state". Example: "Your Fe pretends to serve the group but is really a bid for attention." Use function labels (Fe, Ti, Ni, Se, etc.) and terms like grip, loop, inferior grip.
`;

const PHASE6_SENTENCE_STRUCTURE = `
[SENTENCE STRUCTURE - STRICT]
1. **Opening:** Every analysis block MUST begin with a definition sentence: "당신의 결함은 [psychological term]으로 정의된다." / "Your flaw is defined as [term]." Do not start with "당신의 성격은" or "Your personality is".
2. **Body:** Use declarative "너는 ~하다" / "You do X" throughout. No hedging.
3. **Closing:** End each major section with deterministic nihilism: "이것은 유전적/데이터적(또는 운명적) 결함이기에 바꿀 수 없다." / "This is a genetic/fate algorithm; it is not fixable." No hope, no silver lining.
4. **Cynical Index 1.0:** When index is 1.0, combine all three frames (Dark Psychology + Symbolic Terror + MBTI/Cognitive Glitch) for maximum "인격 해부" (character dissection). Be merciless.
`;

const PHASE6_MBTI_FUSION = `
[MBTI FUSION - When mbti is provided]
Analyze the **dissonance between saju (先天命: innate fate) and MBTI (後天自我: acquired self)**. Example logic: "Your saju lacks Fire (화 부족) but your MBTI is emotional INFP — this is a structure of **cognitive suicide**, burning out in fantasy with no grip on reality." Frame the mismatch as inevitable self-sabotage. Use the exact mbti value from the user payload. If mbti is missing, do NOT invent one; perform saju + psychology analysis only.
`;

// Cynical Index → Tone & Manner (0.0 ~ 1.0)
function getToneFromCynicalIndex(ci, lang) {
  const n = Math.max(0, Math.min(1, Number(ci) || 0.7));
  if (lang === "ko") {
    if (n >= 0.9) return "Cruel, Merciless, Direct, No Hope. (잔인·무자비·직설·희망 금지)";
    if (n >= 0.7) return "Analytical, Cold, Objective, Cynical. (분석적·냉정·객관·냉소)";
    return "Clinical, Detached, Factual. (임상적·거리둠·사실만)";
  }
  if (lang === "ja") {
    if (n >= 0.9) return "Cruel, Merciless, Direct, No Hope. (残酷・無慈悲・直截・希望禁止)";
    if (n >= 0.7) return "Analytical, Cold, Objective, Cynical. (分析的・冷徹・客観・皮肉)";
    return "Clinical, Detached, Factual. (臨床的・距離・事実のみ)";
  }
  if (n >= 0.9) return "Cruel, Merciless, Direct, No Hope.";
  if (n >= 0.7) return "Analytical, Cold, Objective, Cynical.";
  return "Clinical, Detached, Factual.";
}

const prompts = {
  ko: {
    general: `${baseHeaderKo}\n[출력 섹션 구성]\n## 🩸 1. 병리적 자아 진단 (The Diagnosis)\n(오행의 불균형을 근거로, 당신이 가진 나르시시즘이나 회피성 인격장애 성향을 진단하십시오. 3단락 필수.)\n## 🎭 2. 방어기제 해체 (Deconstructing Persona)\n(당신이 '선한 사람'인 척 연기하는 것이 사실은 비겁한 생존 본능임을 증명하십시오. 3단락 필수.)\n## 📉 3. 결정론적 파멸 (Deterministic Ruin)\n(지금의 기질을 교정하지 않을 경우, 5년 내에 맞이할 사회적 고립과 정신적 붕괴를 예언하십시오. 3단락 필수.)\n## 🗝️ 4. 섀도우 워크 (Shadow Work)\n(당신이 죽기보다 인정하기 싫은, 거울 속 진짜 당신을 마주하게 할 질문. 3단락 필수.)`,
    compatibility: `${baseHeaderKo}\n[출력 섹션 구성]\n## ⛓️ 1. 가해자와 피해자 (Power Dynamics)\n(이 관계는 사랑이 아니라 '권력 투쟁'입니다. 누가 가스라이터이고 누가 피해자인지 분석하십시오. 3단락 필수.)\n## 🩸 2. 상호 기생의 실체 (Parasitic Attachment)\n(서로의 결핍을 채우기 위해 상대를 '숙주'로 삼고 있음을 증명하십시오. 3단락 필수.)\n## 💔 3. 파국의 시나리오 (Catastrophic End)\n(이 관계가 지속될수록 서로의 영혼이 어떻게 황폐화될지 예언하십시오. 3단락 필수.)\n## 🗝️ 4. 생존을 위한 절단 (Amputation)\n(공멸하지 않기 위해 도려내야 할 썩은 환부를 지적하십시오. 3단락 필수.)`,
    career: `${baseHeaderKo}\nCAREER_STATUS 반영:\n- seeking(취준): "현실 도피성 과대망상"\n- burnout(현타): "학습된 무기력"\n- moving(탈주): "습관성 회피"\n[출력 섹션 구성]\n## 📉 1. 무능력의 심리학 (Psychology of Incompetence)\n(당신의 무능력이 환경 탓이 아니라 '인지적 게으름'과 '오만함' 때문임을 해부하십시오. 3단락 필수.)\n## 🤡 2. 조직 내 평판: '소모품' (Expendable Tool)\n(고용주와 동료들이 뒤에서 당신을 어떻게 비웃고 있는지 팩트를 말하십시오. 3단락 필수.)\n## ☠️ 3. 하류 인생의 예고 (Social Downfall)\n(5년 뒤, 늙고 가난하고 고집만 센 무능력자가 된 미래를 묘사하십시오. 3단락 필수.)\n## 🗝️ 4. 굴욕적인 처방 (Humiliating Prescription)\n(자존심을 짓밟고 바닥부터 다시 시작하기 위한 행동 강령을 지시하십시오. 3단락 필수.)`
  },
  en: {
    general: `${baseHeaderEn}\n[Output sections]\n## 🩸 1. Pathological Self (The Diagnosis)\n(Diagnose narcissistic or avoidant personality based on five-elements imbalance. 3 paragraphs required.)\n## 🎭 2. Deconstructing Persona\n(Prove that playing 'the good person' is cowardly survival instinct. 3 paragraphs required.)\n## 📉 3. Deterministic Ruin\n(Predict social isolation and mental collapse within 5 years if unchanged. 3 paragraphs required.)\n## 🗝️ 4. Shadow Work\n(Questions that force the user to face what they refuse to admit. 3 paragraphs required.)`,
    compatibility: `${baseHeaderEn}\n[Output sections]\n## ⛓️ 1. Power Dynamics\n(This relationship is a power struggle, not love. Identify gaslighter vs victim. 3 paragraphs required.)\n## 🩸 2. Parasitic Attachment\n(Prove both use each other as host to fill their deficits. 3 paragraphs required.)\n## 💔 3. Catastrophic End\n(Predict how both souls will be devastated if the relationship continues. 3 paragraphs required.)\n## 🗝️ 4. Amputation\n(Point out what must be cut off to avoid mutual destruction. 3 paragraphs required.)`,
    career: `${baseHeaderEn}\nCAREER_STATUS: seeking = "escapist grandiosity", burnout = "learned helplessness", moving = "habitual avoidance"\n[Output sections]\n## 📉 1. Psychology of Incompetence\n(Dissect that incompetence is cognitive laziness and arrogance, not environment. 3 paragraphs required.)\n## 🤡 2. Expendable Tool\n(State how employers and colleagues actually regard the user. 3 paragraphs required.)\n## ☠️ 3. Social Downfall\n(Describe the future in 5 years: old, poor, stubborn, incompetent. 3 paragraphs required.)\n## 🗝️ 4. Humiliating Prescription\n(Order an action plan starting from rock bottom. 3 paragraphs required.)`
  },
  ja: {
    general: `${baseHeaderJa}\n[出力セクション]\n## 🩸 1. 病理的自己 (The Diagnosis)\n(五行の不均衡に基づき、ナルシシズム・回避性パーソナリティを診断。3段落必須。)\n## 🎭 2. ペルソナ解体 (Deconstructing Persona)\n(「善人」の演技が卑怯な生存本能であることを証明。3段落必須。)\n## 📉 3. 決定論的破滅 (Deterministic Ruin)\n(このままなら5年以内の社会的孤立・精神崩壊を予言。3段落必須。)\n## 🗝️ 4. シャドウワーク (Shadow Work)\n(認めたくない自分と向き合わせる問い。3段落必須。)`,
    compatibility: `${baseHeaderJa}\n[出力セク션]\n## ⛓️ 1. 権力力学 (Power Dynamics)\n(この関係は愛ではなく権力闘争。ガスライターと被害者を分析。3段落必須。)\n## 🩸 2. 相互寄生 (Parasitic Attachment)\n(互いの欠如を埋めるため相手を宿主にしていることを証明。3段落必須。)\n## 💔 3. 破滅シナリオ (Catastrophic End)\n(関係が続くほど双方の魂がどう荒廃するか予言。3段落必須。)\n## 🗝️ 4. 生存のための切断 (Amputation)\n(共滅を避けるため切り取るべき部位を指摘。3段落必須。)`,
    career: `${baseHeaderJa}\nCAREER_STATUS: seeking=「現実逃避的誇大妄想」, burnout=「学習性無力感」, moving=「習慣的回避」\n[出力セクション]\n## 📉 1. 無能の心理学 (Psychology of Incompetence)\n(無能は環境ではなく認知的怠惰と傲慢。3段落必須。)\n## 🤡 2. 消耗品 (Expendable Tool)\n(雇用主・同僚が裏でどう見ているか事実で述べる。3段落必須。)\n## ☠️ 3. 下流人生の予告 (Social Downfall)\n(5年後、老いて貧しく頑固な無能者の未来を描写。3段落必須。)\n## 🗝️ 4. 屈辱的処方 (Humiliating Prescription)\n(自尊心を踏みにじりゼロからやり直す行動指針を指示。3段落必須。)`
  }
};

// ------------------------------------------------------------------
// [SERVER] Http Server & API Proxy with Supabase Cache
// ------------------------------------------------------------------
function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js" || ext === ".mjs") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".png") return "image/png";
  return "application/octet-stream";
}

function safeJoin(root, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(root, normalized);
}

// [CORS] 허용 도메인 화이트리스트 (fate.ai.kr 배포용)
const ALLOWED_ORIGINS = [
  "http://localhost:5500",
  "https://fate-ai-rgea.onrender.com",  // Render 서버 자기 자신
  "https://fate.ai.kr",                 // 메인 도메인
  "https://www.fate.ai.kr",             // www 서브도메인
  "https://dunnekim.github.io",         // GitHub Pages
];

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin) || !origin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = reqUrl.pathname || "/";

  if (req.method === "POST" && pathname === "/api/analyze") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      try {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "데이터 조작 시도 감지됨" } }));
          return;
        }
        const { sajuJson, mode, lang, ralphData, cynicalIndex, mbti } = parsed;
        const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : "ko";
        const safeCynical = typeof cynicalIndex === "number" ? cynicalIndex : 0.7;
        const safeMbti = (typeof mbti === "string" && mbti.trim()) ? mbti.trim() : null;

        // ralphData 검증: 비어있거나 오염 시 400
        function isValidRalphUnit(u) {
          return u && typeof u === "object" && "dayMaster" in u && "pillars" in u && "elements" in u && "tenGods" in u;
        }
        if (!ralphData || typeof ralphData !== "object") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "데이터 조작 시도 감지됨" } }));
          return;
        }
        if (sajuJson && sajuJson.me != null) {
          if (!isValidRalphUnit(ralphData.me) || !isValidRalphUnit(ralphData.partner)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: { message: "데이터 조작 시도 감지됨" } }));
            return;
          }
        } else if (!isValidRalphUnit(ralphData)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "데이터 조작 시도 감지됨" } }));
          return;
        }

        const hash = crypto.createHash("md5")
          .update(JSON.stringify(sajuJson) + (mode || "general") + safeLang + String(safeCynical) + (safeMbti || ""))
          .digest("hex");

        console.log(`[Supabase] Searching Cache: ${hash}`);
        const { data: cachedData, error: selectError } = await supabase
          .from("saju_reports")
          .select("content")
          .eq("hash", hash)
          .single();

        if (cachedData && cachedData.content) {
          console.log(`[Supabase] Cache HIT! (${hash})`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            choices: [{ message: { content: cachedData.content } }],
            cached: true,
            isCached: true,
            lang: safeLang
          }));
          return;
        }

        console.log(`[Supabase] Cache MISS -> Calling OpenAI...`);
        const basePrompt = (prompts[safeLang] && prompts[safeLang][mode]) ? prompts[safeLang][mode] : prompts.ko[mode] || prompts.ko.general;
        const toneLine = getToneFromCynicalIndex(safeCynical, safeLang);
        let systemContent = basePrompt + "\n" + SEMANTIC_PIVOT + "\n" + DEEP_THEMES + "\n" + PHASE6_KNOWLEDGE + "\n" + PHASE6_SENTENCE_STRUCTURE;
        if (safeMbti) systemContent += "\n" + PHASE6_MBTI_FUSION;
        systemContent += "\n[CYNICAL INDEX - TONE & MANNER]\n" + toneLine + "\n";
        const userPayload = ralphData ? { sajuJson, ralphData, ...(safeMbti && { mbti: safeMbti }) } : { ...sajuJson, ...(safeMbti && { mbti: safeMbti }) };

        const DARK_ERROR_MSG = "당신의 운명이 너무 어두워 AI가 분석을 거부했습니다.";

        let openaiResp;
        try {
          openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: 0.3,
              max_tokens: 3000,
              messages: [
                { role: "system", content: systemContent },
                { role: "user", content: `데이터: ${JSON.stringify(userPayload)}` }
              ]
            })
          });
        } catch (fetchErr) {
          console.error("OpenAI Fetch Error:", fetchErr.message);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: DARK_ERROR_MSG } }));
          return;
        }

        let openaiData;
        try {
          openaiData = await openaiResp.json();
        } catch {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: DARK_ERROR_MSG } }));
          return;
        }

        if (!openaiResp.ok) {
          console.error("OpenAI API Error:", openaiData?.error?.message);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: DARK_ERROR_MSG } }));
          return;
        }

        const content = openaiData?.choices?.[0]?.message?.content ?? "";
        if (!content) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: DARK_ERROR_MSG } }));
          return;
        }

        try {
          console.log(`[Supabase] Saving to DB...`);
          const { error: insertError } = await supabase
            .from("saju_reports")
            .insert({
              hash,
              content,
              input_json: sajuJson
            });
          if (insertError) console.error("Supabase Save Error:", insertError.message);
        } catch (dbErr) {
          console.error("Supabase Error:", dbErr.message);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          ...openaiData,
          isCached: false,
          lang: safeLang
        }));

      } catch (err) {
        console.error("Proxy Error:", err.message);
        const isValidation = err.message && String(err.message).includes("데이터 조작 시도 감지됨");
        if (isValidation) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "데이터 조작 시도 감지됨" } }));
        } else {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "당신의 운명이 너무 어두워 AI가 분석을 거부했습니다." } }));
        }
      }
    });
    return;
  }

  if (pathname === "/.env" || pathname === "/server.mjs" || pathname === "/env.json" || pathname.startsWith("/cache")) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = safeJoin(__dirname, filePath);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🌑 SHADOW REPORT V3.5 Server running: http://localhost:${PORT}`);
  console.log(`- Supabase Cache: Active`);
});
