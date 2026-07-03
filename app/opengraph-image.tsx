import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VíaSur — Directorio de servicios locales del sur de Costa Rica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "linear-gradient(135deg, #312e81 0%, #1e3a8a 55%, #059669 100%)",
        }}
      >
        <svg width="220" height="220" viewBox="0 0 512 512">
          <g transform="translate(256 266)">
            <path
              d="M -108 -96 L -18 84 Q 0 122 18 84 L 108 -96"
              fill="none"
              stroke="#ffffff"
              strokeWidth="34"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="108" r="17" fill="#ffffff" />
          </g>
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 48,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            VíaSur
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#d1fae5",
              marginTop: 16,
            }}
          >
            Servicios locales del sur de Costa Rica
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
