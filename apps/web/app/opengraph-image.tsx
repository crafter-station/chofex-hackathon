import { ImageResponse } from "next/og";

export const alt =
  "Hack the Andes — 100 builders, 3 challenges, Lima, 17–18 de octubre";
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
        backgroundColor: "#0b1726",
        color: "#f3efe7",
        padding: "72px 80px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {[540, 420, 300].map((diameter) => (
        <div
          key={diameter}
          style={{
            display: "flex",
            position: "absolute",
            width: diameter,
            height: diameter,
            borderRadius: 999,
            border: "2px solid rgba(243,239,231,0.10)",
            right: 120 - diameter / 2,
            top: 315 - diameter / 2,
          }}
        />
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          fontSize: 22,
          color: "#ddcfbd",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "flex" }}>Lima, 17–18 oct 2026</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 840,
        }}
      >
        <div style={{ display: "flex", fontSize: 110, lineHeight: 0.9 }}>
          Hack the Andes
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 700,
            fontSize: 32,
            lineHeight: 1.25,
            color: "#ddcfbd",
          }}
        >
          100 builders con experiencia. 3 challenges. 30 horas.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 22,
          color: "rgba(243,239,231,0.72)",
        }}
      >
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ display: "flex" }}>100 cupos</div>
          <div style={{ display: "flex" }}>Equipos de 1–4</div>
          <div style={{ display: "flex" }}>Presencial</div>
        </div>
        <div style={{ display: "flex", color: "#6f98f0" }}>
          Sponsor principal: Chofex
        </div>
      </div>
    </div>,
    { ...size },
  );
}
