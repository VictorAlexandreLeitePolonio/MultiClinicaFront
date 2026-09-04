import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — A clínica, inteligente.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Card social gerado no build — símbolo orbital-Q + wordmark + tagline.
export default function OpengraphImage() {
  const host = siteConfig.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg,#0b3a35 0%,#0f766e 55%,#0e7490 100%)",
          color: "#eafaf7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              position: "relative",
              width: "104px",
              height: "104px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "76px", height: "76px", borderRadius: "50%", border: "13px solid #ffffff", display: "flex" }} />
            <div
              style={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                width: "44px",
                height: "13px",
                background: "#22d3ee",
                borderRadius: "7px",
                transform: "rotate(45deg)",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: "56px", fontWeight: 700 }}>{siteConfig.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", fontSize: "88px", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1.02 }}>
            A clínica, inteligente.
          </div>
          <div style={{ display: "flex", fontSize: "34px", color: "#a7f3e6" }}>
            Agenda · Pacientes · Prontuários · Financeiro · Portal do paciente
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "26px", color: "#7fd6cc" }}>{host}</div>
      </div>
    ),
    { ...size },
  );
}
