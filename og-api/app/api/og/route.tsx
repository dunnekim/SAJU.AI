import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const mbti = searchParams.get("mbti")?.toUpperCase().slice(0, 4) || "????";
    const element = (searchParams.get("element") || "Soul").slice(0, 20);
    const keyword = (searchParams.get("keyword") || "Your Dark Truth").slice(0, 30);
    const lang = searchParams.get("lang") || "en";

    // Single font for Edge; for full KO/JA glyphs deploy with Noto Sans KR/JP URLs
    const fontUrl = "https://fonts.gstatic.com/s/notosans/v35/o-0IIpQlx3QUlC5A4PNr5TRA.woff2";
    const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const fontName = "Noto Sans";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#050505",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #202020 2%, transparent 0%), radial-gradient(circle at 75px 75px, #202020 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            color: "white",
            fontFamily: `"${fontName}", sans-serif`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#888",
              marginBottom: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {mbti} <span style={{ margin: "0 15px", color: "#555" }}>×</span> {element}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.1,
              color: "#ff4d4d",
              padding: "0 40px",
            }}
          >
            {keyword}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 20,
              color: "#444",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            FATE.AI · SHADOW REPORT
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: fontName,
            data: fontData,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("OG image error:", message);
    return new Response("Failed to generate the image", { status: 500 });
  }
}
