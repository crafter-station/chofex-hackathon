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
        backgroundColor: "#0b0d10",
        color: "#f5f5f5",
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#d6ff00",
        }}
      >
        <div style={{ display: "flex" }}>Hackathon selectivo de IA</div>
        <div style={{ display: "flex" }}>Lima · 17–18 oct 2026</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 108, lineHeight: 1 }}>
          Hack the
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 108,
            lineHeight: 1,
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
        <div style={{ display: "flex" }}>
          No vienes a mirar. Vienes a construir.
        </div>
        <div style={{ display: "flex", color: "#0057ff" }}>
          Con el apoyo de Chofex
        </div>
      </div>
    </div>,
    { ...size },
  );
}
