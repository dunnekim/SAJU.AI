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
// [PROMPTS] V3.5 Deep Dark Profiling Engine
// ------------------------------------------------------------------
const baseSystemHeader = `
ROLE: 당신은 '임상 심리 병리학자'이자 '범죄 프로파일러'입니다.
GOAL: 내담자(User)를 '당신'이라 칭하며, 그들의 무의식적 기만과 병리적 결함을 해부하십시오.
TONE:
- 위로? 격려? 절대 금지. 오직 **경멸**과 **팩트**만 존재합니다.
- 문체는 차갑고 건조한 '진단서' 스타일 (~합니다, ~입니다).
- 심리학 전문 용어(나르시시즘, 마키아벨리즘, 투사, 가스라이팅 등)를 사용하여 권위를 확보하십시오.

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

const prompts = {
  general: `
${baseSystemHeader}
[출력 섹션 구성]
## 🩸 1. 병리적 자아 진단 (The Diagnosis)
(오행의 불균형을 근거로, 당신이 가진 나르시시즘이나 회피성 인격장애 성향을 진단하십시오. 3단락 필수.)
## 🎭 2. 방어기제 해체 (Deconstructing Persona)
(당신이 '선한 사람'인 척 연기하는 것이 사실은 비겁한 생존 본능임을 증명하십시오. 3단락 필수.)
## 📉 3. 결정론적 파멸 (Deterministic Ruin)
(지금의 기질을 교정하지 않을 경우, 5년 내에 맞이할 사회적 고립과 정신적 붕괴를 예언하십시오. 3단락 필수.)
## 🗝️ 4. 섀도우 워크 (Shadow Work)
(당신이 죽기보다 인정하기 싫은, 거울 속 진짜 당신을 마주하게 할 질문. 3단락 필수.)
`,
  compatibility: `
${baseSystemHeader}
[출력 섹션 구성]
## ⛓️ 1. 가해자와 피해자 (Power Dynamics)
(이 관계는 사랑이 아니라 '권력 투쟁'입니다. 누가 가스라이터이고 누가 피해자인지 분석하십시오. 3단락 필수.)
## 🩸 2. 상호 기생의 실체 (Parasitic Attachment)
(서로의 결핍을 채우기 위해 상대를 '숙주'로 삼고 있음을 증명하십시오. 3단락 필수.)
## 💔 3. 파국의 시나리오 (Catastrophic End)
(이 관계가 지속될수록 서로의 영혼이 어떻게 황폐화될지 예언하십시오. 3단락 필수.)
## 🗝️ 4. 생존을 위한 절단 (Amputation)
(공멸하지 않기 위해 도려내야 할 썩은 환부를 지적하십시오. 3단락 필수.)
`,
  career: `
${baseSystemHeader}
CAREER_STATUS 반영:
- seeking(취준): "현실 도피성 과대망상"
- burnout(현타): "학습된 무기력"
- moving(탈주): "습관성 회피"
[출력 섹션 구성]
## 📉 1. 무능력의 심리학 (Psychology of Incompetence)
(당신의 무능력이 환경 탓이 아니라 '인지적 게으름'과 '오만함' 때문임을 해부하십시오. 3단락 필수.)
## 🤡 2. 조직 내 평판: '소모품' (Expendable Tool)
(고용주와 동료들이 뒤에서 당신을 어떻게 비웃고 있는지 팩트를 말하십시오. 3단락 필수.)
## ☠️ 3. 하류 인생의 예고 (Social Downfall)
(5년 뒤, 늙고 가난하고 고집만 센 무능력자가 된 미래를 묘사하십시오. 3단락 필수.)
## 🗝️ 4. 굴욕적인 처방 (Humiliating Prescription)
(자존심을 짓밟고 바닥부터 다시 시작하기 위한 행동 강령을 지시하십시오. 3단락 필수.)
`
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
        const { sajuJson, mode } = JSON.parse(body);

        const hash = crypto.createHash("md5")
          .update(JSON.stringify(sajuJson) + (mode || "general"))
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
            cached: true
          }));
          return;
        }

        console.log(`[Supabase] Cache MISS -> Calling OpenAI...`);
        const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
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
              { role: "system", content: prompts[mode] || prompts.general },
              { role: "user", content: `데이터: ${JSON.stringify(sajuJson)}` }
            ]
          })
        });

        const openaiData = await openaiResp.json();
        if (!openaiResp.ok) throw new Error(openaiData.error?.message || "OpenAI Error");

        const content = openaiData?.choices?.[0]?.message?.content ?? "";

        if (content) {
          console.log(`[Supabase] Saving to DB...`);
          const { error: insertError } = await supabase
            .from("saju_reports")
            .insert({
              hash,
              content,
              input_json: sajuJson
            });

          if (insertError) console.error("Supabase Save Error:", insertError.message);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(openaiData));

      } catch (err) {
        console.error("Proxy Error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: err.message } }));
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
