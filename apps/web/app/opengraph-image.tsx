import { ImageResponse } from "next/og";

export const alt = "Hack the Andes — hackathon selectivo de IA en Lima";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0b0d10",
        color: "#f5f5f5",
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#d6ff00",
        }}
      >
        <span>Hackathon selectivo de IA</span>
        <span>Lima · 10–11 oct 2026</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            fontSize: 128,
            lineHeight: 0.86,
            letterSpacing: "-0.04em",
            fontWeight: 700,
          }}
        >
          Hack the
        </div>
        <div
          style={{
            fontSize: 128,
            lineHeight: 0.86,
            letterSpacing: "-0.04em",
            fontWeight: 700,
            color: "#d6ff00",
          }}
        >
          Andes
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          color: "#c5c8d0",
        }}
      >
        <span>No vienes a mirar. Vienes a construir.</span>
        <span style={{ color: "#0057ff" }}>Con el apoyo de Chofex</span>
      </div>
    </div>,
    { ...size },
  );
}
